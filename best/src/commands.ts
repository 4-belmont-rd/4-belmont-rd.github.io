import { fetchBookedStays, isFree, nearestFreeRanges } from "./calendar";
import { REQUEST_BOOKING, requestBookingDataSchema } from "./catalogue";
import { latestCheckOut, todayInLondon } from "./dates";
import { error, json } from "./http";
import { DeliveryFailed, sendBookingEmail } from "./mailer";
import { quote, rangeProblem } from "./queries";
import { validate } from "./validation";

export const MAX_BODY_BYTES = 16_384;
const MAX_ATTRIBUTES = 20;
const ACCEPTED_CONTENT_TYPES = ["application/cloudevents+json", "application/json"];

const ENVELOPE_SCHEMA = {
  type: "object",
  required: ["specversion", "id", "source", "type", "datacontenttype", "dataschema", "time", "data"],
  properties: {
    specversion: { const: "1.0" },
    id: { type: "string", minLength: 1, maxLength: 200 },
    source: { type: "string", minLength: 1, maxLength: 500 },
    type: { type: "string", pattern: "^[A-Z][a-zA-Z0-9]*$" },
    datacontenttype: { const: "application/json" },
    dataschema: { type: "string", format: "uri", maxLength: 500 },
    time: { type: "string", format: "date-time" },
    correlationid: { type: "string", minLength: 1, maxLength: 200 },
    data: { type: "object" },
  },
  additionalProperties: { type: ["string", "number", "boolean"], maxLength: 500 },
  maxProperties: MAX_ATTRIBUTES,
};

const DATA_SCHEMA = requestBookingDataSchema();

interface BookingData {
  checkIn: string;
  checkOut: string;
  guests: number;
  name: string;
  email?: string;
  phone?: string;
  message?: string;
}

interface Envelope {
  id: string;
  type: string;
  correlationid?: string;
  data: BookingData;
}

export async function submitCommand(request: Request, env: Env): Promise<Response> {
  const mediaType = (request.headers.get("Content-Type") ?? "").split(";")[0].trim().toLowerCase();
  if (!ACCEPTED_CONTENT_TYPES.includes(mediaType)) {
    return error(415, "UNSUPPORTED_MEDIA_TYPE", `Send the command as ${ACCEPTED_CONTENT_TYPES.join(" or ")}.`, {
      accepted: ACCEPTED_CONTENT_TYPES,
    });
  }

  const text = await readLimited(request, MAX_BODY_BYTES);
  if (text === null) {
    return error(413, "PAYLOAD_TOO_LARGE", `Command bodies are limited to ${MAX_BODY_BYTES} bytes.`, {
      limit_bytes: MAX_BODY_BYTES,
    });
  }

  let body: unknown;
  try {
    body = JSON.parse(text);
  } catch {
    return error(400, "INVALID_JSON", "The request body is not valid JSON.");
  }

  const envelopeProblems = validate(ENVELOPE_SCHEMA, body);
  if (envelopeProblems.length) {
    const [first] = envelopeProblems;
    return error(400, "INVALID_ENVELOPE", `Envelope attribute '${first.field}': ${first.problem}`, {
      field: first.field,
      problems: envelopeProblems,
    });
  }
  const envelope = body as Envelope;

  if (envelope.type !== REQUEST_BOOKING.commandType) {
    return error(400, "UNKNOWN_COMMAND_TYPE", `This service does not accept '${envelope.type}' commands.`, {
      field: "type",
      accepted: [REQUEST_BOOKING.commandType],
    });
  }

  const dataProblems = validate(DATA_SCHEMA, envelope.data);
  if (dataProblems.length) {
    const [first] = dataProblems;
    return error(400, "INVALID_DATA", `'data.${first.field}': ${first.problem}`, {
      field: `data.${first.field}`,
      problems: dataProblems.map(({ field, problem }) => ({ field: `data.${field}`, problem })),
    });
  }

  const ledger = env.LEDGER.get(env.LEDGER.idFromName("commands"));
  const hash = await fingerprint(envelope);
  const previous = await ledger.lookup(envelope.id, hash);
  if (previous.kind !== "new") return answerExisting(envelope.id, previous);

  const { data } = envelope;
  const problem = rangeProblem(data.checkIn, data.checkOut, "checkIn", "checkOut");
  if (problem) return error(400, problem.code, problem.message, { field: `data.${problem.field}` });

  const booked = await fetchBookedStays(env);
  if (!isFree(booked, data.checkIn, data.checkOut)) {
    const today = todayInLondon();
    return error(
      400,
      "DATES_UNAVAILABLE",
      "The cottage is already booked for some of these nights. Offer the guest one of the alternatives, or check other dates with the availability query.",
      {
        field: "data.checkIn",
        alternatives: nearestFreeRanges(booked, data.checkIn, data.checkOut, today, latestCheckOut(today)),
      },
    );
  }

  const reservation = await ledger.reserve(envelope.id, hash, clientKey(request), Date.now());
  if (reservation.kind === "limited") {
    return error(
      429,
      "TOO_MANY_REQUESTS",
      `Too many booking requests from this network. Try again in ${reservation.retryAfterSeconds} seconds.`,
      { retryAfterSeconds: reservation.retryAfterSeconds },
      { "Retry-After": String(reservation.retryAfterSeconds) },
    );
  }
  if (reservation.kind !== "reserved") return answerExisting(envelope.id, reservation);

  try {
    await sendBookingEmail(env, bookingEmail(envelope));
  } catch (cause) {
    await ledger.release(envelope.id);
    if (cause instanceof DeliveryFailed) {
      console.error(cause.message);
      return error(502, "DELIVERY_FAILED", "The booking request could not be passed to the owner. Try again shortly.");
    }
    throw cause;
  }

  const accepted = JSON.stringify({ id: envelope.id, correlationId: envelope.correlationid ?? envelope.id });
  await ledger.complete(envelope.id, 201, accepted);
  return json(JSON.parse(accepted), 201);
}

function answerExisting(
  id: string,
  existing: { kind: "conflict" } | { kind: "pending" } | { kind: "replay"; status: number; body: string },
): Response {
  switch (existing.kind) {
    case "replay":
      return json(JSON.parse(existing.body), existing.status);
    case "pending":
      return error(409, "COMMAND_IN_PROGRESS", `Command '${id}' is still being processed. Retry it shortly.`, { id });
    case "conflict":
      return error(409, "DUPLICATE_COMMAND_ID", `Command id '${id}' was already used with a different payload.`, { id });
  }
}

function bookingEmail({ id, data }: Envelope) {
  const price = quote(data.checkIn, data.checkOut);
  const fields: Record<string, string> = {
    "Start Date": data.checkIn,
    "End Date": data.checkOut,
    Nights: String(price.nights),
    Guests: String(data.guests),
    Name: data.name,
    Email: data.email ?? "",
    Phone: data.phone ?? "",
    Message: data.message ?? "",
    Total: `£${price.total.toFixed(2)}`,
    Source: "AI assistant (BEST)",
    "Request ID": id,
  };
  return {
    subject: `Booking request from ${data.name}: ${data.checkIn} to ${data.checkOut}`,
    replyTo: data.email,
    fields,
  };
}

async function fingerprint(envelope: Envelope): Promise<string> {
  const canonical = JSON.stringify([envelope.type, envelope.correlationid ?? null, sortKeys(envelope.data)]);
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(canonical));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function sortKeys(value: object): [string, unknown][] {
  return Object.entries(value).sort(([a], [b]) => a.localeCompare(b));
}

export function clientKey(request: Request): string {
  const ip = request.headers.get("CF-Connecting-IP");
  if (!ip) return "unknown";
  if (!ip.includes(":")) return ip;
  const [head, tail = ""] = ip.split("::");
  const headGroups = head ? head.split(":") : [];
  const tailGroups = tail ? tail.split(":") : [];
  const groups = ip.includes("::")
    ? [...headGroups, ...Array(8 - headGroups.length - tailGroups.length).fill("0"), ...tailGroups]
    : headGroups;
  return `${groups.slice(0, 4).map((group) => parseInt(group, 16).toString(16)).join(":")}::/64`;
}

async function readLimited(request: Request, limit: number): Promise<string | null> {
  const declared = Number(request.headers.get("Content-Length"));
  if (declared > limit) return null;
  if (!request.body) return "";
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > limit) {
      await reader.cancel();
      return null;
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder().decode(bytes);
}
