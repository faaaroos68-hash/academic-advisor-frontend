export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

// ---------------------------------------------------------------------------
// CSRF (double-submit): the backend issues a readable XSRF_TOKEN cookie via
// GET /api/csrf; every mutating request must echo it in the X-CSRF-Token
// header. Handled centrally here so individual pages never deal with it.
// ---------------------------------------------------------------------------
const CSRF_COOKIE = "XSRF_TOKEN";
const CSRF_HEADER = "X-CSRF-Token";
const MUTATING = new Set(["POST", "PUT", "PATCH", "DELETE"]);

let csrfToken: string | null = null;

function readCsrfCookie(): string | null {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(new RegExp(`(?:^|; )${CSRF_COOKIE}=([^;]*)`));
  return m ? decodeURIComponent(m[1]) : null;
}

async function ensureCsrfToken(): Promise<string | null> {
  if (csrfToken) return csrfToken;
  csrfToken = readCsrfCookie();
  if (csrfToken) return csrfToken;
  try {
    const res = await fetch("/api/csrf", { credentials: "include" });
    if (res.ok) {
      const data = (await res.json().catch(() => null)) as { token?: string } | null;
      csrfToken = (data && typeof data.token === "string" && data.token) || readCsrfCookie();
    }
  } catch {
    // Network failure surfaces naturally on the actual request.
  }
  return csrfToken;
}

function isMutating(method: string): boolean {
  return MUTATING.has(method.toUpperCase());
}

function fetchWithTimeout(
  input: RequestInfo | URL,
  init: RequestInit & { timeout?: number } = {},
): Promise<Response> {
  const { timeout = 15000, ...fetchInit } = init;
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  return fetch(input, { ...fetchInit, signal: controller.signal }).finally(() =>
    clearTimeout(id),
  );
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const method = (init?.method ?? "GET").toUpperCase();

  let headers: Record<string, string> = {
    ...(init?.headers as Record<string, string> | undefined),
  };
  if (isMutating(method)) {
    const token = await ensureCsrfToken();
    if (token) headers[CSRF_HEADER] = token;
  }

  const doFetch = () =>
    fetchWithTimeout(path, {
      credentials: "include",
      ...init,
      method,
      headers,
      timeout: 20000,
    });

  let res = await doFetch();

  // Token rotated/expired (e.g. after re-login): refresh once and retry.
  if (res.status === 403 && isMutating(method)) {
    csrfToken = null;
    const fresh = await ensureCsrfToken();
    if (fresh && headers[CSRF_HEADER] !== fresh) {
      headers = { ...headers, [CSRF_HEADER]: fresh };
      res = await doFetch();
    }
  }

  // Keep the cached copy in sync with what the browser actually holds.
  csrfToken = readCsrfCookie() ?? csrfToken;

  const text = await res.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }
  }
  if (!res.ok) {
    const msg =
      (data && typeof data === "object" && "error" in data
        ? String((data as { error: unknown }).error)
        : null) ||
      (data && typeof data === "object" && "message" in data
        ? String((data as { message: unknown }).message)
        : null) ||
      `Request failed (${res.status})`;
    throw new ApiError(res.status, msg);
  }
  return data as T;
}

export function get<T = unknown>(path: string): Promise<T> {
  return request<T>(path, { method: "GET" });
}

export function postJson<T = unknown>(path: string, body: unknown): Promise<T> {
  return request<T>(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export function postForm<T = unknown>(path: string, form: FormData): Promise<T> {
  return request<T>(path, { method: "POST", body: form });
}

export function del<T = unknown>(path: string): Promise<T> {
  return request<T>(path, { method: "DELETE" });
}
