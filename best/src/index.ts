import { CalendarUnavailable, fetchCalendar } from "./calendar";
import {
  REQUEST_BOOKING,
  WORKFLOW_ID,
  commandCatalogue,
  commandSchemaDocument,
  isQueryName,
  manifest,
  queryCatalogue,
  querySchemaDocument,
  QUERY_VERSION,
  workflow,
  workflowIndex,
} from "./catalogue";
import { clientKey, submitCommand } from "./commands";
import { error, json, preflight, schemaDocument } from "./http";
import { executeQuery } from "./queries";

export { Ledger } from "./ledger";

const BASE_PATH = "/best";

export default {
  async fetch(request, env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/booked.ics") return bookedCalendar(env);

    if (request.method === "OPTIONS") return preflight();

    const limited = await rateLimited(request, env);
    if (limited) return limited;

    try {
      return await route(request, url, env);
    } catch (cause) {
      if (cause instanceof CalendarUnavailable) {
        console.error(cause.message);
        return error(503, "CALENDAR_UNAVAILABLE", "Availability cannot be checked right now. Try again shortly.", undefined, {
          "Retry-After": "60",
        });
      }
      console.error(cause);
      return error(500, "INTERNAL_ERROR", "Something went wrong.");
    }
  },
} satisfies ExportedHandler<Env>;

async function route(request: Request, url: URL, env: Env): Promise<Response> {
  const endpoint = `${url.origin}${BASE_PATH}`;
  const { method } = request;

  if (url.pathname === "/.well-known/best") {
    return method === "GET" ? json(manifest(endpoint)) : methodNotAllowed(["GET"]);
  }

  if (!url.pathname.startsWith(`${BASE_PATH}/`)) return notFound(url);
  const segments = url.pathname.slice(BASE_PATH.length + 1).split("/").map(decodeURIComponent);

  switch (segments[0]) {
    case "commands":
      if (segments.length === 1) {
        if (method === "GET") return json(commandCatalogue(endpoint));
        if (method === "POST") return submitCommand(request, env);
        return methodNotAllowed(["GET", "POST"]);
      }
      if (segments.length === 3 && method === "GET") {
        const [, schema, version] = segments;
        if (schema === REQUEST_BOOKING.schema && version === REQUEST_BOOKING.version) {
          return schemaDocument(commandSchemaDocument(endpoint));
        }
        return error(404, "SCHEMA_NOT_FOUND", `Unknown command schema '${schema}' version '${version}'.`);
      }
      break;
    case "queries":
      if (method !== "GET") return methodNotAllowed(["GET"]);
      if (segments.length === 1) return json(queryCatalogue(endpoint));
      if (!isQueryName(segments[1])) {
        return error(404, "SCHEMA_NOT_FOUND", `Unknown query schema '${segments[1]}'.`);
      }
      if (segments.length === 2) return executeQuery(segments[1], url, env);
      if (segments.length === 3) {
        if (segments[2] === QUERY_VERSION) return schemaDocument(querySchemaDocument(segments[1]));
        return error(404, "SCHEMA_NOT_FOUND", `Unknown version '${segments[2]}' of query '${segments[1]}'.`);
      }
      break;
    case "workflows":
      if (method !== "GET") return methodNotAllowed(["GET"]);
      if (segments.length === 1) return json(workflowIndex());
      if (segments.length === 2) {
        if (segments[1] === WORKFLOW_ID) return json(workflow(endpoint));
        return error(404, "WORKFLOW_NOT_FOUND", `Unknown workflow '${segments[1]}'.`);
      }
      break;
  }
  return notFound(url);
}

async function bookedCalendar(env: Env): Promise<Response> {
  try {
    return new Response(await fetchCalendar(env), {
      headers: { "Content-Type": "text/calendar; charset=utf-8", "Cache-Control": "public, max-age=900" },
    });
  } catch (cause) {
    console.error(cause instanceof Error ? cause.message : cause);
    return new Response("Calendar unavailable", { status: 503, headers: { "Retry-After": "60" } });
  }
}

async function rateLimited(request: Request, env: Env): Promise<Response | null> {
  if (request.method === "POST") return null;
  const { success } = await env.READ_LIMITER.limit({ key: clientKey(request) });
  if (success) return null;
  return error(429, "TOO_MANY_REQUESTS", "Too many requests. Try again in a minute.", undefined, { "Retry-After": "60" });
}

function notFound(url: URL): Response {
  return error(404, "NOT_FOUND", `No route for '${url.pathname}'.`);
}

function methodNotAllowed(allowed: string[]): Response {
  return error(405, "METHOD_NOT_ALLOWED", `Use ${allowed.join(" or ")}.`, { allowed }, { Allow: allowed.join(", ") });
}
