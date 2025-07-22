const { test } = require('@playwright/test');

test('debug AI generation with console logs', async ({ page }) => {
  // Capture console messages
  const consoleLogs = [];
  page.on('console', msg => {
    consoleLogs.push({
      type: msg.type(),
      text: msg.text()
    });
  });

  // Navigate to the application
  await page.goto('http://localhost:3000');
  
  // Wait for page to load
  await page.waitForTimeout(2000);
  
  // Click on meal planning tab
  await page.click('a:has-text("KI-Speiseplanung")');
  
  // Wait for meal planning section to be visible
  await page.waitForSelector('.ai-assistant-panel', { state: 'visible' });
  
  // Check current AI mode
  const activeMode = await page.$eval('.ai-button.active', el => el.textContent);
  console.log('Active AI Mode:', activeMode);
  
  // Click the KI-Plan erstellen button
  console.log('Clicking KI-Plan erstellen button...');
  await page.click('button:has-text("KI-Plan erstellen")');
  
  // Wait for response
  await page.waitForTimeout(3000);
  
  // Print all console logs
  console.log('\n=== Console Logs ===');
  consoleLogs.forEach(log => {
    console.log(`[${log.type}] ${log.text}`);
  });
  
  // Check network activity
  const failedRequests = [];
  page.on('requestfailed', request => {
    failedRequests.push({
      url: request.url(),
      failure: request.failure()
    });
  });
  
  // Make another attempt to see network errors
  await page.click('button:has-text("KI-Plan erstellen")');
  await page.waitForTimeout(2000);
  
  if (failedRequests.length > 0) {
    console.log('\n=== Failed Requests ===');
    failedRequests.forEach(req => {
      console.log(`Failed: ${req.url}`);
      console.log(`Reason: ${req.failure.errorText}`);
    });
  }
  
  // Check for toast messages
  const toasts = await page.$$eval('.toast-body', elements => 
    elements.map(el => el.textContent)
  );
  if (toasts.length > 0) {
    console.log('\n=== Toast Messages ===');
    toasts.forEach(toast => console.log(toast));
  }
  
  // Take screenshot
  await page.screenshot({ path: 'screenshots/ai-debug.png', fullPage: true });
});