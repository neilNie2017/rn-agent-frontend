import { createAlova } from 'alova';
import adapterFetch from 'alova/fetch';
import { env } from '../config/env';

export type ApiResponse<T = unknown> = {
  code: number;
  data: T;
  message?: string;
};

export class HttpError extends Error {
  status: number;
  data: unknown;

  constructor(status: number, message: string, data?: unknown) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.data = data;
  }
}

let authToken = '';

export function setAuthToken(token: string) {
  authToken = token;
}

export function clearAuthToken() {
  authToken = '';
}

export const http = createAlova({
  baseURL: env.API_BASE_URL,
  requestAdapter: adapterFetch(),
  timeout: env.API_TIMEOUT,
  beforeRequest(method) {
    method.config.headers = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      ...method.config.headers,
    };
  },
  responded: {
    async onSuccess(response: Response) {
      const contentType = response.headers.get('content-type') ?? '';
      const data = contentType.includes('application/json')
        ? await response.json()
        : await response.text();

      if (!response.ok) {
        throw new HttpError(response.status, response.statusText, data);
      }

      return data;
    },
    onError(error) {
      throw error;
    },
  },
});

export const request = {
  get<T>(url: string, params?: Record<string, unknown>) {
    return http.Get<T>(url, { params });
  },
  post<T>(url: string, data?: Record<string, unknown>) {
    return http.Post<T>(url, data);
  },
  put<T>(url: string, data?: Record<string, unknown>) {
    return http.Put<T>(url, data);
  },
  delete<T>(url: string, data?: Record<string, unknown>) {
    return http.Delete<T>(url, data);
  },
};
