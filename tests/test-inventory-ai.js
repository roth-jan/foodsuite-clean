const { test, expect } = require('@playwright/test');

test.describe('Inventory-Based AI Meal Planning Test', () => {
  test('should test inventory-based AI meal suggestions', async ({ page }) => {
    console.log('🏪 TESTING INVENTORY-BASED AI FUNCTIONALITY');
    console.log('═══════════════════════════════════════════════════════════════');
    
    // Monitor console messages
    page.on('console', msg => {
      if (msg.text().includes('inventory') || msg.text().includes('🏪')) {
        console.log(`📝 Console ${msg.type()}: ${msg.text()}`);
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
    await page.waitForTimeout(2000);
    
    // Test AI mode switching
    console.log('\n🎛️ Testing AI mode switching...');
    
    // Check if inventory button exists
    const inventoryButton = page.locator('.ai-button[data-param="inventory"]');
    const inventoryButtonExists = await inventoryButton.count();
    console.log(`✓ Inventory AI button found: ${inventoryButtonExists > 0 ? 'YES' : 'NO'}`);
    
    if (inventoryButtonExists > 0) {
      // Click inventory mode
      console.log('🏪 Switching to inventory mode...');
      await inventoryButton.click();
      
      // Wait for mode to activate
      await page.waitForTimeout(1000);
      
      // Check if button is active
      const isActive = await inventoryButton.evaluate(el => el.classList.contains('active'));
      console.log(`✓ Inventory mode activated: ${isActive ? 'YES' : 'NO'}`);
      
      // Check status text
      const statusText = await page.locator('#aiStatus').textContent();
      console.log(`✓ Status text: ${statusText}`);
      
      // Generate AI meal plan with inventory mode
      console.log('\n🤖 Generating AI meal plan with inventory optimization...');
      const aiButton = page.locator('button[data-action="generateAIWeekMenu"]');
      await aiButton.click();
      
      // Wait for AI generation
      await page.waitForTimeout(3000);
      
      // Check if meals were added
      const mealsAdded = await page.locator('.calendar-cell.has-meal').count();
      console.log(`✓ Meals added by inventory AI: ${mealsAdded}`);
      
      // Check cost summary
      const totalCost = await page.locator('#totalWeeklyCost').textContent();
      console.log(`✓ Total weekly cost with inventory optimization: ${totalCost}`);
      
      // Test other AI modes for comparison
      console.log('\n🔄 Testing other AI modes for comparison...');
      
      // Test cost mode
      const costButton = page.locator('.ai-button[data-param="cost"]');
      await costButton.click();
      await page.waitForTimeout(500);
      await aiButton.click();
      await page.waitForTimeout(2000);
      
      const costModeMeals = await page.locator('.calendar-cell.has-meal').count();
      const costModeTotal = await page.locator('#totalWeeklyCost').textContent();
      console.log(`✓ Cost mode: ${costModeMeals} meals, ${costModeTotal}`);
      
      // Test seasonal mode
      const seasonalButton = page.locator('.ai-button[data-param="seasonal"]');
      await seasonalButton.click();
      await page.waitForTimeout(500);
      await aiButton.click();
      await page.waitForTimeout(2000);
      
      const seasonalModeMeals = await page.locator('.calendar-cell.has-meal').count();
      const seasonalModeTotal = await page.locator('#totalWeeklyCost').textContent();
      console.log(`✓ Seasonal mode: ${seasonalModeMeals} meals, ${seasonalModeTotal}`);
      
      // Switch back to inventory mode
      console.log('\n🔄 Switching back to inventory mode...');
      await inventoryButton.click();
      await page.waitForTimeout(500);
      
      const finalStatus = await page.locator('#aiStatus').textContent();
      console.log(`✓ Final status: ${finalStatus}`);
    }
    
    // Take screenshot
    await page.screenshot({ path: 'inventory-ai-test.png', fullPage: true });
    console.log('\n📸 Screenshot saved as inventory-ai-test.png');
    
    console.log('\n✅ Inventory-based AI test completed');
  });
});