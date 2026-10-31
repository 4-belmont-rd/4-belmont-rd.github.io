import { Validator, type Schema } from "@cfworker/json-schema";
import { env } from "cloudflare:test";
import { vi } from "vitest";
import worker from "../src/index";
import { addDays, todayInLondon } from "../src/dates";
import cloudEvent from "./spec/cloudEvent.json";
import commands from "./spec/commands.json";
import discovery from "./spec/discovery.json";
import errorSchema from "./spec/error.json";
import queries from "./spec/queries.json";
import workflows from "./spec/workflows.json";

export const ORIGIN = "https://belmontcottage.co.uk";
export const ENDPOINT = `${ORIGIN}/best`;

const SPEC_SCHEMAS = [cloudEvent, commands, discovery, errorSchema, queries, workflows] as Schema[];

export function conformsTo(ref: string, value: unknown): string[] {
  const validator = new Validator({ $ref: ref }, "2020-12", false);
  for (const schema of SPEC_SCHEMAS) validator.addSchema(schema);
  const result = validator.validate(value);
  return result.valid ? [] : result.errors.map((unit) => `${unit.instanceLocation} ${unit.error}`);
}

export function conformsToSchema(schema: object, value: unknown): string[] {
  const result = new Validator(schema as Schema, "2020-12", false).validate(value);
  return result.valid ? [] : result.errors.map((unit) => `${unit.instanceLocation} ${unit.error}`);
}

export const today = todayInLondon();
export const day = (offset: number) => addDays(today, offset);

export function calendar(stays: [number, number][]): string {
  const events = stays.map(
    ([start, end], index) =>
      [
        "BEGIN:VEVENT",
        `DTEND;VALUE=DATE:${day(end).replaceAll("-", "")}`,
        `DTSTART;VALUE=DATE:${day(start).replaceAll("-", "")}`,
        `UID:stay-${index}@airbnb.com`,
        "SUMMARY:Reserved",
        "END:VEVENT",
      ].join("\r\n"),
  );
  return ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Airbnb Inc//Hosting Calendar//EN", ...events, "END:VCALENDAR"].join("\r\n");
}

export interface Upstream {
  calendar: string | null;
  formSubmit: () => Response;
  emails: { url: string; headers: Headers; body: Record<string, string> }[];
}

export function mockUpstream(): Upstream {
  const upstream: Upstream = {
    calendar: calendar([
      [10, 15],
      [20, 22],
    ]),
    formSubmit: () => Response.json({ success: "true", message: "The form was submitted successfully." }),
    emails: [],
  };
  vi.spyOn(globalThis, "fetch").mockImplementation(async (input, init) => {
    const request = new Request(input, init);
    if (request.url === env.AIRBNB_ICAL_URL) {
      return upstream.calendar === null ? new Response("down", { status: 500 }) : new Response(upstream.calendar);
    }
    if (request.url === env.FORMSUBMIT_URL) {
      upstream.emails.push({ url: request.url, headers: request.headers, body: await request.json() });
      return upstream.formSubmit();
    }
    throw new Error(`Unexpected fetch ${request.url}`);
  });
  return upstream;
}

let clientCounter = 0;

export function newClient(): string {
  clientCounter += 1;
  return `10.0.${Math.floor(clientCounter / 250)}.${clientCounter % 250}`;
}

export async function call(path: string, init: RequestInit & { client?: string } = {}): Promise<Response> {
  const headers = new Headers(init.headers);
  headers.set("CF-Connecting-IP", init.client ?? newClient());
  const request = new Request(`${ORIGIN}${path}`, { ...init, headers }) as Request<unknown, IncomingRequestCfProperties>;
  return worker.fetch(request, env);
}

export async function getJson<T = any>(path: string): Promise<{ status: number; body: T; response: Response }> {
  const response = await call(path);
  return { status: response.status, body: (await response.json()) as T, response };
}

export function bookingCommand(overrides: Record<string, unknown> = {}, data: Record<string, unknown> = {}) {
  return {
    specversion: "1.0",
    id: crypto.randomUUID(),
    source: "https://agent.example.com",
    type: "RequestBooking",
    datacontenttype: "application/json",
    dataschema: `${ENDPOINT}/commands/request-booking/1.0`,
    time: new Date().toISOString(),
    data: {
      checkIn: day(30),
      checkOut: day(33),
      guests: 4,
      name: "Ada Lovelace",
      email: "ada@example.com",
      ...data,
    },
    ...overrides,
  };
}

export function postCommand(body: unknown, client: string, contentType = "application/cloudevents+json") {
  return call("/best/commands", {
    method: "POST",
    headers: { "Content-Type": contentType },
    body: typeof body === "string" ? body : JSON.stringify(body),
    client,
  });
}
