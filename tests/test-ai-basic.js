const { test, expect } = require('@playwright/test');

test.describe('Basic AI Meal Planning Test', () => {
  test('should load meal planning page and interact with AI', async ({ page }) => {
    // Navigate to the application (open as file)
    const filePath = 'file:///' + process.cwd().replace(/\\/g, '/') + '/foodsuite-complete-app.html';
    await page.goto(filePath);
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Click on meal planning tab
    await page.click('a[data-tab="meal-planning"]');
    
    // Wait for meal planning section to be visible
    await page.waitForSelector('#meal-planning', { state: 'visible' });
    
    // Check if AI mode selector exists
    const modeSelector = await page.$('#mealPlanMode');
    expect(modeSelector).toBeTruthy();
    
    // Check if generate button exists
    const generateButton = await page.$('button[data-action="generateAIWeekMenu"]');
    expect(generateButton).toBeTruthy();
    
    // Select a mode
    await page.selectOption('#mealPlanMode', 'cost_optimized');
    
    // Click generate button
    await page.click('button[data-action="generateAIWeekMenu"]');
    
    // Wait for any response (toast or meal events)
    await page.waitForTimeout(3000);
    
    // Take a screenshot for debugging
    await page.screenshot({ path: 'ai-test-screenshot.png', fullPage: true });
    
    // Check if any meals were added to the calendar
    const mealEvents = await page.$$('.meal-event');
    console.log(`Found ${mealEvents.length} meal events`);
    
    // Also check for any error messages
    const toasts = await page.$$('.toast-body');
    for (const toast of toasts) {
      const text = await toast.textContent();
      console.log('Toast message:', text);
    }
  });
});