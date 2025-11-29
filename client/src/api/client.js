const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5001/api";

const buildHeaders = (token, extra = {}) => {
  const headers = { ...extra };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
};

const handleResponse = async (response) => {
  const contentType = response.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const payload = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    const error = new Error(payload?.error || response.statusText);
    error.status = response.status;
    error.payload = payload;
    throw error;
  }
  return payload;
};

export const apiClient = {
  get: async (path, { token, params, headers } = {}) => {
    const url = new URL(path, API_BASE_URL);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          url.searchParams.append(key, value);
        }
      });
    }
    const response = await fetch(url.toString(), {
      credentials: "include",
      headers: buildHeaders(token, headers),
    });
    return handleResponse(response);
  },
  post: async (path, body, { token, headers } = {}) => {
    const response = await fetch(new URL(path, API_BASE_URL), {
      method: "POST",
      credentials: "include",
      headers: buildHeaders(token, {
        "Content-Type": "application/json",
        ...headers,
      }),
      body: body ? JSON.stringify(body) : undefined,
    });
    return handleResponse(response);
  },
  patch: async (path, body, { token, headers } = {}) => {
    const response = await fetch(new URL(path, API_BASE_URL), {
      method: "PATCH",
      credentials: "include",
      headers: buildHeaders(token, {
        "Content-Type": "application/json",
        ...headers,
      }),
      body: body ? JSON.stringify(body) : undefined,
    });
    return handleResponse(response);
  },
  del: async (path, { token, headers } = {}) => {
    const response = await fetch(new URL(path, API_BASE_URL), {
      method: "DELETE",
      credentials: "include",
      headers: buildHeaders(token, headers),
    });
    return handleResponse(response);
  },
};

export default apiClient;
