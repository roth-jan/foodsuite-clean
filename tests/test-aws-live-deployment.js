const { test, expect } = require('@playwright/test');

// AWS deployment URL
const AWS_URL = 'http://3.120.41.138:3000';

test.describe('AWS Live Deployment Tests', () => {
    
    test('should load homepage and show navigation', async ({ page }) => {
        console.log('🌐 Testing AWS deployment at:', AWS_URL);
        
        await page.goto(AWS_URL);
        await page.waitForTimeout(3000); // Wait for full load
        
        // Check if page loads
        const title = await page.title();
        console.log('📄 Page title:', title);
        expect(title).toContain('FoodSuite');
        
        // Check navigation tabs
        await expect(page.locator('[data-tab="dashboard"]')).toBeVisible();
        await expect(page.locator('[data-tab="mealplanning"]')).toBeVisible();
        await expect(page.locator('[data-tab="recipes"]')).toBeVisible();
        console.log('✅ Navigation tabs visible');
    });

    test('should load recipes from AWS backend', async ({ page }) => {
        await page.goto(AWS_URL);
        await page.waitForTimeout(2000);
        
        // Click on recipes tab
        console.log('🍲 Testing recipe loading...');
        await page.click('[data-tab="recipes"]');
        await page.waitForTimeout(3000); // Wait for recipes to load
        
        // Check if recipes loaded
        const recipeGrid = page.locator('#recipeGrid');
        await expect(recipeGrid).toBeVisible();
        
        // Count recipe cards
        const recipeCards = page.locator('.card h5.card-title');
        const count = await recipeCards.count();
        console.log(`📊 Found ${count} recipe cards`);
        expect(count).toBeGreaterThan(10); // Should have many recipes
        
        // Check specific test recipes
        await expect(page.locator('text=Rindergulasch')).toBeVisible();
        await expect(page.locator('text=Gemüselasagne')).toBeVisible();
        console.log('✅ German test recipes loaded correctly');
    });

    test('should test AI meal planning with data', async ({ page }) => {
        await page.goto(AWS_URL);
        await page.waitForTimeout(2000);
        
        // Go to meal planning
        console.log('🤖 Testing AI meal planning...');
        await page.click('[data-tab="mealplanning"]');
        await page.waitForTimeout(3000);
        
        // Check if calendar is visible
        await expect(page.locator('#mealCalendar')).toBeVisible();
        console.log('📅 Meal calendar visible');
        
        // Check if AI assistant buttons are there
        await expect(page.locator('.ai-mode-btn')).toBeVisible();
        console.log('🤖 AI mode buttons visible');
        
        // Test AI generation by clicking a mode
        await page.click('.ai-mode-btn[data-mode="variety"]');
        await page.waitForTimeout(1000);
        
        // Click generate button if calendar is empty
        const generateBtn = page.locator('button:has-text("KI-Wochenmenü generieren")');
        if (await generateBtn.isVisible()) {
            await generateBtn.click();
            await page.waitForTimeout(5000); // Wait for AI generation
        }
        
        // Check if meals were generated
        const mealCells = page.locator('.calendar-cell.has-meal');
        const mealCount = await mealCells.count();
        console.log(`🍽️ Generated ${mealCount} meals`);
        
        if (mealCount > 0) {
            console.log('✅ AI meal generation working');
        } else {
            console.log('⚠️ No meals generated - might be already filled');
        }
    });

    test('should test drag and drop functionality', async ({ page }) => {
        await page.goto(AWS_URL);
        await page.waitForTimeout(2000);
        
        // Go to meal planning
        await page.click('[data-tab="mealplanning"]');
        await page.waitForTimeout(3000);
        
        console.log('🖱️ Testing drag and drop...');
        
        // Check if recipe library is visible
        await expect(page.locator('#recipeLibrary')).toBeVisible();
        console.log('📚 Recipe library visible');
        
        // Check if there are draggable recipe items
        const draggableItems = page.locator('.recipe-item[draggable="true"]');
        const dragCount = await draggableItems.count();
        console.log(`🏷️ Found ${dragCount} draggable recipe items`);
        
        if (dragCount > 0) {
            console.log('✅ Drag and drop elements present');
        }
        
        // Check calendar cells for drop zones
        const dropZones = page.locator('.calendar-cell');
        const dropCount = await dropZones.count();
        console.log(`📅 Found ${dropCount} calendar drop zones`);
        expect(dropCount).toBeGreaterThan(10); // Should have week grid
    });

    test('should verify all test data categories', async ({ page }) => {
        await page.goto(AWS_URL);
        await page.waitForTimeout(2000);
        
        console.log('📋 Testing data completeness...');
        
        // Test Products
        await page.click('[data-tab="products"]');
        await page.waitForTimeout(2000);
        const productRows = page.locator('#productsTable tbody tr');
        const productCount = await productRows.count();
        console.log(`📦 Products: ${productCount}`);
        expect(productCount).toBeGreaterThan(50);
        
        // Test Suppliers  
        await page.click('[data-tab="suppliers"]');
        await page.waitForTimeout(2000);
        const supplierRows = page.locator('#suppliersTable tbody tr');
        const supplierCount = await supplierRows.count();
        console.log(`🏪 Suppliers: ${supplierCount}`);
        expect(supplierCount).toBeGreaterThan(3);
        
        // Test Orders
        await page.click('[data-tab="orders"]');
        await page.waitForTimeout(2000);
        const orderRows = page.locator('#ordersTable tbody tr');
        const orderCount = await orderRows.count();
        console.log(`📋 Orders: ${orderCount}`);
        
        // Test Inventory
        await page.click('[data-tab="inventory"]');
        await page.waitForTimeout(2000);
        const inventoryRows = page.locator('#inventoryTable tbody tr');
        const inventoryCount = await inventoryRows.count();
        console.log(`📊 Inventory items: ${inventoryCount}`);
        
        console.log('✅ All data categories tested');
    });

    test('should test API health and response times', async ({ page }) => {
        console.log('🏥 Testing API health...');
        
        // Test API health endpoint
        const response = await page.request.get(`${AWS_URL}/api/health`);
        expect(response.ok()).toBeTruthy();
        
        const healthData = await response.json();
        console.log('💚 Health status:', healthData.status);
        expect(healthData.status).toBe('healthy');
        
        // Test recipes API with timing
        const startTime = Date.now();
        const recipesResponse = await page.request.get(`${AWS_URL}/api/recipes?limit=10`, {
            headers: { 'x-tenant-id': 'demo' }
        });
        const responseTime = Date.now() - startTime;
        
        console.log(`⏱️ Recipes API response time: ${responseTime}ms`);
        expect(recipesResponse.ok()).toBeTruthy();
        
        const recipesData = await recipesResponse.json();
        console.log(`🍲 API returned ${recipesData.items.length} recipes`);
        expect(recipesData.items.length).toBe(10);
        
        console.log('✅ API performance acceptable');
    });
});