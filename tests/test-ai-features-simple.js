const { test, expect } = require('@playwright/test');
const path = require('path');

test('Test AI Features via File URL', async ({ page }) => {
    // Load the HTML file directly
    const filePath = path.join(__dirname, '..', 'foodsuite-complete-app.html');
    await page.goto(`file://${filePath}`);
    await page.waitForTimeout(2000);
    
    console.log('📄 Page loaded via file URL');
    
    // Click on meal planning tab
    const mealPlanningTab = await page.locator('a[data-tab="mealplanning"]').isVisible();
    console.log(`🎯 Meal planning tab visible: ${mealPlanningTab}`);
    
    if (mealPlanningTab) {
        await page.click('a[data-tab="mealplanning"]');
        await page.waitForTimeout(2000);
        
        // Check if AI assistant panel is visible
        const aiPanel = await page.locator('.ai-assistant-panel').isVisible();
        console.log(`🤖 AI assistant panel visible: ${aiPanel}`);
        
        // Check for AI mode buttons
        const aiButtons = await page.locator('.ai-button').count();
        console.log(`🔘 AI mode buttons found: ${aiButtons}`);
        
        // Check for optimize button
        const optimizeBtn = await page.locator('button:has-text("Plan optimieren")').isVisible();
        console.log(`🔧 Optimize button visible: ${optimizeBtn}`);
        
        // Wait for meal calendar
        await page.waitForSelector('#mealCalendar', { timeout: 5000 });
        console.log('📅 Meal calendar loaded');
        
        // Check layout - both columns should be col-lg-6
        const columns = await page.locator('.col-lg-6').count();
        console.log(`📐 Layout columns (col-lg-6): ${columns}`);
        
        // Check collapsible panels
        const costPanel = await page.locator('button:has-text("Kosten-Übersicht")').isVisible();
        const nutritionPanel = await page.locator('button:has-text("Nährwert-Balance")').isVisible();
        console.log(`💰 Cost panel: ${costPanel}, 🥗 Nutrition panel: ${nutritionPanel}`);
        
        // Take final screenshot
        await page.screenshot({ path: 'test-screenshots/ai-features-overview.png', fullPage: true });
        console.log('📸 Screenshot saved');
        
        // Summary
        console.log('\n✅ AI Feature Check Summary:');
        console.log(`   - AI Panel: ${aiPanel ? '✓' : '✗'}`);
        console.log(`   - AI Modes: ${aiButtons > 0 ? '✓' : '✗'} (${aiButtons} modes)`);
        console.log(`   - Optimize Button: ${optimizeBtn ? '✓' : '✗'}`);
        console.log(`   - Layout Updated: ${columns >= 2 ? '✓' : '✗'}`);
        console.log(`   - Collapsible Panels: ${costPanel && nutritionPanel ? '✓' : '✗'}`);
    }
});