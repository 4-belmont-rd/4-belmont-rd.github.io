const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, HEAD, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, If-None-Match",
  "Access-Control-Expose-Headers": "Retry-After, ETag",
  "Access-Control-Max-Age": "86400",
};

export function json(body: unknown, status = 200, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...CORS_HEADERS, ...headers },
  });
}

export async function cacheableJson(request: Request, body: unknown, maxAgeSeconds: number): Promise<Response> {
  const text = JSON.stringify(body);
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  const hex = [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
  const etag = `"${hex.slice(0, 32)}"`;
  const headers = { ...CORS_HEADERS, ETag: etag, "Cache-Control": `public, max-age=${maxAgeSeconds}` };
  if (matchesEtag(request.headers.get("If-None-Match"), etag)) return new Response(null, { status: 304, headers });
  return new Response(text, { headers: { "Content-Type": "application/json", ...headers } });
}

function matchesEtag(ifNoneMatch: string | null, etag: string): boolean {
  if (ifNoneMatch === null) return false;
  return ifNoneMatch.split(",").some((tag) => {
    const candidate = tag.trim();
    return candidate === "*" || candidate.replace(/^W\//, "") === etag;
  });
}

export function schemaDocument(body: unknown): Response {
  return json(body, 200, { "Content-Type": "application/schema+json" });
}

export function error(
  status: number,
  code: string,
  message: string,
  details?: Record<string, unknown>,
  headers: Record<string, string> = {},
): Response {
  return json({ error: details ? { code, message, details } : { code, message } }, status, headers);
}

export function preflight(): Response {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export function withCors(response: Response): Response {
  const result = new Response(response.body, response);
  for (const [name, value] of Object.entries(CORS_HEADERS)) result.headers.set(name, value);
  return result;
}
