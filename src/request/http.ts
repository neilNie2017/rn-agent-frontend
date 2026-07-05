import { createAlova } from 'alova';
import adapterFetch from 'alova/fetch';
import { env } from '@/config/env';

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

const authFreePaths = ['/api/auth/login', '/api/auth/register'];

function shouldAttachAuth(url: string) {
  return !authFreePaths.some(path => url.startsWith(path));
}

export function setAuthToken(token: string) {
  authToken = token;
}

export function clearAuthToken() {
  authToken = '';
}

export function getAuthHeaders(): Record<string, string> {
  return authToken ? { Authorization: `Bearer ${authToken}` } : {};
}

type RequestOptions = {
  timeout?: number;
};

export const http = createAlova({
  baseURL: env.API_BASE_URL,
  requestAdapter: adapterFetch(),
  timeout: env.API_TIMEOUT,
  beforeRequest(method) {
    const shouldAttachAuthorization = authToken && shouldAttachAuth(method.url);

    method.config.headers = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(shouldAttachAuthorization
        ? { Authorization: `Bearer ${authToken}` }
        : {}),
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
  get<T>(url: string, params?: Record<string, unknown>, options?: RequestOptions) {
    return http.Get<T>(url, { params, ...options });
  },
  post<T>(url: string, data?: Record<string, unknown>, options?: RequestOptions) {
    return http.Post<T>(url, data, options);
  },
  put<T>(url: string, data?: Record<string, unknown>, options?: RequestOptions) {
    return http.Put<T>(url, data, options);
  },
  delete<T>(url: string, data?: Record<string, unknown>, options?: RequestOptions) {
    return http.Delete<T>(url, data, options);
  },
};
