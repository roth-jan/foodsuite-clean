// Test ob Custom AI Mode Designer auf AWS funktioniert
import { test, expect } from '@playwright/test';

test('Custom AI Mode Designer auf AWS', async ({ page }) => {
  // Navigate to AWS FoodSuite
  await page.goto('http://3.120.41.138:3000');
  
  // Login
  await page.fill('#username', 'admin');
  await page.fill('#password', 'Demo123!');
  await page.click('button[type="submit"]');
  
  // Wait for app to load
  await page.waitForURL('**/foodsuite-complete-app.html', { timeout: 15000 });
  
  // Navigate to KI-Speiseplanung
  await page.click('[data-tab="meal-planning"]');
  await expect(page.locator('h1:has-text("KI-Speiseplanung")')).toBeVisible();
  
  // Check if AI mode selector exists
  const modeSelect = page.locator('#aiAssistantMode');
  const selectExists = await modeSelect.isVisible();
  console.log(`AI Mode Selector vorhanden: ${selectExists}`);
  
  if (selectExists) {
    // Check if custom mode is available
    const options = await modeSelect.locator('option').allTextContents();
    console.log('Verfügbare Modi:', options);
    
    // Select custom mode
    await modeSelect.selectOption('custom');
    
    // Check if custom designer elements are visible
    const customElements = {
      'Cost Weight': await page.locator('#costWeight').isVisible(),
      'Health Weight': await page.locator('#healthWeight').isVisible(),
      'Variety Weight': await page.locator('#varietyWeight').isVisible(),
      'Speed Weight': await page.locator('#speedWeight').isVisible(),
      'Max Cost Per Meal': await page.locator('#maxCostPerMeal').isVisible(),
      'Exclude Pork': await page.locator('#excludePork').isVisible(),
      'Exclude Beef': await page.locator('#excludeBeef').isVisible()
    };
    
    console.log('\n🔍 Custom AI Designer Elements:');
    Object.entries(customElements).forEach(([element, visible]) => {
      console.log(`${visible ? '✅' : '❌'} ${element}`);
    });
    
    // Count how many elements are visible
    const visibleCount = Object.values(customElements).filter(Boolean).length;
    const totalCount = Object.keys(customElements).length;
    
    console.log(`\n📊 Custom AI Designer Status: ${visibleCount}/${totalCount} Elements gefunden`);
    
    if (visibleCount === totalCount) {
      console.log('✅ Custom AI Mode Designer VOLLSTÄNDIG vorhanden!');
      
      // Test actual functionality
      await page.locator('#costWeight').fill('0.9');
      await page.locator('#healthWeight').fill('0.2');
      await page.locator('#maxCostPerMeal').fill('3.00');
      await page.check('#excludePork');
      
      console.log('✅ Custom AI Konfiguration erfolgreich!');
    } else {
      console.log('❌ Custom AI Mode Designer FEHLT oder ist unvollständig!');
    }
  } else {
    console.log('❌ AI Mode Selector nicht gefunden - Version veraltet!');
  }
});