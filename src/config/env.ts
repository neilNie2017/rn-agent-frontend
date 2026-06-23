export type AppEnvName = 'development' | 'test' | 'production';

export const env = {
  APP_ENV: "development" as AppEnvName,
  API_BASE_URL: "https://dev-api.example.com",
  API_TIMEOUT: 15000,
};
