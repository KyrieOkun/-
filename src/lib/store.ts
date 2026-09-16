/**
 * Minimal persistence layer with two drivers:
 *  - Upstash Redis (REST) when UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN are set
 *  - In-memory fallback for local development and preview deployments
 *
 * All records are namespaced JSON documents. Collections keep an index set so
 * they can be listed without SCAN.
 */

export type Collection =
  | "users"
  | "sessions"
  | "orders"
  | "testDrives"
  | "tradeIns"
  | "serviceBookings"
  | "consultations"
  | "garage"
  | "keys"
  | "newsletter";

interface Driver {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttlSeconds?: number): Promise<void>;
  del(key: string): Promise<void>;
  sadd(key: string, member: string): Promise<void>;
  srem(key: string, member: string): Promise<void>;
  smembers(key: string): Promise<string[]>;
}

class MemoryDriver implements Driver {
  private data = new Map<string, { value: unknown; expiresAt?: number }>();
  private sets = new Map<string, Set<string>>();

  async get<T>(key: string): Promise<T | null> {
    const entry = this.data.get(key);
    if (!entry) return null;
    if (entry.expiresAt && entry.expiresAt < Date.now()) {
      this.data.delete(key);
      return null;
    }
    return entry.value as T;
  }
  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    this.data.set(key, { value, expiresAt: ttlSeconds ? Date.now() + ttlSeconds * 1000 : undefined });
  }
  async del(key: string): Promise<void> {
    this.data.delete(key);
  }
  async sadd(key: string, member: string): Promise<void> {
    if (!this.sets.has(key)) this.sets.set(key, new Set());
    this.sets.get(key)!.add(member);
  }
  async srem(key: string, member: string): Promise<void> {
    this.sets.get(key)?.delete(member);
  }
  async smembers(key: string): Promise<string[]> {
    return Array.from(this.sets.get(key) ?? []);
  }
}

class UpstashDriver implements Driver {
  constructor(private url: string, private token: string) {}

  private async command<R>(...args: (string | number)[]): Promise<R> {
    const res = await fetch(this.url, {
      method: "POST",
      headers: { Authorization: `Bearer ${this.token}`, "Content-Type": "application/json" },
      body: JSON.stringify(args),
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`Upstash error ${res.status}`);
    const json = (await res.json()) as { result: R; error?: string };
    if (json.error) throw new Error(json.error);
    return json.result;
  }

  async get<T>(key: string): Promise<T | null> {
    const raw = await this.command<string | null>("GET", key);
    return raw ? (JSON.parse(raw) as T) : null;
  }
  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    const payload = JSON.stringify(value);
    if (ttlSeconds) await this.command("SET", key, payload, "EX", ttlSeconds);
    else await this.command("SET", key, payload);
  }
  async del(key: string): Promise<void> {
    await this.command("DEL", key);
  }
  async sadd(key: string, member: string): Promise<void> {
    await this.command("SADD", key, member);
  }
  async srem(key: string, member: string): Promise<void> {
    await this.command("SREM", key, member);
  }
  async smembers(key: string): Promise<string[]> {
    return (await this.command<string[]>("SMEMBERS", key)) ?? [];
  }
}

declare global {
  var __mtaStoreDriver: Driver | undefined;
}

function createDriver(): Driver {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (url && token) return new UpstashDriver(url, token);
  return new MemoryDriver();
}

function driver(): Driver {
  if (!globalThis.__mtaStoreDriver) globalThis.__mtaStoreDriver = createDriver();
  return globalThis.__mtaStoreDriver;
}

const PREFIX = "mta";
const docKey = (col: Collection, id: string) => `${PREFIX}:${col}:${id}`;
const indexKey = (col: Collection, owner = "_all") => `${PREFIX}:idx:${col}:${owner}`;
const lookupKey = (col: Collection, field: string, value: string) => `${PREFIX}:lookup:${col}:${field}:${value.toLowerCase()}`;

export const store = {
  driverName(): "upstash" | "memory" {
    return driver() instanceof UpstashDriver ? "upstash" : "memory";
  },

  async get<T>(col: Collection, id: string): Promise<T | null> {
    return driver().get<T>(docKey(col, id));
  },

  async put<T extends { id: string }>(col: Collection, doc: T, options: { owner?: string; ttlSeconds?: number } = {}): Promise<T> {
    await driver().set(docKey(col, doc.id), doc, options.ttlSeconds);
    await driver().sadd(indexKey(col), doc.id);
    if (options.owner) await driver().sadd(indexKey(col, options.owner), doc.id);
    return doc;
  },

  async remove(col: Collection, id: string, owner?: string): Promise<void> {
    await driver().del(docKey(col, id));
    await driver().srem(indexKey(col), id);
    if (owner) await driver().srem(indexKey(col, owner), id);
  },

  async list<T>(col: Collection, owner?: string): Promise<T[]> {
    const ids = await driver().smembers(indexKey(col, owner));
    const docs: (T | null)[] = [];
    for (const id of ids) docs.push(await driver().get<T>(docKey(col, id)));
    return docs.filter((d): d is T => d !== null);
  },

  async setLookup(col: Collection, field: string, value: string, id: string): Promise<void> {
    await driver().set(lookupKey(col, field, value), id);
  },

  async getByLookup<T>(col: Collection, field: string, value: string): Promise<T | null> {
    const id = await driver().get<string>(lookupKey(col, field, value));
    if (!id) return null;
    return driver().get<T>(docKey(col, id));
  },
};
