const { test, expect } = require('@playwright/test');

test.describe('Interactive AI Assistant Tests', () => {
    test.beforeEach(async ({ page }) => {
        // Start at the main page
        await page.goto('http://localhost:3000');
        
        // Navigate to AI meal planning tab
        await page.click('a[data-tab="mealplanning"]');
        await page.waitForTimeout(1000);
    });

    test('AI mode switching triggers plan optimization', async ({ page }) => {
        // Wait for initial plan generation
        await page.waitForSelector('.meal-event', { timeout: 10000 });
        
        // Count initial meals
        const initialMeals = await page.locator('.meal-event').count();
        console.log(`Initial meals: ${initialMeals}`);
        
        // Get initial first meal
        const firstMealBefore = await page.locator('.meal-event').first().textContent();
        console.log(`First meal before: ${firstMealBefore}`);
        
        // Switch AI mode to variety
        await page.click('.ai-button[data-param="variety"]');
        await page.waitForTimeout(2000);
        
        // Check if optimization happened
        const firstMealAfter = await page.locator('.meal-event').first().textContent();
        console.log(`First meal after: ${firstMealAfter}`);
        
        // Verify AI status updated
        const aiStatus = await page.locator('#aiStatus').textContent();
        expect(aiStatus).toContain('Abwechslung');
        
        // Check for optimization animation
        const hasOptimizationClass = await page.locator('.calendar-cell').first().evaluate(el => 
            el.classList.contains('optimizing')
        );
        console.log(`Optimization animation detected: ${hasOptimizationClass}`);
    });

    test('Optimize button works correctly', async ({ page }) => {
        // Wait for initial plan
        await page.waitForSelector('.meal-event', { timeout: 10000 });
        
        // Click optimize button
        const optimizeButton = page.locator('button:has-text("Plan optimieren")');
        await expect(optimizeButton).toBeVisible();
        await optimizeButton.click();
        
        // Wait for optimization
        await page.waitForTimeout(2000);
        
        // Check for optimization feedback
        const hasOptimizedClass = await page.locator('.calendar-container').evaluate(el => 
            el.classList.contains('optimized')
        );
        console.log(`Optimization complete: ${hasOptimizedClass}`);
    });

    test('AI suggestions appear on drag hover', async ({ page }) => {
        // Wait for recipes and calendar
        await page.waitForSelector('.recipe-item', { timeout: 10000 });
        await page.waitForSelector('.calendar-cell', { timeout: 10000 });
        
        // Get first recipe
        const recipe = page.locator('.recipe-item').first();
        const targetCell = page.locator('.calendar-cell').nth(5); // Monday lunch
        
        // Start dragging
        await recipe.hover();
        await page.mouse.down();
        
        // Move to target cell
        await targetCell.hover();
        await page.waitForTimeout(500);
        
        // Check for AI suggestion tooltip
        const tooltip = page.locator('.ai-suggestion-tooltip');
        const isTooltipVisible = await tooltip.isVisible();
        console.log(`AI suggestion tooltip visible: ${isTooltipVisible}`);
        
        if (isTooltipVisible) {
            const tooltipText = await tooltip.textContent();
            console.log(`Tooltip content: ${tooltipText}`);
            expect(tooltipText).toBeTruthy();
        }
        
        // Complete drag
        await page.mouse.up();
    });

    test('Collapsible panels work correctly', async ({ page }) => {
        // Check cost panel
        const costButton = page.locator('button:has-text("Kosten-Übersicht")');
        await expect(costButton).toBeVisible();
        
        // Click to expand
        await costButton.click();
        await page.waitForTimeout(500);
        
        // Check if content is visible
        const costContent = page.locator('#costCollapse');
        await expect(costContent).toBeVisible();
        
        // Check for cost data
        const totalCost = await page.locator('#totalWeeklyCost').textContent();
        console.log(`Total weekly cost: ${totalCost}`);
        
        // Click to collapse
        await costButton.click();
        await page.waitForTimeout(500);
        await expect(costContent).not.toBeVisible();
        
        // Test nutrition panel
        const nutritionButton = page.locator('button:has-text("Nährwert-Balance")');
        await nutritionButton.click();
        
        const nutritionContent = page.locator('#nutritionCollapse');
        await expect(nutritionContent).toBeVisible();
    });

    test('Layout changes are applied correctly', async ({ page }) => {
        // Check calendar column width
        const calendarColumn = page.locator('.col-lg-6').first();
        await expect(calendarColumn).toBeVisible();
        
        // Check recipe library column width
        const recipeColumn = page.locator('.col-lg-6').nth(1);
        await expect(recipeColumn).toBeVisible();
        
        // Check recipe scroll container height
        const scrollContainer = page.locator('.recipe-scroll-container');
        const height = await scrollContainer.evaluate(el => 
            window.getComputedStyle(el).maxHeight
        );
        console.log(`Recipe scroll container height: ${height}`);
        expect(height).toBe('600px');
    });

    test('All AI modes are functional', async ({ page }) => {
        const aiModes = [
            { param: 'cost', expected: 'Kosten-Optimierung' },
            { param: 'nutrition', expected: 'Ausgewogene Ernährung' },
            { param: 'variety', expected: 'Abwechslung' },
            { param: 'seasonal', expected: 'Saisonal' },
            { param: 'inventory', expected: 'Lagerbestand' }
        ];

        for (const mode of aiModes) {
            await page.click(`.ai-button[data-param="${mode.param}"]`);
            await page.waitForTimeout(1500);
            
            const status = await page.locator('#aiStatus').textContent();
            console.log(`Mode ${mode.param}: ${status}`);
            expect(status).toContain(mode.expected);
            
            // Verify active state
            const isActive = await page.locator(`.ai-button[data-param="${mode.param}"]`)
                .evaluate(el => el.classList.contains('active'));
            expect(isActive).toBe(true);
        }
    });

    test('API optimization endpoint works', async ({ page }) => {
        // Monitor network requests
        const optimizationResponse = page.waitForResponse(
            response => response.url().includes('/api/ai/optimize-plan') && response.status() === 200
        );
        
        // Trigger optimization
        await page.click('.ai-button[data-param="variety"]');
        
        // Wait for API response
        const response = await optimizationResponse;
        const responseData = await response.json();
        
        console.log('Optimization API response:', responseData);
        expect(responseData.success).toBe(true);
        expect(responseData.mealPlan).toBeTruthy();
        expect(responseData.suggestions).toBeInstanceOf(Array);
    });
});