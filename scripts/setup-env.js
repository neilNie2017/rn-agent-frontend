const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const appEnv = process.env.APP_ENV || process.argv[2] || 'development';
const envFile = path.join(projectRoot, `.env.${appEnv}`);
const outputFile = path.join(projectRoot, 'src', 'config', 'env.ts');

function parseEnv(content) {
  return content
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => line && !line.startsWith('#'))
    .reduce((env, line) => {
      const separatorIndex = line.indexOf('=');

      if (separatorIndex === -1) {
        return env;
      }

      const key = line.slice(0, separatorIndex).trim();
      const value = line.slice(separatorIndex + 1).trim();
      env[key] = value.replace(/^['"]|['"]$/g, '');
      return env;
    }, {});
}

if (!fs.existsSync(envFile)) {
  console.error(`Missing env file: .env.${appEnv}`);
  process.exit(1);
}

const env = parseEnv(fs.readFileSync(envFile, 'utf8'));
const apiBaseUrl = env.API_BASE_URL || '';
const apiTimeout = Number(env.API_TIMEOUT || 15000);
const chatMode = env.CHAT_MODE === 'stream' ? 'stream' : 'normal';

const output = `export type AppEnvName = 'development' | 'test' | 'production';
export type ChatMode = 'normal' | 'stream';

export const env = {
  APP_ENV: ${JSON.stringify(appEnv)} as AppEnvName,
  API_BASE_URL: ${JSON.stringify(apiBaseUrl)},
  API_TIMEOUT: ${Number.isFinite(apiTimeout) ? apiTimeout : 15000},
  CHAT_MODE: ${JSON.stringify(chatMode)} as ChatMode,
};
`;

fs.writeFileSync(outputFile, output);
console.log(`Using .env.${appEnv}`);
