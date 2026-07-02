import { request } from './http';

export type SplashAdConfig = {
  duration?: number;
  enabled?: boolean;
  id?: string;
  imageUrl?: string;
  linkUrl?: string;
  skipAfter?: number;
  title?: string;
  type?: 'image';
};

export type SplashAdResponse = {
  data?: SplashAdConfig | null;
  success?: boolean;
};

export function getSplashAdApi() {
  return request
    .get<SplashAdResponse>('/api/app/splash-ad', undefined, { timeout: 5000 })
    .send();
}
