const { test, expect } = require('@playwright/test');

test.describe('KI Assistant Functionality', () => {
    test('should test KI assistant meal plan generation', async ({ page }) => {
        // Navigate to the app
        await page.goto('http://localhost:3000');
        
        // Wait for page load
        await page.waitForLoadState('networkidle');
        
        // Click on meal planning tab
        await page.click('a[data-tab="meal-planning"]');
        
        // Wait for the meal planning tab content to be visible
        await page.waitForSelector('#meal-planning', { state: 'visible' });
        
        // Wait for calendar to load
        await page.waitForSelector('.meal-planning-table', { state: 'visible' });
        
        console.log('✅ Calendar loaded');
        
        // Check if KI Plan erstellen button exists
        const aiButton = await page.locator('button:has-text("KI-Plan erstellen")');
        const aiButtonExists = await aiButton.count() > 0;
        console.log('KI-Plan erstellen button exists:', aiButtonExists);
        
        if (aiButtonExists) {
            // Check AI mode selector
            const aiModeSelect = await page.locator('#aiModeSelect');
            const aiModeExists = await aiModeSelect.count() > 0;
            console.log('AI mode selector exists:', aiModeExists);
            
            if (aiModeExists) {
                const selectedMode = await aiModeSelect.inputValue();
                console.log('Current AI mode:', selectedMode);
            }
            
            // Clear existing meal plan first
            console.log('Clearing existing meal plan...');
            await page.evaluate(() => {
                if (window.AppData) {
                    window.AppData.mealPlan = {};
                    console.log('Cleared AppData.mealPlan');
                }
            });
            
            // Click the AI generation button
            console.log('Clicking KI-Plan erstellen button...');
            await aiButton.click();
            
            // Wait for generation to complete
            await page.waitForTimeout(3000);
            
            // Check if meals were generated
            const mealCells = await page.locator('.meal-slot .meal-event');
            const mealCount = await mealCells.count();
            console.log('Number of generated meals:', mealCount);
            
            if (mealCount > 0) {
                // Get some meal details
                for (let i = 0; i < Math.min(3, mealCount); i++) {
                    const mealText = await mealCells.nth(i).textContent();
                    console.log(`Meal ${i + 1}:`, mealText?.trim());
                }
                console.log('✅ KI Assistant successfully generated meals');
            } else {
                console.log('❌ No meals were generated by KI Assistant');
                
                // Check console for errors
                const consoleLogs = [];
                page.on('console', msg => consoleLogs.push(msg.text()));
                
                // Try to debug the issue
                const appDataExists = await page.evaluate(() => {
                    return typeof window.AppData !== 'undefined';
                });
                console.log('AppData exists:', appDataExists);
                
                if (appDataExists) {
                    const mealPlanData = await page.evaluate(() => {
                        return window.AppData.mealPlan;
                    });
                    console.log('Current meal plan data:', mealPlanData);
                    
                    const recipesCount = await page.evaluate(() => {
                        return window.AppData.recipes ? window.AppData.recipes.length : 0;
                    });
                    console.log('Number of recipes available:', recipesCount);
                }
            }
        } else {
            console.log('❌ KI-Plan erstellen button not found');
        }
        
        // Take screenshot for debugging
        await page.screenshot({ 
            path: 'ai-assistant-debug.png',
            fullPage: true 
        });
        
        // Check for any JavaScript errors
        const errors = [];
        page.on('pageerror', error => errors.push(error.message));
        
        if (errors.length > 0) {
            console.log('JavaScript errors found:');
            errors.forEach(error => console.log(' -', error));
        }
    });
});