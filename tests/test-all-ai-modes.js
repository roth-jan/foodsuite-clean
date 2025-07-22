const { test, expect } = require('@playwright/test');

test.describe('Complete AI Meal Planning System Test', () => {
  test('should test all AI modes and compare results', async ({ page }) => {
    console.log('🤖 TESTING COMPLETE AI MEAL PLANNING SYSTEM');
    console.log('═══════════════════════════════════════════════════════════════');
    
    // Go to the page
    console.log('\n🌐 Navigating to http://localhost:4000/');
    await page.goto('http://localhost:4000/');
    
    // Wait for page to load
    await page.waitForTimeout(2000);
    
    // Click on KI-Speiseplanung tab
    console.log('\n📍 Accessing KI-Speiseplanung...');
    const mealPlanningTab = page.locator('a[data-tab="meal-planning"]');
    await mealPlanningTab.click();
    await page.waitForTimeout(2000);
    
    // Test all AI modes
    const aiModes = [
      { name: 'Kosten-Optimierung', param: 'cost', icon: 'currency-euro' },
      { name: 'Nährwert-Balance', param: 'nutrition', icon: 'heart-pulse' },
      { name: 'Abwechslung', param: 'variety', icon: 'palette' },
      { name: 'Saisonal', param: 'seasonal', icon: 'leaf' },
      { name: 'Lagerbestand', param: 'inventory', icon: 'box-seam' }
    ];
    
    const results = [];
    
    for (const mode of aiModes) {
      console.log(`\n🎯 Testing AI Mode: ${mode.name} (${mode.param})`);
      
      // Click the AI mode button
      const modeButton = page.locator(`.ai-button[data-param="${mode.param}"]`);
      const buttonExists = await modeButton.count();
      
      if (buttonExists > 0) {
        await modeButton.click();
        await page.waitForTimeout(500);
        
        // Check if mode is active
        const isActive = await modeButton.evaluate(el => el.classList.contains('active'));
        console.log(`  ✓ Mode activated: ${isActive ? 'YES' : 'NO'}`);
        
        // Check status text
        const statusText = await page.locator('#aiStatus').textContent();
        console.log(`  ✓ Status: ${statusText.trim()}`);
        
        // Generate AI meal plan
        const aiButton = page.locator('button[data-action="generateAIWeekMenu"]');
        await aiButton.click();
        await page.waitForTimeout(3000);
        
        // Collect results
        const mealsAdded = await page.locator('.calendar-cell.has-meal').count();
        const totalCost = await page.locator('#totalWeeklyCost').textContent();
        const proteinPercent = await page.locator('#proteinPercent').textContent();
        const carbsPercent = await page.locator('#carbsPercent').textContent();
        const fatPercent = await page.locator('#fatPercent').textContent();
        const nutritionStatus = await page.locator('#nutritionStatus').textContent();
        
        const result = {
          mode: mode.name,
          param: mode.param,
          mealsAdded,
          totalCost,
          nutrition: {
            protein: proteinPercent,
            carbs: carbsPercent,
            fat: fatPercent,
            status: nutritionStatus
          }
        };
        
        results.push(result);
        
        console.log(`  ✓ Meals generated: ${mealsAdded}`);
        console.log(`  ✓ Total cost: ${totalCost}`);
        console.log(`  ✓ Nutrition: ${proteinPercent} Protein, ${carbsPercent} Carbs, ${fatPercent} Fat`);
        console.log(`  ✓ Nutrition status: ${nutritionStatus}`);
        
        // Clear meal plan for next test
        await page.evaluate(() => {
          AppData.mealPlan = {};
        });
      } else {
        console.log(`  ❌ Mode button not found: ${mode.name}`);
      }
    }
    
    // Summary comparison
    console.log('\n📊 AI MODE COMPARISON SUMMARY');
    console.log('═══════════════════════════════════════════════════════════════');
    
    results.forEach((result, index) => {
      console.log(`\n${index + 1}. ${result.mode} (${result.param})`);
      console.log(`   Meals: ${result.mealsAdded} | Cost: ${result.totalCost}`);
      console.log(`   Nutrition: ${result.nutrition.protein} P, ${result.nutrition.carbs} C, ${result.nutrition.fat} F`);
      console.log(`   Status: ${result.nutrition.status}`);
    });
    
    // Find best performer in each category
    const mostMeals = results.reduce((prev, curr) => 
      curr.mealsAdded > prev.mealsAdded ? curr : prev
    );
    
    const lowestCost = results.reduce((prev, curr) => {
      const prevCost = parseFloat(prev.totalCost.replace(/[€,]/g, ''));
      const currCost = parseFloat(curr.totalCost.replace(/[€,]/g, ''));
      return currCost < prevCost ? curr : prev;
    });
    
    console.log('\n🏆 PERFORMANCE WINNERS:');
    console.log(`  Most meals generated: ${mostMeals.mode} (${mostMeals.mealsAdded} meals)`);
    console.log(`  Lowest cost: ${lowestCost.mode} (${lowestCost.totalCost})`);
    
    // Test drag & drop with inventory mode
    console.log('\n🖱️ Testing drag & drop with inventory mode...');
    const inventoryButton = page.locator('.ai-button[data-param="inventory"]');
    await inventoryButton.click();
    await page.waitForTimeout(500);
    
    const recipeItems = await page.locator('.recipe-item').count();
    if (recipeItems > 0) {
      const firstRecipe = page.locator('.recipe-item').first();
      const mondayLunchCell = page.locator('.calendar-cell[data-slot="monday-lunch"]');
      
      await firstRecipe.hover();
      await page.mouse.down();
      await mondayLunchCell.hover();
      await page.mouse.up();
      
      await page.waitForTimeout(1000);
      
      const dragSuccess = await mondayLunchCell.locator('.meal-event').count();
      console.log(`  ✓ Drag & drop successful: ${dragSuccess > 0 ? 'YES' : 'NO'}`);
    }
    
    // Take final screenshot
    await page.screenshot({ path: 'all-ai-modes-test.png', fullPage: true });
    console.log('\n📸 Screenshot saved as all-ai-modes-test.png');
    
    console.log('\n✅ Complete AI meal planning system test completed');
    console.log(`✅ Total AI modes tested: ${results.length}/5`);
    console.log(`✅ All systems functional: ${results.length === 5 ? 'YES' : 'NO'}`);
  });
});