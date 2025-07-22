const { test, expect } = require('@playwright/test');

test.describe('Foodsuite Button Functionality Test', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('file:///C:/Users/JanHendrikRoth/Desktop/Claude%20Ergebnisse/Claude%20Ergebnisse/Foodsuite/foodsuite-complete-app.html');
  });

  test('should identify placeholder buttons that only show toast notifications', async ({ page }) => {
    const placeholderButtons = [
      { selector: 'button[onclick*="showToast"]', description: 'Toast notification buttons' }
    ];

    const functionalButtons = [
      { selector: 'button[onclick*="applyAIRecommendation"]', description: 'AI Recommendation' },
      { selector: 'button[onclick*="generateAIWeekMenu"]', description: 'Generate AI Week Menu' },
      { selector: 'button[onclick*="optimizeCurrentPlan"]', description: 'Optimize Current Plan' },
      { selector: 'button[onclick*="exportMealPlan"]', description: 'Export Meal Plan' },
      { selector: 'button[onclick*="previousWeek"]', description: 'Previous Week' },
      { selector: 'button[onclick*="nextWeek"]', description: 'Next Week' },
      { selector: 'button[onclick*="showModal"]', description: 'Show Modal' },
      { selector: 'button[onclick*="exportProducts"]', description: 'Export Products' },
      { selector: 'button[onclick*="clearProductFilters"]', description: 'Clear Product Filters' },
      { selector: 'button[onclick*="startInventoryCheck"]', description: 'Start Inventory Check' },
      { selector: 'button[onclick*="runPriceComparison"]', description: 'Run Price Comparison' },
      { selector: 'button[onclick*="exportAnalytics"]', description: 'Export Analytics' }
    ];

    console.log('\\n=== PLACEHOLDER BUTTONS (Only show toast notifications) ===');
    
    // Count placeholder buttons (those that call showToast)
    const placeholderCount = await page.locator('button[onclick*="showToast"]').count();
    console.log(`✗ PLACEHOLDER: Toast notification buttons (${placeholderCount} instances)`);
    
    // Get all placeholder button texts
    const placeholderTexts = await page.locator('button[onclick*="showToast"]').allTextContents();
    placeholderTexts.forEach((text, index) => {
      console.log(`  ${index + 1}. ${text.trim()}`);
    });

    console.log('\\n=== FUNCTIONAL BUTTONS (Have actual functionality) ===');
    
    let functionalCount = 0;
    for (const button of functionalButtons) {
      const count = await page.locator(button.selector).count();
      if (count > 0) {
        console.log(`✓ FUNCTIONAL: ${button.description} (${count} instances)`);
        functionalCount += count;
      }
    }

    console.log(`\\n=== SUMMARY ===`);
    console.log(`Placeholder buttons: ${placeholderCount}`);
    console.log(`Functional buttons: ${functionalCount}`);
    console.log(`Total buttons tested: ${placeholderCount + functionalCount}`);
    
    // Assert that we successfully replaced all placeholder buttons
    expect(placeholderCount).toEqual(0);
    expect(functionalCount).toBeGreaterThan(0);
  });

  test('should test AI mode toggle buttons', async ({ page }) => {
    console.log('\\n=== AI MODE TOGGLE BUTTONS ===');
    
    // Count AI toggle buttons
    const aiButtonCount = await page.locator('.ai-button[onclick*="toggleAIMode"]').count();
    console.log(`✓ AI Mode toggle buttons found: ${aiButtonCount}`);
    
    // Get all AI button texts
    const aiTexts = await page.locator('.ai-button[onclick*="toggleAIMode"]').allTextContents();
    aiTexts.forEach((text, index) => {
      console.log(`  ${index + 1}. ${text.trim()}`);
    });
    
    // Test that AI buttons exist
    expect(aiButtonCount).toBeGreaterThan(0);
  });
});