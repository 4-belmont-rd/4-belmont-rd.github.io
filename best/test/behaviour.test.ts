import { beforeEach, describe, expect, it } from "vitest";
import { parseBookedStays } from "../src/calendar";
import { MAX_BODY_BYTES, clientKey } from "../src/commands";
import { BOOKING_HORIZON_DAYS } from "../src/dates";
import { type Upstream, bookingCommand, call, day, getJson, mockUpstream, newClient, postCommand } from "./helpers";

let upstream: Upstream;

beforeEach(() => {
  upstream = mockUpstream();
});

describe("property queries", () => {
  it("describes the cottage without the house number", async () => {
    const { body } = await getJson("/best/queries/property-description");
    expect(body.name).toBe("Belmont Road, Whitstable");
    expect(body.location).toMatchObject({ street: "Belmont Road", town: "Whitstable" });
    expect(JSON.stringify(body)).not.toMatch(/\b4 Belmont/);
  });

  it("lists features with a maximum of six guests", async () => {
    const { body } = await getJson("/best/queries/property-features");
    expect(body.maxGuests).toBe(6);
    expect(body.bedrooms).toHaveLength(3);
  });
});

describe("availability query", () => {
  it("reports free ranges around booked stays", async () => {
    const { status, body } = await getJson(`/best/queries/availability?from=${day(5)}&to=${day(25)}`);
    expect(status).toBe(200);
    expect(body.available).toBe(false);
    expect(body.freeRanges).toEqual([
      { checkIn: day(5), checkOut: day(10), nights: 5 },
      { checkIn: day(15), checkOut: day(20), nights: 5 },
      { checkIn: day(22), checkOut: day(25), nights: 3 },
    ]);
  });

  it("allows check-in on another guest's check-out day", async () => {
    const { body } = await getJson(`/best/queries/availability?from=${day(15)}&to=${day(20)}`);
    expect(body.available).toBe(true);
  });

  it("names the missing parameter", async () => {
    const { status, body } = await getJson(`/best/queries/availability?from=${day(5)}`);
    expect(status).toBe(400);
    expect(body.error.code).toBe("INVALID_PARAMETER");
    expect(body.error.details.parameter).toBe("to");
  });

  it("names a malformed parameter", async () => {
    const { status, body } = await getJson(`/best/queries/availability?from=${day(5)}&to=2026-02-30`);
    expect(status).toBe(400);
    expect(body.error.details.parameter).toBe("to");
  });

  it("refuses an undeclared parameter", async () => {
    const { status, body } = await getJson(`/best/queries/availability?from=${day(5)}&to=${day(8)}&x=1`);
    expect(status).toBe(400);
    expect(body.error.details.parameter).toBe("x");
  });

  it("refuses past dates, reversed ranges and dates beyond the horizon", async () => {
    expect((await getJson(`/best/queries/availability?from=${day(-1)}&to=${day(3)}`)).body.error.code).toBe("DATES_IN_PAST");
    expect((await getJson(`/best/queries/availability?from=${day(5)}&to=${day(5)}`)).body.error.code).toBe("INVALID_DATE_RANGE");
    expect(
      (await getJson(`/best/queries/availability?from=${day(5)}&to=${day(BOOKING_HORIZON_DAYS + 1)}`)).body.error.code,
    ).toBe("BEYOND_BOOKING_HORIZON");
  });

  it("answers 503 when the calendar is down", async () => {
    upstream.calendar = null;
    const { status, body, response } = await getJson(`/best/queries/availability?from=${day(5)}&to=${day(8)}`);
    expect(status).toBe(503);
    expect(body.error.code).toBe("CALENDAR_UNAVAILABLE");
    expect(response.headers.get("Retry-After")).toBe("60");
  });
});

describe("booking-quote query", () => {
  it("prices a stay at the flat rate plus booking fee", async () => {
    const { body } = await getJson(`/best/queries/booking-quote?checkIn=${day(30)}&checkOut=${day(33)}&guests=6`);
    expect(body).toEqual({
      checkIn: day(30),
      checkOut: day(33),
      nights: 3,
      guests: 6,
      currency: "GBP",
      pricePerNight: 120,
      subtotal: 360,
      bookingFee: 12.5,
      total: 372.5,
      available: true,
    });
  });

  it("flags unavailable dates", async () => {
    const { body } = await getJson(`/best/queries/booking-quote?checkIn=${day(12)}&checkOut=${day(14)}&guests=2`);
    expect(body.available).toBe(false);
  });

  it("refuses more than six guests", async () => {
    const { status, body } = await getJson(`/best/queries/booking-quote?checkIn=${day(30)}&checkOut=${day(33)}&guests=7`);
    expect(status).toBe(400);
    expect(body.error.details.parameter).toBe("guests");
  });
});

describe("RequestBooking command", () => {
  it("accepts a valid request and emails the owner through FormSubmit", async () => {
    const command = bookingCommand({}, { phone: "07700 900123", message: "Bringing a dog?" });
    const response = await postCommand(command, newClient());
    expect(response.status).toBe(201);
    expect(await response.json()).toEqual({ id: command.id, correlationId: command.id });
    expect(upstream.emails).toHaveLength(1);
    const [email] = upstream.emails;
    expect(email.headers.get("Origin")).toBe("https://belmontcottage.co.uk");
    expect(email.body).toMatchObject({
      _replyto: "ada@example.com",
      "Start Date": day(30),
      "End Date": day(33),
      Guests: "4",
      Name: "Ada Lovelace",
      Email: "ada@example.com",
      Phone: "07700 900123",
      Message: "Bringing a dog?",
      Total: "£372.50",
      Nights: "3",
      Source: "AI assistant (BEST)",
      "Request ID": command.id,
    });
  });

  it("echoes a caller-supplied correlation id", async () => {
    const command = bookingCommand({ correlationid: "trip-42" });
    const response = await postCommand(command, newClient(), "application/json");
    expect(await response.json()).toEqual({ id: command.id, correlationId: "trip-42" });
  });

  it("accepts phone without email", async () => {
    const response = await postCommand(bookingCommand({}, { email: undefined, phone: "+44 7700 900123" }), newClient());
    expect(response.status).toBe(201);
  });

  it.each([
    ["name", { name: undefined }, "data.name"],
    ["blank name", { name: "   " }, "data.name"],
    ["guests", { guests: undefined }, "data.guests"],
    ["too many guests", { guests: 7 }, "data.guests"],
    ["contact", { email: undefined }, "data.email"],
    ["bad email", { email: "nope" }, "data.email"],
    ["unknown field", { pets: 2 }, "data.pets"],
    ["bad date", { checkIn: "2026-13-01" }, "data.checkIn"],
  ])("refuses a request missing or with invalid %s", async (_, data, field) => {
    const response = await postCommand(bookingCommand({}, data), newClient());
    expect(response.status).toBe(400);
    const body = (await response.json()) as any;
    expect(body.error.code).toBe("INVALID_DATA");
    expect(body.error.details.field).toBe(field);
    expect(upstream.emails).toHaveLength(0);
  });

  it("refuses booked dates with alternatives of the same length", async () => {
    const response = await postCommand(bookingCommand({}, { checkIn: day(12), checkOut: day(14) }), newClient());
    expect(response.status).toBe(400);
    const body = (await response.json()) as any;
    expect(body.error.code).toBe("DATES_UNAVAILABLE");
    expect(body.error.details.alternatives[0]).toEqual({ checkIn: day(15), checkOut: day(20), nights: 5 });
    expect(upstream.emails).toHaveLength(0);
  });

  it("refuses dates in the past", async () => {
    const response = await postCommand(bookingCommand({}, { checkIn: day(-2), checkOut: day(1) }), newClient());
    expect(((await response.json()) as any).error.code).toBe("DATES_IN_PAST");
  });

  it.each([
    ["missing dataschema", { dataschema: undefined }, "dataschema"],
    ["wrong specversion", { specversion: "0.3" }, "specversion"],
    ["missing time", { time: undefined }, "time"],
  ])("refuses an envelope with %s", async (_, overrides, field) => {
    const response = await postCommand(bookingCommand(overrides), newClient());
    expect(response.status).toBe(400);
    const body = (await response.json()) as any;
    expect(body.error.code).toBe("INVALID_ENVELOPE");
    expect(body.error.details.field).toBe(field);
  });

  it("refuses an unknown command type", async () => {
    const response = await postCommand(bookingCommand({ type: "CancelBooking" }), newClient());
    expect(((await response.json()) as any).error.code).toBe("UNKNOWN_COMMAND_TYPE");
  });

  it("refuses unsupported content types, invalid JSON and oversized bodies", async () => {
    expect((await postCommand(bookingCommand(), newClient(), "text/plain")).status).toBe(415);
    expect((await postCommand("{", newClient())).status).toBe(400);
    const big = await postCommand(bookingCommand({}, { message: "x".repeat(MAX_BODY_BYTES) }), newClient());
    expect(big.status).toBe(413);
    expect(((await big.json()) as any).error.details.limit_bytes).toBe(MAX_BODY_BYTES);
  });

  it("answers a retry as the original without emailing again", async () => {
    const command = bookingCommand();
    const client = newClient();
    const first = await postCommand(command, client);
    const retry = await postCommand(command, client);
    expect(retry.status).toBe(201);
    expect(await retry.json()).toEqual(await first.json());
    expect(upstream.emails).toHaveLength(1);
  });

  it("refuses a reused id with a different payload", async () => {
    const command = bookingCommand();
    await postCommand(command, newClient());
    const reused = await postCommand({ ...command, data: { ...command.data, guests: 2 } }, newClient());
    expect(reused.status).toBe(409);
    expect(((await reused.json()) as any).error.code).toBe("DUPLICATE_COMMAND_ID");
  });

  it("limits accepted requests per client and does not count refused ones", async () => {
    const client = newClient();
    await postCommand(bookingCommand({}, { checkIn: day(12), checkOut: day(14) }), client);
    for (let i = 0; i < 3; i++) expect((await postCommand(bookingCommand(), client)).status).toBe(201);
    const limited = await postCommand(bookingCommand(), client);
    expect(limited.status).toBe(429);
    expect(Number(limited.headers.get("Retry-After"))).toBeGreaterThan(500);
    expect(upstream.emails).toHaveLength(3);
    expect((await postCommand(bookingCommand(), newClient())).status).toBe(201);
  });

  it("frees the id when delivery fails so a retry can succeed", async () => {
    const command = bookingCommand();
    const client = newClient();
    upstream.formSubmit = () => Response.json({ success: "false", message: "Make sure you open this page through a web server" });
    const failed = await postCommand(command, client);
    expect(failed.status).toBe(502);
    expect(((await failed.json()) as any).error.code).toBe("DELIVERY_FAILED");
    upstream.formSubmit = () => Response.json({ success: "true" });
    expect((await postCommand(command, client)).status).toBe(201);
  });
});

describe("booked.ics", () => {
  it("proxies the Airbnb calendar", async () => {
    const response = await call("/booked.ics");
    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toContain("text/calendar");
    expect(await response.text()).toBe(upstream.calendar);
  });
});

describe("calendar parsing", () => {
  it("handles folded lines, date-times and events without an end", () => {
    const ical = [
      "BEGIN:VCALENDAR",
      "BEGIN:VEVENT",
      "DTSTART;VALUE=DATE:20270105",
      "DTEND;VALUE=DATE:20270108",
      "DESCRIPTION:Reservation URL: https://www.airbnb.com/hosting/reservations/details/",
      " ABC123",
      "END:VEVENT",
      "BEGIN:VEVENT",
      "DTSTART:20270201T150000Z",
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");
    expect(parseBookedStays(ical)).toEqual([
      { checkIn: "2027-01-05", checkOut: "2027-01-08" },
      { checkIn: "2027-02-01", checkOut: "2027-02-02" },
    ]);
  });
});

describe("client key", () => {
  it("groups IPv6 clients by /64 and keeps IPv4 addresses whole", () => {
    const key = (ip: string) => clientKey(new Request("https://x", { headers: { "CF-Connecting-IP": ip } }));
    expect(key("2001:db8:1:2:aaaa::1")).toBe("2001:db8:1:2::/64");
    expect(key("2001:db8:1:2:bbbb:cccc:dddd:eeee")).toBe("2001:db8:1:2::/64");
    expect(key("2001:db8::1")).toBe("2001:db8:0:0::/64");
    expect(key("192.0.2.1")).toBe("192.0.2.1");
  });
});
