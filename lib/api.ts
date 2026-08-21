export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    credentials: "include",
    ...init,
  });
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