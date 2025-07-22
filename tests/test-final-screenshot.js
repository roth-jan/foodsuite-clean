const { test } = require('@playwright/test');

test('take final screenshot', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.waitForTimeout(3000);
  
  // Take screenshot
  await page.screenshot({ path: 'screenshots/final-state.png', fullPage: true });
  
  // Look for navigation elements
  const navLinks = await page.$$eval('a', links => 
    links.map(link => link.textContent.trim()).filter(text => text.length > 0)
  );
  
  console.log('All links found:', navLinks);
  
  // Try different selectors
  const selectors = [
    'a:has-text("Speiseplanung")',
    'a[href*="meal"]',
    'a[data-tab="meal-planning"]',
    '.nav-link'
  ];
  
  for (const selector of selectors) {
    const elements = await page.$$(selector);
    console.log(`Selector "${selector}" found ${elements.length} elements`);
  }
});