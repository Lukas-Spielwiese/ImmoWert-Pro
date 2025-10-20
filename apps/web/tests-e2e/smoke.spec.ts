import { test, expect } from '@playwright/test';
test('UI lädt und zeigt Titel', async ({ page }) => { await page.goto('http://localhost:3000/'); await expect(page.getByText('ImmoWertV 2021')).toBeVisible(); });
