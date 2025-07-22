const { test, expect } = require('@playwright/test');

test.describe('Fix KI Assistant', () => {
    test('should fix recipe loading and KI assistant', async ({ page }) => {
        // Navigate to the app
        await page.goto('http://localhost:3000');
        
        // Wait for page load
        await page.waitForLoadState('networkidle');
        
        // Debug the tab switching mechanism
        const tabExists = await page.locator('a[data-tab="meal-planning"]').count();
        console.log('Meal planning tab exists:', tabExists > 0);
        
        // Click on meal planning tab
        await page.click('a[data-tab="meal-planning"]');
        
        // Wait for the meal planning tab content to be visible
        await page.waitForSelector('#meal-planning', { state: 'visible' });
        
        // Check if loadMealPlanning function exists and is called
        const loadMealPlanningExists = await page.evaluate(() => {
            return typeof window.loadMealPlanning === 'function';
        });
        console.log('loadMealPlanning function exists:', loadMealPlanningExists);
        
        // Manually call loadMealPlanning to ensure recipes are loaded
        if (loadMealPlanningExists) {
            console.log('Manually calling loadMealPlanning...');
            await page.evaluate(() => {
                window.loadMealPlanning();
            });
            
            // Wait for async operations to complete
            await page.waitForTimeout(5000);
            
            const recipesLoaded = await page.evaluate(() => {
                return window.AppData.recipes ? window.AppData.recipes.length : 0;
            });
            console.log('Recipes loaded after loadMealPlanning:', recipesLoaded);
            
            if (recipesLoaded > 0) {
                console.log('✅ Recipes loaded successfully, now testing KI assistant');
                
                // Clear any existing meal plan
                await page.evaluate(() => {
                    window.AppData.mealPlan = {};
                });
                
                // Now try KI generation
                const generateButton = await page.locator('button:has-text("KI-Plan erstellen")');
                if (await generateButton.count() > 0) {
                    console.log('Clicking KI-Plan erstellen button...');
                    await generateButton.click();
                    
                    // Wait for generation
                    await page.waitForTimeout(5000);
                    
                    const mealsGenerated = await page.evaluate(() => {
                        return Object.keys(window.AppData.mealPlan).length;
                    });
                    console.log('Meals in AppData.mealPlan:', mealsGenerated);
                    
                    // Check displayed meals in table
                    const displayedMeals = await page.locator('.meal-slot .meal-event').count();
                    console.log('Meals displayed in table:', displayedMeals);
                    
                    if (mealsGenerated > 0 || displayedMeals > 0) {
                        console.log('✅ KI Assistant is working!');
                        
                        // Take success screenshot
                        await page.screenshot({ 
                            path: 'ki-assistant-working.png',
                            fullPage: true 
                        });
                    } else {
                        console.log('❌ KI Assistant still not generating meals');
                        
                        // Debug the AI generation
                        const aiModeExists = await page.evaluate(() => {
                            return typeof window.getCurrentAIMode === 'function';
                        });
                        console.log('getCurrentAIMode function exists:', aiModeExists);
                        
                        const currentMode = await page.evaluate(() => {
                            return window.AppData.aiMode || 'not set';
                        });
                        console.log('Current AI mode:', currentMode);
                        
                        // Check if generateAIWeekMenu function exists
                        const generateFunctionExists = await page.evaluate(() => {
                            return typeof window.generateAIWeekMenu === 'function';
                        });
                        console.log('generateAIWeekMenu function exists:', generateFunctionExists);
                    }
                }
            } else {
                console.log('❌ Still no recipes loaded');
                
                // Try direct API call
                console.log('Testing direct API call...');
                const apiResponse = await page.evaluate(async () => {
                    try {
                        const response = await fetch('http://localhost:3000/api/recipes?limit=60', {
                            headers: {
                                'X-Tenant-ID': 'demo'
                            }
                        });
                        if (response.ok) {
                            const data = await response.json();
                            return {
                                success: true,
                                count: data.items ? data.items.length : 0
                            };
                        } else {
                            return {
                                success: false,
                                status: response.status,
                                statusText: response.statusText
                            };
                        }
                    } catch (error) {
                        return {
                            success: false,
                            error: error.message
                        };
                    }
                });
                console.log('Direct API response:', apiResponse);
            }
        }
    });
});