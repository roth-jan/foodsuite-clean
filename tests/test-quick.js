const { test, expect } = require('@playwright/test');

test('quick navigation test', async ({ page }) => {
  // Go to the application
  await page.goto('http://localhost:3456');
  await page.waitForTimeout(2000);
  
  console.log('Page loaded, testing products tab...');
  
  // Click on products tab
  await page.click('a[href="#products"]');
  await page.waitForTimeout(3000);
  
  // Check if products tab is active
  const productsTab = page.locator('#products');
  const hasActiveClass = await productsTab.getAttribute('class');
  console.log(`Products tab class: ${hasActiveClass}`);
  
  // Check if API was called
  const tableBody = page.locator('#productsTableBody');
  const tableContent = await tableBody.textContent();
  console.log(`Table content: "${tableContent}"`);
  
  expect(hasActiveClass).toContain('active');
});