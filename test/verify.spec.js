import { test, expect } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const zipPath = path.resolve(__dirname, '..', '89FB5AF2-6052-4C4F-A7D0-C187C9495904.zip');

test.describe('Carolla Analyzer', () => {

  test('full app flow', async ({ page }) => {
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });

    await expect(page.locator('.upload-card')).toBeVisible();
    await expect(page.locator('.upload-dropzone')).toBeVisible();

    const [fileChooser] = await Promise.all([
      page.waitForEvent('filechooser', { timeout: 10000 }),
      page.locator('.upload-dropzone').click()
    ]);
    await fileChooser.setFiles(zipPath);

    await page.waitForSelector('.nav-bar', { timeout: 120000 });
    await expect(page.locator('.nav-bar')).toBeVisible();

    await page.waitForSelector('.stats-row', { timeout: 30000 });
    await expect(page.locator('.stats-card').first()).toBeVisible();

    await page.locator('a.nav-link').filter({ hasText: 'Trips' }).click();
    await page.waitForSelector('.data-table', { timeout: 10000 });

    await page.locator('.data-table tbody tr').first().click();
    await page.waitForSelector('.trip-detail-grid', { timeout: 10000 });

    await page.locator('a.nav-link').filter({ hasText: 'Map' }).click();
    await page.waitForSelector('#multiTripMap', { timeout: 10000 });

    await page.locator('a.nav-link').filter({ hasText: 'Warnings' }).click();
    await page.waitForSelector('#warnStats', { timeout: 10000 });

    await page.locator('a.nav-link').filter({ hasText: 'Dictionary' }).click();
    await page.waitForSelector('.dict-tabs', { timeout: 10000 });

    expect(errors.length).toBe(0);
  });
});
