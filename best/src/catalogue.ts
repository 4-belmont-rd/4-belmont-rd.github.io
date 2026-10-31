import property from "../../src/property.json";
import { BOOKING_HORIZON_DAYS } from "./dates";

export const BEST_VERSION = "0.9.17";
export const WORKFLOW_ID = "book-a-stay";

const JSON_SCHEMA = "https://json-schema.org/draft/2020-12/schema";
const ISO_DATE = { type: "string", format: "date", pattern: "^\\d{4}-\\d{2}-\\d{2}$" };

export const REQUEST_BOOKING = {
  schema: "request-booking",
  version: "1.0",
  commandType: "RequestBooking",
  description:
    "Ask the owner to book a stay. This sends a booking request, not a confirmed booking: the owner replies by email or phone to confirm and arrange payment.",
  impact: {
    categories: ["commitment"],
    confirmation: "required",
    warning:
      "Sends your name and contact details to the owner as a booking request for these dates. It is not a confirmed booking: the owner will contact you to confirm and arrange payment.",
  },
} as const;

export function requestBookingDataSchema() {
  return {
    type: "object",
    required: ["checkIn", "checkOut", "guests", "name"],
    anyOf: [{ required: ["email"] }, { required: ["phone"] }],
    properties: {
      checkIn: { ...ISO_DATE, description: "Arrival date, today or later in UK time." },
      checkOut: {
        ...ISO_DATE,
        description: `Departure date, after checkIn and at most ${BOOKING_HORIZON_DAYS} days from today. The stay is the nights from checkIn up to but not including checkOut.`,
      },
      guests: { type: "integer", minimum: 1, maximum: property.maxGuests, description: "Number of guests staying." },
      name: { type: "string", minLength: 1, maxLength: 100, pattern: "\\S", description: "Name of the lead guest." },
      email: { type: "string", format: "email", maxLength: 254, description: "Email address the owner should reply to. Email or phone is required." },
      phone: {
        type: "string",
        pattern: "^\\+?[0-9 ()-]{6,30}$",
        description: "Phone number the owner can call or text. Email or phone is required.",
      },
      message: { type: "string", maxLength: 1000, description: "Anything the guest wants the owner to know." },
    },
    additionalProperties: false,
  };
}

const STAY_RANGE = {
  type: "object",
  required: ["checkIn", "checkOut", "nights"],
  properties: { checkIn: ISO_DATE, checkOut: ISO_DATE, nights: { type: "integer", minimum: 1 } },
  additionalProperties: false,
};

export const QUERIES = {
  "property-description": {
    description: "The cottage's name, description, location and where to read guest reviews.",
    workflows: [] as string[],
    parameters: undefined,
    response: {
      type: "object",
      required: ["name", "summary", "description", "location", "reviewsUrl"],
      properties: {
        name: { type: "string" },
        summary: { type: "string" },
        description: { type: "array", items: { type: "string" }, description: "Paragraphs, in display order." },
        location: {
          type: "object",
          required: ["street", "town", "county", "country", "walkingMinutes"],
          properties: {
            street: { type: "string" },
            town: { type: "string" },
            county: { type: "string" },
            country: { type: "string", description: "ISO 3166-1 alpha-2 code." },
            walkingMinutes: {
              type: "object",
              additionalProperties: { type: "integer" },
              description: "Walking time in minutes to nearby places.",
            },
          },
        },
        reviewsUrl: { type: "string", format: "uri" },
      },
    },
  },
  "property-features": {
    description: "Bedrooms and beds, maximum guests, amenities and parking.",
    workflows: [] as string[],
    parameters: undefined,
    response: {
      type: "object",
      required: ["floors", "bedrooms", "extraBeds", "maxGuests", "amenities", "parking"],
      properties: {
        floors: { type: "integer" },
        bedrooms: {
          type: "array",
          items: {
            type: "object",
            required: ["name", "beds"],
            properties: { name: { type: "string" }, beds: { type: "array", items: { type: "string" } } },
          },
        },
        extraBeds: {
          type: "array",
          items: {
            type: "object",
            required: ["bed", "note"],
            properties: { bed: { type: "string" }, note: { type: "string" } },
          },
        },
        maxGuests: { type: "integer" },
        amenities: { type: "array", items: { type: "string" } },
        parking: { type: "string" },
      },
    },
  },
  availability: {
    description: `Whether the cottage is free between two dates, and every free range in between. Dates are check-in and check-out days: a stay from 'from' to 'to' is the nights up to but not including 'to'. 'from' must be today or later in UK time and 'to' at most ${BOOKING_HORIZON_DAYS} days from today. Availability is live, to within about 15 minutes.`,
    workflows: [WORKFLOW_ID],
    parameters: {
      type: "object",
      required: ["from", "to"],
      properties: {
        from: { ...ISO_DATE, description: "Check-in date (YYYY-MM-DD)." },
        to: { ...ISO_DATE, description: "Check-out date (YYYY-MM-DD), after 'from'." },
      },
      additionalProperties: false,
    },
    response: {
      type: "object",
      required: ["from", "to", "available", "freeRanges"],
      properties: {
        from: ISO_DATE,
        to: ISO_DATE,
        available: { type: "boolean", description: "True when a stay from 'from' to 'to' can be requested." },
        freeRanges: {
          type: "array",
          items: STAY_RANGE,
          description: "Every free check-in to check-out range between 'from' and 'to', in date order.",
        },
      },
      additionalProperties: false,
    },
  },
  "booking-quote": {
    description:
      "The price of a stay, broken down into nights, nightly rate and booking fee, and whether those dates are free. Prices are flat all year and do not depend on the number of guests.",
    workflows: [WORKFLOW_ID],
    parameters: {
      type: "object",
      required: ["checkIn", "checkOut", "guests"],
      properties: {
        checkIn: { ...ISO_DATE, description: "Check-in date (YYYY-MM-DD), today or later in UK time." },
        checkOut: { ...ISO_DATE, description: "Check-out date (YYYY-MM-DD), after checkIn." },
        guests: { type: "string", pattern: `^[1-${property.maxGuests}]$`, description: `Number of guests, 1 to ${property.maxGuests}.` },
      },
      additionalProperties: false,
    },
    response: {
      type: "object",
      required: ["checkIn", "checkOut", "nights", "guests", "currency", "pricePerNight", "subtotal", "bookingFee", "total", "available"],
      properties: {
        checkIn: ISO_DATE,
        checkOut: ISO_DATE,
        nights: { type: "integer", minimum: 1 },
        guests: { type: "integer" },
        currency: { type: "string", description: "ISO 4217 code." },
        pricePerNight: { type: "number" },
        subtotal: { type: "number" },
        bookingFee: { type: "number" },
        total: { type: "number" },
        available: { type: "boolean" },
      },
      additionalProperties: false,
    },
  },
} as const;

export type QueryName = keyof typeof QUERIES;

export function isQueryName(name: string): name is QueryName {
  return Object.hasOwn(QUERIES, name);
}

export const QUERY_VERSION = "1.0";

export function commandDataschema(endpoint: string): string {
  return `${endpoint}/commands/${REQUEST_BOOKING.schema}/${REQUEST_BOOKING.version}`;
}

export function queryDataschema(endpoint: string, name: QueryName): string {
  return `${endpoint}/queries/${name}/${QUERY_VERSION}`;
}

export function manifest(endpoint: string) {
  return {
    best: {
      version: BEST_VERSION,
      services: {
        "uk.co.belmontcottage.booking": {
          version: "1.0.0",
          description:
            "A self-catering holiday cottage on Belmont Road, Whitstable. Find out about the cottage, check availability and prices, and ask the owner to book a stay.",
          authentication: { type: "none" },
          http: { endpoint },
        },
      },
      capabilities: [
        {
          name: "io.best.agents.commands",
          version: BEST_VERSION,
          service: "uk.co.belmontcottage.booking",
          description: "Booking requests sent to the owner for confirmation.",
          spec: "https://behavioralstate.io/specs/agents/commands",
          schema: "https://behavioralstate.io/v1/schemas/agents/commands.json",
          endpoints: [
            { method: "GET", path: "/commands", description: "Command catalogue" },
            { method: "POST", path: "/commands", description: "Send a command" },
            { method: "GET", path: "/commands/{schema}/{version}", description: "Command schema document" },
          ],
        },
        {
          name: "io.best.agents.queries",
          version: BEST_VERSION,
          service: "uk.co.belmontcottage.booking",
          description: "The cottage's description, features, availability and prices.",
          spec: "https://behavioralstate.io/specs/agents/queries",
          schema: "https://behavioralstate.io/v1/schemas/agents/queries.json",
          endpoints: [
            { method: "GET", path: "/queries", description: "Query catalogue" },
            { method: "GET", path: "/queries/{schema}/{version}", description: "Query schema document" },
            { method: "GET", path: "/queries/{schema}", description: "Execute a query" },
          ],
        },
        {
          name: "io.best.agents.workflows",
          version: BEST_VERSION,
          service: "uk.co.belmontcottage.booking",
          description: "How to take a guest from choosing dates to a booking request.",
          spec: "https://behavioralstate.io/specs/agents/workflows",
          schema: "https://behavioralstate.io/v1/schemas/agents/workflows.json",
          endpoints: [
            { method: "GET", path: "/workflows", description: "Workflow index" },
            { method: "GET", path: "/workflows/{id}", description: "One workflow with its steps" },
          ],
        },
      ],
    },
  };
}

export function commandCatalogue(endpoint: string) {
  return {
    commands: [
      {
        schema: REQUEST_BOOKING.schema,
        version: REQUEST_BOOKING.version,
        commandType: REQUEST_BOOKING.commandType,
        dataschema: commandDataschema(endpoint),
        description: REQUEST_BOOKING.description,
        workflows: [WORKFLOW_ID],
        impact: REQUEST_BOOKING.impact,
      },
    ],
  };
}

export function commandSchemaDocument(endpoint: string) {
  return {
    $schema: JSON_SCHEMA,
    $id: commandDataschema(endpoint),
    title: REQUEST_BOOKING.commandType,
    description: REQUEST_BOOKING.description,
    commandType: REQUEST_BOOKING.commandType,
    workflows: [WORKFLOW_ID],
    impact: REQUEST_BOOKING.impact,
    ...requestBookingDataSchema(),
  };
}

export function queryCatalogue(endpoint: string) {
  return {
    queries: (Object.keys(QUERIES) as QueryName[]).map((name) => ({
      schema: name,
      version: QUERY_VERSION,
      dataschema: queryDataschema(endpoint, name),
      description: QUERIES[name].description,
      ...(QUERIES[name].workflows.length ? { workflows: [...QUERIES[name].workflows] } : {}),
    })),
  };
}

export function querySchemaDocument(name: QueryName) {
  const query = QUERIES[name];
  return {
    description: query.description,
    ...(query.parameters ? { parameters: query.parameters } : {}),
    response: query.response,
    ...(query.workflows.length ? { workflows: [...query.workflows] } : {}),
  };
}

export function workflowIndex() {
  const { id, name, description } = workflow("");
  return { workflows: [{ id, name, description }] };
}

export function workflow(endpoint: string) {
  return {
    id: WORKFLOW_ID,
    name: "Book a stay",
    description:
      "Take a guest from choosing dates to a booking request: check the dates are free, agree the price, then send the request to the owner, who confirms it by email or phone. Run each step yourself and wait for its answer before the next.",
    steps: [
      {
        kind: "query",
        dataschema: queryDataschema(endpoint, "availability"),
        guidance:
          "Check the guest's dates, using their check-in date as 'from' and check-out date as 'to'. If they are not available, offer the closest free ranges and agree new dates before going on.",
      },
      {
        kind: "query",
        dataschema: queryDataschema(endpoint, "booking-quote"),
        guidance:
          "Quote the agreed dates and number of guests. Tell the guest the total and get their agreement before the next step. If 'available' is now false, go back to the first step.",
      },
      {
        kind: "command",
        dataschema: commandDataschema(endpoint),
        guidance:
          "Send it only after the guest has confirmed the dates, number of guests, total, and that their name and contact details may go to the owner. Use the same dates and guests as the quote. Afterwards tell the guest it is a request: the owner will contact them to confirm and arrange payment.",
      },
    ],
  };
}
