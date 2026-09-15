export interface ApiResult<T> {
  ok: boolean;
  status: number;
  data: T | null;
  error: string | null;
  details?: unknown;
}

export async function apiFetch<T>(url: string, init?: RequestInit & { json?: unknown }): Promise<ApiResult<T>> {
  const { json, ...rest } = init ?? {};
  try {
    const res = await fetch(url, {
      ...rest,
      headers: { ...(json !== undefined ? { "Content-Type": "application/json" } : {}), ...(rest.headers ?? {}) },
      body: json !== undefined ? JSON.stringify(json) : rest.body,
      cache: "no-store",
    });
    const payload = (await res.json().catch(() => null)) as { ok?: boolean; data?: T; error?: { message?: string; details?: unknown } } | null;
    if (!res.ok || !payload?.ok) {
      return { ok: false, status: res.status, data: null, error: payload?.error?.message ?? `HTTP ${res.status}`, details: payload?.error?.details };
    }
    return { ok: true, status: res.status, data: payload.data ?? null, error: null };
  } catch (err) {
    return { ok: false, status: 0, data: null, error: err instanceof Error ? err.message : "NETWORK_ERROR" };
  }
}
