import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './test',
  timeout: 120000,
  retries: 1,
  use: {
    headless: true,
    viewport: { width: 1280, height: 800 },
    screenshot: 'only-on-failure'
  }
});
