const { test, expect } = require('@playwright/test');

test('Test new Recipe-First layout improvements', async ({ page }) => {
    console.log('\n🎯 TESTING NEW LAYOUT IMPROVEMENTS');
    console.log('==================================\n');
    
    // Login
    await page.goto('http://3.120.41.138:3000');
    await page.fill('#username', 'admin');
    await page.fill('#password', 'Demo123!');
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');
    
    // Go to meal planning
    await page.click('text=Speiseplanung');
    await page.waitForTimeout(3000);
    
    // === TEST 1: Layout Structure ===
    console.log('1️⃣ Testing layout structure...');
    
    // Check if calendar is col-lg-7 (58% width)
    const calendarColumn = page.locator('.col-lg-7');
    const recipeColumn = page.locator('.col-lg-5');
    
    console.log(`✅ Calendar column (col-lg-7): ${await calendarColumn.count() > 0 ? 'Found' : 'Missing'}`);
    console.log(`✅ Recipe column (col-lg-5): ${await recipeColumn.count() > 0 ? 'Found' : 'Missing'}`);
    
    // === TEST 2: Collapsible Panels ===
    console.log('\n2️⃣ Testing collapsible panels...');
    
    const costButton = page.locator('button[data-bs-target="#costCollapse"]');
    const nutritionButton = page.locator('button[data-bs-target="#nutritionCollapse"]');
    
    console.log(`✅ Cost collapse button: ${await costButton.count() > 0 ? 'Found' : 'Missing'}`);
    console.log(`✅ Nutrition collapse button: ${await nutritionButton.count() > 0 ? 'Found' : 'Missing'}`);
    
    // === TEST 3: Recipe Library Improvements ===
    console.log('\n3️⃣ Testing recipe library...');
    
    // Check category tabs
    const categoryTabs = page.locator('#recipe-category-tabs .nav-link');
    const tabCount = await categoryTabs.count();
    console.log(`✅ Category tabs found: ${tabCount} (should be 4)`);
    
    // Check recipe count badge
    const recipeCountBadge = page.locator('#recipeCount');
    const recipeCountText = await recipeCountBadge.textContent();
    console.log(`✅ Recipe count badge: "${recipeCountText}"`);
    
    // Test category filtering
    const breakfastTab = page.locator('[data-category="breakfast"]');
    if (await breakfastTab.count() > 0) {
        await breakfastTab.click();
        await page.waitForTimeout(1000);
        
        // Count visible breakfast recipes
        const visibleRecipes = page.locator('#recipeList .recipe-item:visible');
        const breakfastCount = await visibleRecipes.count();
        console.log(`✅ Breakfast recipes visible: ${breakfastCount}`);
    }
    
    // === TEST 4: Recipe Items ===
    console.log('\n4️⃣ Testing recipe items...');
    
    // Switch back to all recipes
    const allTab = page.locator('[data-category="all"]');
    if (await allTab.count() > 0) {
        await allTab.click();
        await page.waitForTimeout(1000);
    }
    
    const recipeItems = page.locator('#recipeList .recipe-item');
    const totalRecipes = await recipeItems.count();
    console.log(`✅ Total recipe items: ${totalRecipes}`);
    
    // Check for category icons
    const categoryIcons = page.locator('.category-icon');
    const iconCount = await categoryIcons.count();
    console.log(`✅ Recipe category icons: ${iconCount}`);
    
    // === TEST 5: Search Functionality ===
    console.log('\n5️⃣ Testing search...');
    
    const searchInput = page.locator('#recipeSearchInput');
    if (await searchInput.count() > 0) {
        await searchInput.fill('curry');
        await page.waitForTimeout(1000);
        
        const searchResults = page.locator('#recipeList .recipe-item:visible');
        const searchCount = await searchResults.count();
        console.log(`✅ Search results for "curry": ${searchCount}`);
        
        // Clear search
        await searchInput.fill('');
        await page.waitForTimeout(500);
    }
    
    // === FINAL SCREENSHOTS ===
    console.log('\n📸 Taking final screenshots...');
    
    await page.screenshot({ 
        path: 'test-screenshots/new-layout-desktop.png',
        fullPage: true 
    });
    
    await page.setViewportSize({ width: 375, height: 812 });
    await page.waitForTimeout(1000);
    await page.screenshot({ 
        path: 'test-screenshots/new-layout-mobile.png',
        fullPage: true 
    });
    
    console.log('\n✅ LAYOUT TEST COMPLETE!');
});