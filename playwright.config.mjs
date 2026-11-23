import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'tests',
  testMatch: /.*\.spec\.mjs/,
  fullyParallel: true,
  use: { ...devices['Pixel 7'], baseURL: 'http://localhost:4173/' },
  webServer: { command: 'node tests/serve.mjs 4173', url: 'http://localhost:4173/', reuseExistingServer: true },
});
