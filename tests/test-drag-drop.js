const { test, expect } = require('@playwright/test');

test.describe('Drag & Drop Meal Planning Test', () => {
  test('should test drag & drop functionality for meal planning', async ({ page }) => {
    console.log('🔍 TESTING DRAG & DROP FUNCTIONALITY');
    console.log('═══════════════════════════════════════════════════════════════');
    
    // Monitor console messages
    page.on('console', msg => {
      console.log(`📝 Console ${msg.type()}: ${msg.text()}`);
    });
    
    // Monitor network errors
    page.on('response', response => {
      if (response.status() >= 400) {
        console.log(`❌ Network Error: ${response.status()} ${response.url()}`);
      }
    });
    
    // Go to the page
    console.log('\n🌐 Navigating to http://localhost:4000/');
    await page.goto('http://localhost:4000/');
    
    // Wait for page to load
    await page.waitForTimeout(2000);
    
    // Click on KI-Speiseplanung tab
    console.log('\n📍 Clicking on KI-Speiseplanung tab...');
    const mealPlanningTab = page.locator('a[data-tab="meal-planning"]');
    await mealPlanningTab.click();
    
    // Wait for meal planning to load
    await page.waitForTimeout(3000);
    
    // Check if recipe library loaded
    console.log('\n📚 Checking recipe library...');
    const recipeList = await page.locator('#recipeList').count();
    console.log(`✓ Recipe list found: ${recipeList > 0 ? 'YES' : 'NO'}`);
    
    // Check for recipe items
    const recipeItems = await page.locator('.recipe-item').count();
    console.log(`✓ Recipe items found: ${recipeItems}`);
    
    if (recipeItems > 0) {
      // Get first recipe info
      const firstRecipeName = await page.locator('.recipe-item .recipe-name').first().textContent();
      console.log(`✓ First recipe: ${firstRecipeName}`);
    }
    
    // Check meal calendar
    console.log('\n📅 Checking meal calendar...');
    const calendarCells = await page.locator('.calendar-cell').count();
    console.log(`✓ Calendar cells found: ${calendarCells}`);
    
    // Try drag & drop if we have recipes
    if (recipeItems > 0) {
      console.log('\n🎯 Testing drag & drop...');
      
      const firstRecipe = page.locator('.recipe-item').first();
      const mondayLunchCell = page.locator('.calendar-cell[data-slot="monday-lunch"]');
      
      // Get recipe name before drag
      const recipeName = await firstRecipe.locator('.recipe-name').textContent();
      console.log(`📍 Dragging recipe: ${recipeName}`);
      
      // Perform drag & drop
      await firstRecipe.hover();
      await page.mouse.down();
      await mondayLunchCell.hover();
      await page.mouse.up();
      
      // Wait for drop animation
      await page.waitForTimeout(1000);
      
      // Check if meal was added
      const mondayLunchContent = await mondayLunchCell.textContent();
      console.log(`✓ Monday lunch content after drop: ${mondayLunchContent.substring(0, 50)}...`);
      
      // Check if meal event was created
      const mealEvent = await mondayLunchCell.locator('.meal-event').count();
      console.log(`✓ Meal event created: ${mealEvent > 0 ? 'YES' : 'NO'}`);
    }
    
    // Test AI meal generation
    console.log('\n🤖 Testing AI meal generation...');
    const aiButton = page.locator('button[data-action="generateAIWeekMenu"]');
    const aiButtonExists = await aiButton.count();
    
    if (aiButtonExists > 0) {
      console.log('✓ AI button found, clicking...');
      await aiButton.click();
      
      // Wait for AI generation
      await page.waitForTimeout(3000);
      
      // Check if meals were added
      const mealsAdded = await page.locator('.calendar-cell.has-meal').count();
      console.log(`✓ Meals added by AI: ${mealsAdded}`);
    }
    
    // Check cost summary
    console.log('\n💰 Checking cost summary...');
    const totalCost = await page.locator('#totalWeeklyCost').textContent();
    console.log(`✓ Total weekly cost: ${totalCost}`);
    
    // Take screenshot
    await page.screenshot({ path: 'drag-drop-test.png', fullPage: true });
    console.log('\n📸 Screenshot saved as drag-drop-test.png');
    
    console.log('\n✅ Drag & drop test completed');
  });
});