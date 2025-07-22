const { test, expect } = require('@playwright/test');

test.describe('Test Recipe API', () => {
    test('should debug recipe loading in detail', async ({ page }) => {
        // Listen for console logs and errors
        const consoleLogs = [];
        const pageErrors = [];
        const networkRequests = [];
        
        page.on('console', msg => {
            consoleLogs.push(`${msg.type()}: ${msg.text()}`);
        });
        
        page.on('pageerror', error => {
            pageErrors.push(error.message);
        });
        
        page.on('response', response => {
            if (response.url().includes('/api/recipes')) {
                networkRequests.push({
                    url: response.url(),
                    status: response.status(),
                    statusText: response.statusText()
                });
            }
        });
        
        // Navigate to the app
        await page.goto('http://localhost:3000');
        
        // Wait for page load
        await page.waitForLoadState('networkidle');
        
        // Check if constants are defined
        const constants = await page.evaluate(() => {
            return {
                API_BASE_URL: window.API_BASE_URL,
                TENANT_ID: window.TENANT_ID
            };
        });
        console.log('Constants defined:', constants);
        
        // Click on meal planning tab
        await page.click('a[data-tab="meal-planning"]');
        
        // Wait for the meal planning tab content to be visible
        await page.waitForSelector('#meal-planning', { state: 'visible' });
        
        // Check if recipe list element exists
        const recipeListExists = await page.locator('#recipeList').count();
        console.log('Recipe list element exists:', recipeListExists > 0);
        
        // Try to call loadRecipeLibrary directly with detailed error handling
        console.log('Calling loadRecipeLibrary with error handling...');
        const result = await page.evaluate(async () => {
            try {
                if (typeof window.loadRecipeLibrary !== 'function') {
                    return { error: 'loadRecipeLibrary function not found' };
                }
                
                // Check if API_BASE_URL and TENANT_ID are available
                const API_BASE_URL = window.API_BASE_URL || (window.location.origin + '/api');
                const TENANT_ID = window.TENANT_ID || 'demo';
                
                console.log('Using API_BASE_URL:', API_BASE_URL);
                console.log('Using TENANT_ID:', TENANT_ID);
                
                // Make direct fetch call
                const response = await fetch(`${API_BASE_URL}/recipes?limit=60`, {
                    headers: {
                        'X-Tenant-ID': TENANT_ID
                    }
                });
                
                console.log('Response status:', response.status);
                console.log('Response ok:', response.ok);
                
                if (!response.ok) {
                    return { error: `API call failed: ${response.status} ${response.statusText}` };
                }
                
                const data = await response.json();
                console.log('Data received:', data);
                
                const recipes = data.items || [];
                console.log('Recipes count:', recipes.length);
                
                // Update AppData.recipes
                if (!window.AppData) {
                    window.AppData = {};
                }
                window.AppData.recipes = recipes;
                
                console.log('AppData.recipes updated:', window.AppData.recipes.length);
                
                return { 
                    success: true, 
                    count: recipes.length,
                    firstRecipe: recipes[0] ? recipes[0].name : 'none'
                };
                
            } catch (error) {
                console.error('Error in loadRecipeLibrary:', error);
                return { error: error.message };
            }
        });
        
        console.log('loadRecipeLibrary result:', result);
        
        // Wait a bit then check AppData
        await page.waitForTimeout(1000);
        
        const finalCheck = await page.evaluate(() => {
            return {
                appDataExists: typeof window.AppData !== 'undefined',
                recipesCount: window.AppData && window.AppData.recipes ? window.AppData.recipes.length : 0,
                mealPlanCount: window.AppData && window.AppData.mealPlan ? Object.keys(window.AppData.mealPlan).length : 0
            };
        });
        console.log('Final AppData check:', finalCheck);
        
        // Now try AI generation if recipes are loaded
        if (finalCheck.recipesCount > 0) {
            console.log('✅ Recipes loaded, testing AI generation...');
            
            const aiResult = await page.evaluate(async () => {
                try {
                    if (typeof window.generateAIWeekMenu === 'function') {
                        await window.generateAIWeekMenu();
                        return { success: true };
                    } else {
                        return { error: 'generateAIWeekMenu function not found' };
                    }
                } catch (error) {
                    return { error: error.message };
                }
            });
            
            console.log('AI generation result:', aiResult);
            
            await page.waitForTimeout(3000);
            
            const finalMealPlan = await page.evaluate(() => {
                return Object.keys(window.AppData.mealPlan).length;
            });
            console.log('Final meal plan count:', finalMealPlan);
            
            // Check displayed meals
            const displayedMeals = await page.locator('.meal-slot .meal-event').count();
            console.log('Displayed meals in table:', displayedMeals);
        }
        
        // Print debug info
        console.log('Console logs:', consoleLogs.slice(-10)); // Last 10 logs
        console.log('Page errors:', pageErrors);
        console.log('Network requests:', networkRequests);
        
        // Take screenshot
        await page.screenshot({ 
            path: 'recipe-debug.png',
            fullPage: true 
        });
    });
});