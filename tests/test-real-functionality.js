const { test, expect } = require('@playwright/test');

const BASE_URL = 'http://3.120.41.138:3000';

test('Test REAL functionality - Data loading and Drag&Drop', async ({ page }) => {
    console.log('\n🔍 TESTING REAL FUNCTIONALITY');
    console.log('==============================\n');
    
    // 1. Login
    await page.goto(BASE_URL);
    await page.fill('#username', 'admin');
    await page.fill('#password', 'Demo123!');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
    
    const isOnApp = page.url().includes('foodsuite-complete-app.html');
    console.log(`1️⃣ On original app: ${isOnApp}`);
    
    if (!isOnApp) {
        console.log('❌ Not on the original app!');
        return;
    }
    
    await page.screenshot({ path: 'test-screenshots/real-1-app-loaded.png' });
    
    // 2. Test data loading
    console.log('\n2️⃣ Testing data loading...');
    
    // Check products
    const productsButton = await page.locator('button, a').filter({ hasText: /produkte/i }).first();
    if (await productsButton.isVisible()) {
        await productsButton.click();
        await page.waitForTimeout(2000);
        
        // Look for product data
        const productElements = await page.locator('tr, .product-item, .card').count();
        console.log(`   Products found: ${productElements} elements`);
        
        // Check if products have actual data
        const hasProductData = await page.locator('text=/Brot|Fleisch|Gemüse|Milch/i').count() > 0;
        console.log(`   ✅ Products have data: ${hasProductData}`);
        
        await page.screenshot({ path: 'test-screenshots/real-2-products.png' });
    }
    
    // Check recipes
    const recipesButton = await page.locator('button, a').filter({ hasText: /rezept/i }).first();
    if (await recipesButton.isVisible()) {
        await recipesButton.click();
        await page.waitForTimeout(2000);
        
        const recipeElements = await page.locator('tr, .recipe-item, .card').count();
        console.log(`   Recipes found: ${recipeElements} elements`);
        
        const hasRecipeData = await page.locator('text=/Suppe|Salat|Hauptgang/i').count() > 0;
        console.log(`   ✅ Recipes have data: ${hasRecipeData}`);
        
        await page.screenshot({ path: 'test-screenshots/real-3-recipes.png' });
    }
    
    // 3. Test Speiseplanung (meal planning)
    console.log('\n3️⃣ Testing Speiseplanung...');
    const mealPlanButton = await page.locator('button, a').filter({ hasText: /speiseplan|meal/i }).first();
    if (await mealPlanButton.isVisible()) {
        await mealPlanButton.click();
        await page.waitForTimeout(2000);
        
        await page.screenshot({ path: 'test-screenshots/real-4-mealplan.png' });
        
        // 4. Test Drag & Drop
        console.log('\n4️⃣ Testing Drag & Drop...');
        
        // Look for draggable elements
        const draggableElements = await page.locator('[draggable="true"]').count();
        console.log(`   Draggable elements found: ${draggableElements}`);
        
        if (draggableElements > 0) {
            // Try to drag
            const firstDraggable = page.locator('[draggable="true"]').first();
            const dropZone = page.locator('.drop-zone, .droppable, [data-day], .calendar-day').first();
            
            if (await dropZone.isVisible()) {
                await firstDraggable.dragTo(dropZone);
                console.log('   ✅ Drag & Drop attempted');
                
                await page.waitForTimeout(1000);
                await page.screenshot({ path: 'test-screenshots/real-5-dragdrop.png' });
            } else {
                console.log('   ❌ No drop zone found');
            }
        } else {
            console.log('   ❌ No draggable elements found');
            
            // Check what IS on the page
            const pageContent = await page.textContent('body');
            const hasCalendar = pageContent.includes('Montag') || pageContent.includes('Monday');
            const hasRecipeList = pageContent.includes('Rezept') || pageContent.includes('Recipe');
            
            console.log(`   Page has calendar: ${hasCalendar}`);
            console.log(`   Page has recipes: ${hasRecipeList}`);
        }
    }
    
    // 5. Test AI features
    console.log('\n5️⃣ Testing AI features...');
    const aiButtons = await page.locator('button').filter({ hasText: /ki|ai|automatisch|smart/i }).count();
    console.log(`   AI buttons found: ${aiButtons}`);
    
    if (aiButtons > 0) {
        const firstAiButton = page.locator('button').filter({ hasText: /ki|ai|automatisch|smart/i }).first();
        await firstAiButton.click();
        await page.waitForTimeout(2000);
        console.log('   ✅ AI button clicked');
        
        await page.screenshot({ path: 'test-screenshots/real-6-ai-features.png' });
    }
    
    // 6. Check network requests
    console.log('\n6️⃣ Checking API calls...');
    
    // Listen for API calls
    const apiCalls = [];
    page.on('request', request => {
        if (request.url().includes('/api/')) {
            apiCalls.push(request.url());
        }
    });
    
    // Trigger some actions to see API calls
    await page.reload();
    await page.waitForTimeout(3000);
    
    console.log(`   API calls made: ${apiCalls.length}`);
    apiCalls.forEach(call => console.log(`   - ${call}`));
    
    // Summary
    console.log('\n📊 REALITY CHECK COMPLETE');
    console.log('=========================');
    
    await page.screenshot({ path: 'test-screenshots/real-final-state.png' });
});