const { test, expect } = require('@playwright/test');

const BASE_URL = 'http://3.120.41.138:3000';

test('Detailed Issue Analysis', async ({ page }) => {
    console.log('\n🔬 DETAILED ISSUE ANALYSIS');
    console.log('==========================\n');
    
    // Login first
    await page.goto(BASE_URL);
    await page.fill('#username', 'admin');
    await page.fill('#password', 'Demo123!');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
    
    console.log('✅ Logged in');
    
    // 1. Check what tabs/buttons are available
    console.log('\n1️⃣ Available navigation...');
    const allButtons = await page.locator('button, a').allTextContents();
    const navButtons = allButtons.filter(text => text.length > 0 && text.length < 50);
    console.log('   Available buttons/links:');
    navButtons.forEach(btn => console.log(`   - "${btn}"`));
    
    // 2. Specifically test product loading
    console.log('\n2️⃣ Testing product data loading...');
    
    // Try to find products section
    const productButton = await page.locator('button, a').filter({ hasText: /produkt/i }).first();
    if (await productButton.isVisible()) {
        console.log('   Found products button, clicking...');
        await productButton.click();
        await page.waitForTimeout(3000);
        
        // Look for actual product data
        const productRows = await page.locator('tr').count();
        console.log(`   Table rows found: ${productRows}`);
        
        // Check for loading indicators
        const hasSpinner = await page.locator('.spinner, .loading').count() > 0;
        console.log(`   Still loading: ${hasSpinner}`);
        
        // Check for specific product names
        const productText = await page.textContent('body');
        const germanProducts = ['Brot', 'Milch', 'Käse', 'Wurst', 'Apfel'];
        const foundProducts = germanProducts.filter(p => productText.includes(p));
        console.log(`   German products found: ${foundProducts.join(', ')}`);
        
        // Check for errors
        const hasError = await page.locator('.error, .alert-danger').count() > 0;
        if (hasError) {
            const errorText = await page.locator('.error, .alert-danger').first().textContent();
            console.log(`   ❌ Error found: ${errorText}`);
        }
    } else {
        console.log('   ❌ No products button found');
    }
    
    // 3. Test drag and drop specifically
    console.log('\n3️⃣ Testing drag & drop functionality...');
    
    // Try to navigate to meal planning
    const mealPlanButton = await page.locator('button, a').filter({ hasText: /speiseplan|meal|planing/i }).first();
    if (await mealPlanButton.isVisible()) {
        console.log('   Found meal planning button');
        await mealPlanButton.click();
        await page.waitForTimeout(3000);
        
        // Look for calendar structure
        const hasDays = await page.locator('text=/montag|dienstag|mittwoch|monday|tuesday/i').count() > 0;
        console.log(`   Has calendar days: ${hasDays}`);
        
        // Look for recipe elements
        const recipes = await page.locator('[draggable="true"], .recipe-item, .draggable').count();
        console.log(`   Draggable recipes: ${recipes}`);
        
        // Look for drop zones
        const dropZones = await page.locator('.drop-zone, .droppable, [data-day]').count();
        console.log(`   Drop zones: ${dropZones}`);
        
        if (recipes > 0 && dropZones > 0) {
            console.log('   Attempting drag & drop...');
            try {
                const recipe = page.locator('[draggable="true"]').first();
                const dropZone = page.locator('.drop-zone, .droppable, [data-day]').first();
                
                await recipe.dragTo(dropZone);
                await page.waitForTimeout(1000);
                
                // Check if something changed
                const afterDragText = await page.textContent('body');
                console.log('   ✅ Drag completed (check visually if it worked)');
            } catch (error) {
                console.log(`   ❌ Drag failed: ${error.message}`);
            }
        } else {
            console.log('   ❌ Missing recipes or drop zones for drag&drop');
        }
    } else {
        console.log('   ❌ No meal planning button found');
    }
    
    // 4. Check API connectivity
    console.log('\n4️⃣ Testing API connectivity...');
    
    try {
        // Test API directly from browser
        const apiResult = await page.evaluate(async () => {
            try {
                const response = await fetch('/api/products?limit=5');
                if (response.ok) {
                    const data = await response.json();
                    return {
                        success: true,
                        count: data.products ? data.products.length : 0,
                        sample: data.products ? data.products[0]?.name : 'none'
                    };
                } else {
                    return { success: false, error: response.status };
                }
            } catch (error) {
                return { success: false, error: error.message };
            }
        });
        
        console.log(`   API Response: ${JSON.stringify(apiResult)}`);
    } catch (error) {
        console.log(`   ❌ API test failed: ${error.message}`);
    }
    
    // 5. Console errors check
    console.log('\n5️⃣ Checking console errors...');
    
    page.on('console', msg => {
        if (msg.type() === 'error') {
            console.log(`   ❌ Console error: ${msg.text()}`);
        }
    });
    
    // 6. Network requests analysis
    console.log('\n6️⃣ Analyzing network requests...');
    
    const failedRequests = [];
    page.on('response', response => {
        if (!response.ok() && response.url().includes('/api/')) {
            failedRequests.push({
                url: response.url(),
                status: response.status()
            });
        }
    });
    
    // Trigger some actions
    await page.reload();
    await page.waitForTimeout(3000);
    
    if (failedRequests.length > 0) {
        console.log('   Failed API requests:');
        failedRequests.forEach(req => {
            console.log(`   - ${req.url} (${req.status})`);
        });
    } else {
        console.log('   ✅ No failed API requests detected');
    }
    
    console.log('\n📋 ISSUE DIAGNOSIS COMPLETE');
    console.log('============================');
    
    await page.screenshot({ path: 'test-screenshots/detailed-analysis-final.png' });
});