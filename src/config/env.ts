import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env'), quiet: true } as dotenv.DotenvConfigOptions);

const read = (name: string, fallback: string) => process.env[name]?.trim() || fallback;

export const env = {
  baseUrl: read('BASE_URL', 'https://automationexercise.com'),
  dataPrefix: read('TEST_DATA_PREFIX', 'qa-as'),
  blockAds: read('BLOCK_ADS', '1') !== '0',
  isCI: !!process.env.CI,
} as const;
