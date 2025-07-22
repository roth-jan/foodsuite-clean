const { test, expect } = require('@playwright/test');

test.describe('Working AI Meal Planning Test', () => {
  test('should generate AI meal plan', async ({ page }) => {
    // Navigate to the application
    await page.goto('http://localhost:3000');
    
    // Wait for page to load
    await page.waitForTimeout(2000);
    
    // Click on meal planning tab
    await page.click('a:has-text("KI-Speiseplanung")');
    
    // Wait for meal planning section to be visible
    await page.waitForSelector('.ai-assistant-panel', { state: 'visible' });
    
    // Click on a different AI mode button (e.g., Abwechslung)
    await page.click('div[data-action="toggleAIMode"][data-param="variety"]');
    await page.waitForTimeout(500);
    
    // Click the KI-Plan erstellen button
    console.log('Clicking KI-Plan erstellen button...');
    await page.click('button:has-text("KI-Plan erstellen")');
    
    // Wait for some response
    await page.waitForTimeout(5000);
    
    // Take screenshot
    await page.screenshot({ path: 'screenshots/ai-plan-generated.png', fullPage: true });
    
    // Check if any meals were added to the calendar
    const calendarCells = await page.$$('.calendar-cell');
    console.log(`Found ${calendarCells.length} calendar cells`);
    
    // Check for meal events
    const mealEvents = await page.$$('.meal-event');
    console.log(`Found ${mealEvents.length} meal events`);
    
    // Check for any error toasts
    const toasts = await page.$$('.toast');
    for (const toast of toasts) {
      const isVisible = await toast.isVisible();
      if (isVisible) {
        const text = await toast.textContent();
        console.log('Toast message:', text);
      }
    }
    
    // Check if recipes were loaded
    const recipeItems = await page.$$('.recipe-item');
    console.log(`Found ${recipeItems.length} recipes in library`);
    
    // Log any console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('Console error:', msg.text());
      }
    });
    
    // Try to manually inspect what happened
    const pageContent = await page.$eval('body', el => el.innerText);
    if (pageContent.includes('Fehler')) {
      console.log('Found error message in page');
    }
  });
});