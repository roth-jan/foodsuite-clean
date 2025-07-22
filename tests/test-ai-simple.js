const { test, expect } = require('@playwright/test');

test('simple AI meal planning test', async ({ page }) => {
  // Navigate to the application
  await page.goto('http://localhost:3000');
  await page.waitForLoadState('networkidle');
  
  // Click on meal planning tab
  await page.click('a:has-text("KI-Speiseplanung")');
  await page.waitForSelector('.ai-assistant-panel', { state: 'visible' });
  
  // Click on variety mode
  await page.click('div[data-action="toggleAIMode"][data-param="variety"]');
  await page.waitForTimeout(500);
  
  // Click generate button
  await page.click('button:has-text("KI-Plan erstellen")');
  
  // Wait for meal events to appear
  await page.waitForSelector('.meal-event', { timeout: 10000 });
  
  // Count meal events
  const mealEvents = await page.$$('.meal-event');
  console.log(`Generated ${mealEvents.length} meals`);
  expect(mealEvents.length).toBeGreaterThan(10);
  
  // Take screenshot
  await page.screenshot({ path: 'screenshots/ai-success.png', fullPage: true });
});