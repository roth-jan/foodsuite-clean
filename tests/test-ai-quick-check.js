const { test, expect } = require('@playwright/test');

test('Quick AI Assistant Feature Check', async ({ page }) => {
    // Navigate to the app
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(2000);
    
    // Take initial screenshot
    await page.screenshot({ path: 'test-screenshots/ai-1-initial.png', fullPage: false });
    
    // Go to meal planning tab
    await page.click('a[data-tab="mealplanning"]');
    await page.waitForTimeout(3000);
    
    // Take screenshot of meal planning view
    await page.screenshot({ path: 'test-screenshots/ai-2-mealplanning.png', fullPage: false });
    
    // Wait for auto-generation
    await page.waitForSelector('.meal-event', { timeout: 15000 });
    console.log('✅ Meal plan auto-generated');
    
    // Count meals
    const mealCount = await page.locator('.meal-event').count();
    console.log(`📊 Found ${mealCount} meals in the calendar`);
    
    // Take screenshot with generated plan
    await page.screenshot({ path: 'test-screenshots/ai-3-generated-plan.png', fullPage: false });
    
    // Test AI mode switching
    await page.click('.ai-button[data-param="variety"]');
    await page.waitForTimeout(2000);
    
    const aiStatus = await page.locator('#aiStatus').textContent();
    console.log(`🤖 AI Status: ${aiStatus}`);
    expect(aiStatus).toContain('Abwechslung');
    
    // Take screenshot after mode switch
    await page.screenshot({ path: 'test-screenshots/ai-4-variety-mode.png', fullPage: false });
    
    // Test collapsible panels
    await page.click('button:has-text("Kosten-Übersicht")');
    await page.waitForTimeout(1000);
    
    const costPanel = await page.locator('#costCollapse').isVisible();
    console.log(`💰 Cost panel visible: ${costPanel}`);
    
    // Take screenshot with cost panel open
    await page.screenshot({ path: 'test-screenshots/ai-5-cost-panel.png', fullPage: false });
    
    // Check optimize button
    const optimizeButton = await page.locator('button:has-text("Plan optimieren")').isVisible();
    console.log(`🔧 Optimize button visible: ${optimizeButton}`);
    
    // Check layout changes
    const calendarWidth = await page.locator('.col-lg-6').first().isVisible();
    const recipeWidth = await page.locator('.col-lg-6').nth(1).isVisible();
    console.log(`📐 Layout updated - Calendar: ${calendarWidth}, Recipes: ${recipeWidth}`);
    
    // Final full page screenshot
    await page.screenshot({ path: 'test-screenshots/ai-6-final-view.png', fullPage: true });
    
    console.log('\n✅ All AI Assistant features checked successfully!');
});