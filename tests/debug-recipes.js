const { test, expect } = require('@playwright/test');

test.describe('Debug Recipe Loading', () => {
    test('should check recipe loading process', async ({ page }) => {
        // Navigate to the app
        await page.goto('http://localhost:3000');
        
        // Wait for page load
        await page.waitForLoadState('networkidle');
        
        // Click on meal planning tab
        await page.click('a[data-tab="meal-planning"]');
        
        // Wait for the meal planning tab content to be visible
        await page.waitForSelector('#meal-planning', { state: 'visible' });
        
        // Wait longer for everything to load
        await page.waitForTimeout(5000);
        
        // Check if loadRecipeLibrary was called
        const appDataExists = await page.evaluate(() => {
            return typeof window.AppData !== 'undefined';
        });
        console.log('AppData exists:', appDataExists);
        
        if (appDataExists) {
            const recipesLoaded = await page.evaluate(() => {
                return window.AppData.recipes ? window.AppData.recipes.length : 0;
            });
            console.log('Recipes in AppData:', recipesLoaded);
            
            // Try to manually trigger loadRecipeLibrary
            console.log('Manually triggering loadRecipeLibrary...');
            await page.evaluate(() => {
                if (typeof window.loadRecipeLibrary === 'function') {
                    window.loadRecipeLibrary();
                    return 'loadRecipeLibrary called';
                }
                return 'loadRecipeLibrary not found';
            });
            
            // Wait for it to complete
            await page.waitForTimeout(3000);
            
            const recipesAfterManual = await page.evaluate(() => {
                return window.AppData.recipes ? window.AppData.recipes.length : 0;
            });
            console.log('Recipes after manual loading:', recipesAfterManual);
            
            if (recipesAfterManual > 0) {
                console.log('✅ Recipes loaded successfully');
                
                // Now try AI generation
                console.log('Trying AI generation...');
                await page.evaluate(() => {
                    if (typeof window.generateAIWeekMenu === 'function') {
                        window.generateAIWeekMenu();
                    }
                });
                
                await page.waitForTimeout(3000);
                
                const mealsGenerated = await page.evaluate(() => {
                    return Object.keys(window.AppData.mealPlan).length;
                });
                console.log('Meals generated after AI call:', mealsGenerated);
                
                // Check if meals are displayed in table
                const displayedMeals = await page.locator('.meal-slot .meal-event').count();
                console.log('Meals displayed in table:', displayedMeals);
                
            } else {
                console.log('❌ Failed to load recipes even manually');
                
                // Check for errors
                const pageErrors = [];
                page.on('pageerror', error => pageErrors.push(error.message));
                console.log('Page errors:', pageErrors);
                
                // Check network requests
                const responses = [];
                page.on('response', response => {
                    if (response.url().includes('/api/recipes')) {
                        responses.push({
                            url: response.url(),
                            status: response.status(),
                            statusText: response.statusText()
                        });
                    }
                });
                console.log('Recipe API responses:', responses);
            }
        }
    });
});