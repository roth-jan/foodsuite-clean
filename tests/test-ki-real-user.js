const { test, expect } = require('@playwright/test');

test.describe('Real User KI Assistant Test', () => {
    test('should test KI assistant like a real user', async ({ page }) => {
        // Start with headless false to see what's happening
        await page.goto('http://localhost:3000');
        
        // Wait for page load
        await page.waitForLoadState('networkidle');
        
        console.log('Page loaded');
        
        // Take initial screenshot
        await page.screenshot({ 
            path: 'step1-initial-page.png',
            fullPage: true 
        });
        
        // Look for and click meal planning tab
        const mealPlanningTab = await page.locator('a[data-tab="meal-planning"]');
        const tabExists = await mealPlanningTab.count();
        console.log('Meal planning tab exists:', tabExists > 0);
        
        if (tabExists > 0) {
            await mealPlanningTab.click();
            console.log('Clicked meal planning tab');
            
            // Wait for content to load
            await page.waitForSelector('#meal-planning', { state: 'visible' });
            await page.waitForTimeout(3000);
            
            // Take screenshot after switching to meal planning
            await page.screenshot({ 
                path: 'step2-meal-planning-tab.png',
                fullPage: true 
            });
            
            // Check if table is visible
            const tableExists = await page.locator('.meal-planning-table').count();
            console.log('Meal planning table exists:', tableExists > 0);
            
            // Check if AI button is visible
            const aiButton = await page.locator('button:has-text("KI-Plan erstellen")');
            const aiButtonExists = await aiButton.count();
            console.log('KI-Plan erstellen button exists:', aiButtonExists > 0);
            
            if (aiButtonExists > 0) {
                // Check if button is enabled
                const isEnabled = await aiButton.isEnabled();
                console.log('KI button is enabled:', isEnabled);
                
                // Check button visibility
                const isVisible = await aiButton.isVisible();
                console.log('KI button is visible:', isVisible);
                
                if (isVisible && isEnabled) {
                    console.log('Clicking KI-Plan erstellen button...');
                    
                    // Check current meal plan before clicking
                    const beforeMeals = await page.locator('.meal-slot .meal-event').count();
                    console.log('Meals before AI generation:', beforeMeals);
                    
                    // Click the button
                    await aiButton.click();
                    console.log('Button clicked');
                    
                    // Wait for generation
                    await page.waitForTimeout(5000);
                    
                    // Take screenshot after clicking
                    await page.screenshot({ 
                        path: 'step3-after-ai-click.png',
                        fullPage: true 
                    });
                    
                    // Check for meals after generation
                    const afterMeals = await page.locator('.meal-slot .meal-event').count();
                    console.log('Meals after AI generation:', afterMeals);
                    
                    // Check if any toast messages appeared
                    const toastMessages = await page.locator('.toast').count();
                    console.log('Toast messages shown:', toastMessages);
                    
                    if (toastMessages > 0) {
                        const toastTexts = await page.locator('.toast').allTextContents();
                        console.log('Toast messages:', toastTexts);
                    }
                    
                    // Check meal plan data in browser
                    const mealPlanData = await page.evaluate(() => {
                        if (window.AppData && window.AppData.mealPlan) {
                            return {
                                count: Object.keys(window.AppData.mealPlan).length,
                                keys: Object.keys(window.AppData.mealPlan).slice(0, 5) // First 5 keys
                            };
                        }
                        return { count: 0, keys: [] };
                    });
                    console.log('AppData meal plan:', mealPlanData);
                    
                    // Check if recipes are loaded
                    const recipesData = await page.evaluate(() => {
                        if (window.AppData && window.AppData.recipes) {
                            return {
                                count: window.AppData.recipes.length,
                                first: window.AppData.recipes[0] ? window.AppData.recipes[0].name : 'none'
                            };
                        }
                        return { count: 0, first: 'none' };
                    });
                    console.log('AppData recipes:', recipesData);
                    
                    // Try to find specific meal slots and their content
                    const mondayBreakfast = await page.locator('[data-slot="monday-breakfast"]').textContent();
                    console.log('Monday breakfast content:', mondayBreakfast?.trim());
                    
                    const tuesdayLunch = await page.locator('[data-slot="tuesday-lunch"]').textContent();
                    console.log('Tuesday lunch content:', tuesdayLunch?.trim());
                    
                    // Check if the issue is with display or generation
                    if (mealPlanData.count > 0 && afterMeals === 0) {
                        console.log('❌ AI generated data but display is not working');
                        
                        // Try to manually trigger refresh
                        await page.evaluate(() => {
                            if (typeof window.refreshMealPlanningDisplay === 'function') {
                                window.refreshMealPlanningDisplay();
                            }
                        });
                        
                        await page.waitForTimeout(1000);
                        
                        const afterRefresh = await page.locator('.meal-slot .meal-event').count();
                        console.log('Meals after manual refresh:', afterRefresh);
                        
                        await page.screenshot({ 
                            path: 'step4-after-manual-refresh.png',
                            fullPage: true 
                        });
                        
                    } else if (mealPlanData.count === 0) {
                        console.log('❌ AI did not generate any meal plan data');
                        
                        // Check for errors in console
                        const consoleLogs = [];
                        page.on('console', msg => {
                            if (msg.type() === 'error') {
                                consoleLogs.push(msg.text());
                            }
                        });
                        
                        // Try to trigger AI generation manually
                        const manualResult = await page.evaluate(async () => {
                            try {
                                if (typeof window.generateAIWeekMenu === 'function') {
                                    await window.generateAIWeekMenu();
                                    return 'Manual generation called';
                                }
                                return 'generateAIWeekMenu function not found';
                            } catch (error) {
                                return 'Error: ' + error.message;
                            }
                        });
                        
                        console.log('Manual generation result:', manualResult);
                        
                    } else if (afterMeals > 0) {
                        console.log('✅ KI Assistant is working correctly!');
                        
                        // Take final success screenshot
                        await page.screenshot({ 
                            path: 'step5-success.png',
                            fullPage: true 
                        });
                    }
                    
                } else {
                    console.log('❌ KI button is not clickable');
                    console.log('Button enabled:', isEnabled);
                    console.log('Button visible:', isVisible);
                }
            } else {
                console.log('❌ KI-Plan erstellen button not found');
                
                // Look for any buttons with "KI" in them
                const kiButtons = await page.locator('button:has-text("KI")').count();
                console.log('Buttons containing "KI":', kiButtons);
                
                // Look for any buttons in the meal planning area
                const allButtons = await page.locator('#meal-planning button').count();
                console.log('All buttons in meal planning area:', allButtons);
                
                if (allButtons > 0) {
                    const buttonTexts = await page.locator('#meal-planning button').allTextContents();
                    console.log('Button texts:', buttonTexts);
                }
            }
        } else {
            console.log('❌ Meal planning tab not found');
        }
    });
});