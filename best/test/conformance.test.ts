import { beforeEach, describe, expect, it } from "vitest";
import { ENDPOINT, call, conformsTo, conformsToSchema, day, getJson, mockUpstream } from "./helpers";

const SPEC = "https://behavioralstate.io/v1/schemas";

beforeEach(() => {
  mockUpstream();
});

describe("discovery", () => {
  it("serves a public manifest that conforms to discovery.json", async () => {
    const { status, body, response } = await getJson("/.well-known/best");
    expect(status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe("application/json");
    expect(conformsTo(`${SPEC}/discovery.json`, body)).toEqual([]);
    expect(body.best.services["uk.co.belmontcottage.booking"].http.endpoint).toBe(ENDPOINT);
    expect(body.best.services["uk.co.belmontcottage.booking"].authentication).toEqual({ type: "none" });
  });

  it("sends an ETag and a cacheable Cache-Control on the manifest", async () => {
    const response = await call("/.well-known/best");
    const etag = response.headers.get("ETag");
    expect(etag).toMatch(/^"[0-9a-f]{32}"$/);
    expect(response.headers.get("Cache-Control")).toBe("public, max-age=300");
    expect(response.headers.get("Access-Control-Expose-Headers")).toContain("ETag");
    expect((await call("/.well-known/best")).headers.get("ETag")).toBe(etag);
  });

  it("answers a matching If-None-Match with 304 and no body", async () => {
    const etag = (await call("/.well-known/best")).headers.get("ETag")!;
    for (const ifNoneMatch of [etag, `W/${etag}`, `"other", ${etag}`, "*"]) {
      const response = await call("/.well-known/best", { headers: { "If-None-Match": ifNoneMatch } });
      expect(response.status).toBe(304);
      expect(response.headers.get("ETag")).toBe(etag);
      expect(response.headers.get("Cache-Control")).toBe("public, max-age=300");
      expect(await response.text()).toBe("");
    }
    const stale = await call("/.well-known/best", { headers: { "If-None-Match": '"other"' } });
    expect(stale.status).toBe(200);
    expect(conformsTo(`${SPEC}/discovery.json`, await stale.json())).toEqual([]);
  });

  it("keeps manifest descriptions short and free of mechanics", async () => {
    const { body } = await getJson("/.well-known/best");
    const descriptions = [
      ...Object.values<any>(body.best.services).map((service) => service.description),
      ...body.best.capabilities.map((capability: any) => capability.description),
    ];
    for (const description of descriptions) {
      expect(description.length).toBeLessThanOrEqual(500);
      expect(description).not.toMatch(/https?:|\/|request-booking|RequestBooking|availability query|book-a-stay/);
    }
  });

  it("references every service from a capability and serves every declared endpoint", async () => {
    const { body } = await getJson("/.well-known/best");
    const services = Object.keys(body.best.services);
    for (const service of services) {
      expect(body.best.capabilities.some((capability: any) => capability.service === service)).toBe(true);
    }
    for (const capability of body.best.capabilities) {
      for (const endpoint of capability.endpoints.filter((e: any) => e.method === "GET" && !e.path.includes("{"))) {
        expect((await call(`/best${endpoint.path}`)).status).toBe(200);
      }
    }
  });
});

describe("commands", () => {
  it("lists a catalogue that conforms to commands.json", async () => {
    const { status, body } = await getJson("/best/commands");
    expect(status).toBe(200);
    expect(conformsTo(`${SPEC}/agents/commands.json#/$defs/commandCatalogue`, body)).toEqual([]);
  });

  it("resolves each dataschema to a schema document carrying the same cross-links", async () => {
    const { body } = await getJson("/best/commands");
    for (const entry of body.commands) {
      const response = await call(new URL(entry.dataschema).pathname);
      expect(response.status).toBe(200);
      expect(response.headers.get("Content-Type")).toBe("application/schema+json");
      const document = (await response.json()) as any;
      expect(document.$id).toBe(entry.dataschema);
      expect(document.commandType).toBe(entry.commandType);
      expect(document.workflows).toEqual(entry.workflows);
      expect(document.impact).toEqual(entry.impact);
    }
  });

  it("answers an unknown schema version with 404 in the error format", async () => {
    const { status, body } = await getJson("/best/commands/request-booking/2.0");
    expect(status).toBe(404);
    expect(conformsTo(`${SPEC}/error.json`, body)).toEqual([]);
  });
});

describe("queries", () => {
  it("lists a catalogue that conforms to queries.json", async () => {
    const { status, body } = await getJson("/best/queries");
    expect(status).toBe(200);
    expect(conformsTo(`${SPEC}/agents/queries.json#/$defs/queryCatalogue`, body)).toEqual([]);
    expect(body.queries.map((query: any) => query.schema)).toEqual([
      "property-description",
      "property-features",
      "availability",
      "booking-quote",
    ]);
  });

  it("serves schema documents that conform and responses that match them", async () => {
    const params: Record<string, string> = {
      "property-description": "",
      "property-features": "",
      availability: `?from=${day(1)}&to=${day(40)}`,
      "booking-quote": `?checkIn=${day(30)}&checkOut=${day(33)}&guests=2`,
    };
    const { body: catalogue } = await getJson("/best/queries");
    for (const entry of catalogue.queries) {
      const { status, body: document } = await getJson(new URL(entry.dataschema).pathname);
      expect(status).toBe(200);
      expect(conformsTo(`${SPEC}/agents/queries.json#/$defs/querySchemaDocument`, document)).toEqual([]);
      expect(document.workflows).toEqual(entry.workflows);
      const result = await getJson(`/best/queries/${entry.schema}${params[entry.schema]}`);
      expect(result.status).toBe(200);
      expect(conformsToSchema(document.response, result.body)).toEqual([]);
    }
  });

  it("answers an unknown query with 404", async () => {
    const { status, body } = await getJson("/best/queries/nope");
    expect(status).toBe(404);
    expect(conformsTo(`${SPEC}/error.json`, body)).toEqual([]);
  });
});

describe("workflows", () => {
  it("serves an index and a recipe that conform to workflows.json", async () => {
    const index = await getJson("/best/workflows");
    expect(conformsTo(`${SPEC}/agents/workflows.json#/$defs/workflowIndex`, index.body)).toEqual([]);
    for (const entry of index.body.workflows) {
      const recipe = await getJson(`/best/workflows/${entry.id}`);
      expect(conformsTo(`${SPEC}/agents/workflows.json#/$defs/workflow`, recipe.body)).toEqual([]);
      for (const step of recipe.body.steps) {
        expect((await call(new URL(step.dataschema).pathname)).status).toBe(200);
      }
    }
  });

  it("is cross-linked from every operation in the recipe", async () => {
    const recipe = await getJson("/best/workflows/book-a-stay");
    const commands = await getJson("/best/commands");
    const queries = await getJson("/best/queries");
    const entries = [...commands.body.commands, ...queries.body.queries];
    for (const step of recipe.body.steps) {
      const entry = entries.find((candidate) => candidate.dataschema === step.dataschema);
      expect(entry.workflows).toContain("book-a-stay");
    }
  });

  it("answers an unknown workflow with 404", async () => {
    expect((await call("/best/workflows/nope")).status).toBe(404);
  });
});

describe("http", () => {
  it("answers CORS preflight", async () => {
    const response = await call("/best/commands", { method: "OPTIONS" });
    expect(response.status).toBe(204);
    expect(response.headers.get("Access-Control-Allow-Origin")).toBe("*");
  });

  it("answers HEAD on every GET route with the GET headers and no body", async () => {
    const paths = [
      "/.well-known/best",
      "/best/commands",
      "/best/commands/request-booking/1.0",
      "/best/queries",
      "/best/queries/property-description",
      "/best/queries/property-features/1.0",
      "/best/workflows",
      "/best/workflows/book-a-stay",
      "/best/nothing-here",
    ];
    for (const path of paths) {
      const get = await call(path);
      const head = await call(path, { method: "HEAD" });
      expect(head.status, path).toBe(get.status);
      expect(head.headers.get("Content-Type"), path).toBe(get.headers.get("Content-Type"));
      expect(head.headers.get("ETag"), path).toBe(get.headers.get("ETag"));
      expect(await head.text(), path).toBe("");
    }
    const etag = (await call("/.well-known/best")).headers.get("ETag")!;
    expect((await call("/.well-known/best", { method: "HEAD", headers: { "If-None-Match": etag } })).status).toBe(304);
  });

  it("lists HEAD as allowed alongside GET", async () => {
    const response = await call("/.well-known/best", { method: "POST" });
    expect(response.status).toBe(405);
    expect(response.headers.get("Allow")).toBe("GET, HEAD");
    expect((await call("/best/commands", { method: "DELETE" })).headers.get("Allow")).toBe("GET, HEAD, POST");
  });

  it("answers unknown routes with 404 in the error format", async () => {
    const { status, body } = await getJson("/best/nothing-here");
    expect(status).toBe(404);
    expect(conformsTo(`${SPEC}/error.json`, body)).toEqual([]);
  });

  it("rate-limits reads per client with 429 and Retry-After", async () => {
    let last: Response | undefined;
    for (let i = 0; i < 61; i++) last = await call("/best/queries", { client: "192.0.2.77" });
    expect(last!.status).toBe(429);
    expect(last!.headers.get("Retry-After")).toBe("60");
    expect((await call("/best/queries", { client: "192.0.2.78" })).status).toBe(200);
  });
});
