const { test, expect } = require('@playwright/test');

test.describe('Debug KI Assistant in Detail', () => {
    test('should trace KI assistant execution step by step', async ({ page }) => {
        // Intercept console logs
        const consoleLogs = [];
        page.on('console', msg => {
            consoleLogs.push(`${msg.type()}: ${msg.text()}`);
        });
        
        // Intercept network requests
        const networkRequests = [];
        page.on('request', request => {
            if (request.url().includes('/api/')) {
                networkRequests.push({
                    method: request.method(),
                    url: request.url(),
                    headers: request.headers()
                });
            }
        });
        
        page.on('response', response => {
            if (response.url().includes('/api/')) {
                networkRequests.push({
                    status: response.status(),
                    url: response.url()
                });
            }
        });
        
        await page.goto('http://localhost:3000');
        await page.waitForLoadState('networkidle');
        
        // Click meal planning tab
        await page.click('a[data-tab="meal-planning"]');
        await page.waitForSelector('#meal-planning', { state: 'visible' });
        
        // Wait for initial auto-generation to complete
        await page.waitForTimeout(5000);
        
        console.log('=== BEFORE MANUAL GENERATION ===');
        
        // Check state before manual generation
        const beforeState = await page.evaluate(() => {
            return {
                appDataExists: typeof window.AppData !== 'undefined',
                recipesCount: window.AppData?.recipes?.length || 0,
                mealPlanCount: Object.keys(window.AppData?.mealPlan || {}).length,
                displayedMeals: document.querySelectorAll('.meal-slot .meal-event').length,
                aiMode: window.AppData?.aiMode || 'not set',
                functionExists: typeof window.generateAIWeekMenu === 'function'
            };
        });
        console.log('Before state:', beforeState);
        
        // Clear meal plan to force fresh generation
        console.log('Clearing meal plan...');
        await page.evaluate(() => {
            if (window.AppData) {
                window.AppData.mealPlan = {};
            }
        });
        
        // Manually trigger recipe loading first
        console.log('Loading recipes manually...');
        await page.evaluate(async () => {
            if (typeof window.loadRecipeLibrary === 'function') {
                await window.loadRecipeLibrary();
            }
        });
        
        await page.waitForTimeout(2000);
        
        // Check if recipes are now loaded
        const afterRecipeLoad = await page.evaluate(() => {
            return {
                recipesCount: window.AppData?.recipes?.length || 0,
                firstRecipe: window.AppData?.recipes?.[0]?.name || 'none'
            };
        });
        console.log('After recipe load:', afterRecipeLoad);
        
        // Now manually trigger AI generation with detailed tracking
        console.log('=== TRIGGERING MANUAL AI GENERATION ===');
        
        const generationResult = await page.evaluate(async () => {
            try {
                console.log('Starting generateAIWeekMenu...');
                
                if (typeof window.generateAIWeekMenu !== 'function') {
                    return { error: 'generateAIWeekMenu function not found' };
                }
                
                // Check prerequisites
                const prereqs = {
                    apiBaseUrl: window.API_BASE_URL || (window.location.origin + '/api'),
                    tenantId: window.TENANT_ID || 'demo',
                    recipesAvailable: window.AppData?.recipes?.length || 0,
                    aiMode: window.AppData?.aiMode || 'cost_optimized'
                };
                console.log('Prerequisites:', prereqs);
                
                // Call the function and track what happens
                await window.generateAIWeekMenu();
                
                // Check result
                const result = {
                    mealPlanAfter: Object.keys(window.AppData?.mealPlan || {}).length,
                    displayedAfter: document.querySelectorAll('.meal-slot .meal-event').length
                };
                
                console.log('Generation completed:', result);
                return { success: true, result };
                
            } catch (error) {
                console.error('Error in manual generation:', error);
                return { error: error.message };
            }
        });
        
        console.log('Generation result:', generationResult);
        
        // Wait for any async operations to complete
        await page.waitForTimeout(3000);
        
        console.log('=== AFTER MANUAL GENERATION ===');
        
        // Check final state
        const finalState = await page.evaluate(() => {
            return {
                mealPlanCount: Object.keys(window.AppData?.mealPlan || {}).length,
                displayedMeals: document.querySelectorAll('.meal-slot .meal-event').length,
                mealPlanKeys: Object.keys(window.AppData?.mealPlan || {}).slice(0, 5),
                recipesCount: window.AppData?.recipes?.length || 0
            };
        });
        console.log('Final state:', finalState);
        
        // Check if there are differences between AppData and display
        if (finalState.displayedMeals > 0 && finalState.mealPlanCount === 0) {
            console.log('❌ PROBLEM: Meals displayed but not in AppData.mealPlan');
            
            // Try to extract data from display
            const displayData = await page.evaluate(() => {
                const mealElements = document.querySelectorAll('.meal-slot .meal-event');
                const meals = [];
                mealElements.forEach((element, index) => {
                    const slot = element.closest('[data-slot]')?.dataset.slot;
                    const recipeId = element.dataset.recipeId;
                    const text = element.textContent?.trim();
                    meals.push({ index, slot, recipeId, text: text?.substring(0, 50) });
                });
                return meals.slice(0, 5); // First 5
            });
            console.log('Display data sample:', displayData);
            
        } else if (finalState.mealPlanCount > 0 && finalState.displayedMeals === 0) {
            console.log('❌ PROBLEM: Data in AppData.mealPlan but not displayed');
            
        } else if (finalState.mealPlanCount > 0 && finalState.displayedMeals > 0) {
            console.log('✅ SUCCESS: Both AppData and display have meals');
            
        } else {
            console.log('❌ PROBLEM: No meals in AppData or display');
        }
        
        // Print network requests
        console.log('Network requests made:');
        networkRequests.forEach((req, i) => {
            console.log(`${i + 1}:`, req);
        });
        
        // Print relevant console logs
        console.log('Relevant console logs:');
        consoleLogs.filter(log => 
            log.includes('AI') || 
            log.includes('meal') || 
            log.includes('recipe') || 
            log.includes('error')
        ).forEach(log => console.log(log));
        
        // Take final screenshot
        await page.screenshot({ 
            path: 'debug-ki-final.png',
            fullPage: true 
        });
    });
});