import { request } from './http';

export type LoginParams = {
  email: string;
  password: string;
};

export type LoginResult = {
  accessToken?: string;
  token?: string;
  user?: {
    email?: string;
    id?: string | number;
    name?: string;
    role?: string;
    [key: string]: unknown;
  };
};

export type LoginResponse = {
  accessToken?: string;
  data?: LoginResult;
  message?: string;
  success?: boolean;
  token?: string;
};

export function loginApi(params: LoginParams) {
  return request.post<LoginResponse>('/api/auth/login', params).send();
}

export type RegisterParams = LoginParams;

export function registerApi(params: RegisterParams) {
  return request.post<LoginResponse>('/api/auth/register', params).send();
}
