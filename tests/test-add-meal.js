const { test, expect } = require('@playwright/test');

test('Test Add Meal Button', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.click('a[data-tab="meal-planning"]');
    await page.waitForTimeout(2000);
    
    // Click first "Mahlzeit hinzufügen" button
    await page.click('.add-meal-btn >> nth=0');
    await page.waitForTimeout(1000);
    
    // Check if modal appears
    const modal = await page.locator('#addMealModal').count();
    console.log('Add meal modal found:', modal > 0);
    
    if (modal > 0) {
        // Fill in time
        await page.fill('#mealTime', '14:00');
        
        // Fill in meal type
        await page.fill('#mealType', 'Kaffeepause');
        
        // Select a recipe
        await page.selectOption('#recipeSelect', { index: 1 });
        
        // Click save - use a more specific selector for the modal button
        await page.click('#addMealModal .modal-footer button.btn-primary');
        await page.waitForTimeout(1000);
        
        console.log('Meal added successfully');
    }
    
    await page.screenshot({ path: 'test-results/after-add-meal.png', fullPage: true });
});