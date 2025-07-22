const { test } = require('@playwright/test');

test('debug page structure', async ({ page }) => {
  // Navigate to the application
  await page.goto('http://localhost:3000/foodsuite-complete-app.html');
  
  // Wait for page to load
  await page.waitForTimeout(3000);
  
  // Take screenshot
  await page.screenshot({ path: 'debug-page-initial.png', fullPage: true });
  
  // Log all navigation links
  const navLinks = await page.$$eval('a.nav-link', links => 
    links.map(link => ({
      text: link.textContent.trim(),
      href: link.getAttribute('href'),
      dataTab: link.getAttribute('data-tab')
    }))
  );
  
  console.log('Navigation links found:', navLinks);
  
  // Log all buttons with data-action
  const actionButtons = await page.$$eval('button[data-action]', buttons => 
    buttons.map(btn => ({
      text: btn.textContent.trim(),
      action: btn.getAttribute('data-action')
    }))
  );
  
  console.log('Action buttons found:', actionButtons);
});