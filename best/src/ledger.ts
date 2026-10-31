import { DurableObject } from "cloudflare:workers";

export const RETENTION_MS = 7 * 86_400_000;

export const LIMITS = [
  { windowMs: 10 * 60_000, max: 3 },
  { windowMs: 86_400_000, max: 10 },
];

export type Lookup =
  | { kind: "new" }
  | { kind: "conflict" }
  | { kind: "pending" }
  | { kind: "replay"; status: number; body: string };

export type Reservation = Exclude<Lookup, { kind: "new" }> | { kind: "reserved" } | { kind: "limited"; retryAfterSeconds: number };

export class Ledger extends DurableObject<Env> {
  private sql: SqlStorage;

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    this.sql = ctx.storage.sql;
    this.sql.exec(`CREATE TABLE IF NOT EXISTS commands (
      id TEXT PRIMARY KEY,
      hash TEXT NOT NULL,
      client TEXT NOT NULL,
      created INTEGER NOT NULL,
      status INTEGER,
      body TEXT
    )`);
    this.sql.exec("CREATE INDEX IF NOT EXISTS commands_client ON commands (client, created)");
  }

  lookup(id: string, hash: string): Lookup {
    const row = this.sql.exec<{ hash: string; status: number | null; body: string | null }>(
      "SELECT hash, status, body FROM commands WHERE id = ?",
      id,
    ).toArray()[0];
    if (!row) return { kind: "new" };
    if (row.hash !== hash) return { kind: "conflict" };
    if (row.status === null || row.body === null) return { kind: "pending" };
    return { kind: "replay", status: row.status, body: row.body };
  }

  reserve(id: string, hash: string, client: string, now: number): Reservation {
    this.sql.exec("DELETE FROM commands WHERE created < ?", now - RETENTION_MS);
    const existing = this.lookup(id, hash);
    if (existing.kind !== "new") return existing;
    for (const limit of LIMITS) {
      const since = now - limit.windowMs;
      const rows = this.sql.exec<{ created: number }>(
        "SELECT created FROM commands WHERE client = ? AND created >= ? ORDER BY created",
        client,
        since,
      ).toArray();
      if (rows.length >= limit.max) {
        const oldest = rows[rows.length - limit.max].created;
        return { kind: "limited", retryAfterSeconds: Math.max(1, Math.ceil((oldest + limit.windowMs - now) / 1000)) };
      }
    }
    this.sql.exec("INSERT INTO commands (id, hash, client, created) VALUES (?, ?, ?, ?)", id, hash, client, now);
    return { kind: "reserved" };
  }

  complete(id: string, status: number, body: string): void {
    this.sql.exec("UPDATE commands SET status = ?, body = ? WHERE id = ?", status, body, id);
  }

  release(id: string): void {
    this.sql.exec("DELETE FROM commands WHERE id = ? AND status IS NULL", id);
  }
}
