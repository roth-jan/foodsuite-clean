const { test } = require('@playwright/test');

test('take screenshot of meal planning', async ({ page }) => {
  // Navigate to the application
  const filePath = 'file:///' + process.cwd().replace(/\\/g, '/') + '/foodsuite-complete-app.html';
  await page.goto(filePath);
  
  // Wait for page to load
  await page.waitForTimeout(2000);
  
  // Take initial screenshot
  await page.screenshot({ path: 'screenshots/1-initial-page.png', fullPage: true });
  
  // Try to find and click meal planning tab
  const tabs = await page.$$('a.nav-link');
  console.log(`Found ${tabs.length} navigation tabs`);
  
  // Log all visible text
  const allText = await page.$eval('body', el => el.innerText);
  console.log('Page contains:', allText.substring(0, 500));
  
  // Look for meal planning elements
  const mealPlanningLink = await page.$('a:has-text("Speiseplanung")');
  if (mealPlanningLink) {
    console.log('Found meal planning link');
    await mealPlanningLink.click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'screenshots/2-after-click.png', fullPage: true });
  } else {
    console.log('No meal planning link found');
  }
  
  // Check for selectors
  const selectors = ['#mealPlanMode', '#meal-planning', '[data-tab="meal-planning"]', '.ai-assistant-panel'];
  for (const selector of selectors) {
    const element = await page.$(selector);
    console.log(`Selector ${selector}: ${element ? 'FOUND' : 'NOT FOUND'}`);
  }
});