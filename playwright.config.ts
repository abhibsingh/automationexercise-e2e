import { defineConfig, devices, type Project, type ReporterDescription } from '@playwright/test';
import { env } from './src/config/env';

const reporters: ReporterDescription[] = [
  ['list'],
  ['html', { outputFolder: 'reports/html', open: 'never' }],
  ['junit', { outputFile: 'reports/junit/results.xml' }],
  ['json', { outputFile: 'reports/json/results.json' }],
];
if (env.isCI) reporters.push(['blob', { outputDir: 'blob-report' }], ['github']);

const browserIgnore = ['**/unit/**', '**/api/**'];

const crossBrowser: Project[] = process.env.CROSS_BROWSER
  ? [
      { name: 'firefox', testIgnore: browserIgnore, grep: /@smoke/, use: { ...devices['Desktop Firefox'] } },
      { name: 'webkit', testIgnore: browserIgnore, grep: /@smoke/, use: { ...devices['Desktop Safari'] } },
      { name: 'mobile', testIgnore: browserIgnore, grep: /@mobile/, use: { ...devices['Pixel 7'] } },
    ]
  : [];

export default defineConfig({
  testDir: './tests',
  outputDir: 'test-results',
  fullyParallel: true,
  forbidOnly: env.isCI,
  retries: env.isCI ? 1 : 0,
  workers: env.isCI ? 4 : undefined,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  reporter: reporters,

  use: {
    baseURL: env.baseUrl,
    testIdAttribute: 'data-qa',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
    acceptDownloads: true,
  },

  projects: [
    { name: 'unit', testDir: './tests/unit' },
    { name: 'api', testDir: './tests/api' },
    {
      name: 'chromium',
      testIgnore: browserIgnore,
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
    },
    ...crossBrowser,
  ],
});
