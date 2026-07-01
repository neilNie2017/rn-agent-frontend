export type AppEnvName = 'development' | 'test' | 'production';

export const env = {
  APP_ENV: "development" as AppEnvName,
  API_BASE_URL: "http://192.168.0.105:3000",
  API_TIMEOUT: 15000,
};
