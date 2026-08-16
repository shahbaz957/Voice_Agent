export class ApiError extends Error {
  readonly status: number;
  readonly body: unknown;

  constructor(message: string, status: number, body?: unknown) {
    super(message); // gives the message to the parent class Error
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

export type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined>;
};

function buildUrl(base: string, path: string, query?: RequestOptions["query"]) {
  const url = new URL(path.startsWith("http") ? path : `${base}${path}`);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined) url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

export function createApiClient(baseUrl: string) {
  async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const { body, query, headers, ...rest } = options;
    const isFormData = typeof FormData !== "undefined" && body instanceof FormData;

    const response = await fetch(buildUrl(baseUrl, path, query), {
      ...rest,
      headers: {
        Accept: "application/json",
        ...(body && !isFormData ? { "Content-Type": "application/json" } : {}),
        ...headers,
      },
      body: body
        ? isFormData
          ? (body as FormData)
          : JSON.stringify(body)
        : undefined,
    });

    const contentType = response.headers.get("content-type") || "";
    const payload = contentType.includes("application/json")
      ? await response.json()
      : await response.text();

    if (!response.ok) {
      const message =
        typeof payload === "object" &&
        payload !== null &&
        ("message" in payload || "error" in payload)
          ? String(
              (payload as { message?: string; error?: string }).message ||
                (payload as { error?: string }).error,
            )
          : `Request failed (${response.status})`;
      throw new ApiError(message, response.status, payload);
    }

    return payload as T;
  }

  return {
    get: <T>(path: string, options?: RequestOptions) =>
      request<T>(path, { ...options, method: "GET" }),
    post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
      request<T>(path, { ...options, method: "POST", body }),
  };
}

export type ApiClient = ReturnType<typeof createApiClient>;
