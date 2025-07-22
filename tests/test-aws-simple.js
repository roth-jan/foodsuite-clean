const { test, expect } = require('@playwright/test');

const AWS_URL = 'http://3.120.41.138:3000';

test('AWS Deployment - Basic functionality test', async ({ page }) => {
    console.log('🌐 Testing AWS deployment at:', AWS_URL);
    
    // Test 1: Page loads
    await page.goto(AWS_URL);
    await page.waitForTimeout(3000);
    
    const title = await page.title();
    console.log('📄 Page title:', title);
    expect(title).toContain('FoodSuite');
    
    // Test 2: Navigation works
    const navTabs = await page.locator('[data-tab]').count();
    console.log('📋 Navigation tabs found:', navTabs);
    expect(navTabs).toBeGreaterThan(3);
    
    // Test 3: Recipes load
    console.log('🍲 Testing recipes...');
    await page.click('[data-tab="recipes"]');
    await page.waitForTimeout(4000);
    
    const recipeCards = await page.locator('.card').count();
    console.log(`📊 Recipe cards loaded: ${recipeCards}`);
    
    if (recipeCards > 0) {
        console.log('✅ Recipes loaded successfully');
    } else {
        console.log('⚠️ No recipe cards found - checking for error messages');
        const errorMsg = page.locator('.text-danger');
        if (await errorMsg.count() > 0) {
            const errorText = await errorMsg.first().textContent();
            console.log('❌ Error found:', errorText);
        }
    }
    
    // Test 4: Meal Planning
    console.log('🤖 Testing meal planning...');
    await page.click('[data-tab="mealplanning"]');
    await page.waitForTimeout(3000);
    
    const calendar = page.locator('#mealCalendar');
    const calendarVisible = await calendar.isVisible();
    console.log('📅 Meal calendar visible:', calendarVisible);
    
    // Test 5: AI buttons
    const aiButtons = await page.locator('.ai-mode-btn').count();
    console.log('🤖 AI mode buttons found:', aiButtons);
    
    // Test 6: API health
    console.log('🏥 Testing API...');
    const response = await page.request.get(`${AWS_URL}/api/health`);
    const isHealthy = response.ok();
    console.log('💚 API healthy:', isHealthy);
    
    // Test 7: Recipes API
    const recipesResponse = await page.request.get(`${AWS_URL}/api/recipes?limit=5`, {
        headers: { 'x-tenant-id': 'demo' }
    });
    const recipesOk = recipesResponse.ok();
    console.log('🍲 Recipes API working:', recipesOk);
    
    if (recipesOk) {
        const recipesData = await recipesResponse.json();
        console.log(`📊 API returned ${recipesData.items ? recipesData.items.length : 0} recipes`);
        console.log('✅ Backend with test data is working!');
    }
    
    // Final summary
    console.log('\n🎯 AWS Deployment Test Summary:');
    console.log(`- Page loads: ✅`);
    console.log(`- Navigation: ${navTabs > 3 ? '✅' : '❌'}`);
    console.log(`- Recipes UI: ${recipeCards > 0 ? '✅' : '⚠️'}`);
    console.log(`- Calendar: ${calendarVisible ? '✅' : '❌'}`);
    console.log(`- AI Buttons: ${aiButtons > 0 ? '✅' : '❌'}`);
    console.log(`- API Health: ${isHealthy ? '✅' : '❌'}`);
    console.log(`- Test Data: ${recipesOk ? '✅' : '❌'}`);
    
    expect(isHealthy).toBeTruthy();
    expect(recipesOk).toBeTruthy();
});