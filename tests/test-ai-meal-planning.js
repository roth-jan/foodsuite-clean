const { test, expect } = require('@playwright/test');

test.describe('AI Meal Planning Tests', () => {
  let page;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
  });

  test.afterAll(async () => {
    await page.close();
  });

  test.beforeEach(async () => {
    // Navigate to meal planning tab
    await page.click('a[data-tab="meal-planning"]');
    await page.waitForSelector('#meal-planning', { state: 'visible' });
  });

  test.describe('AI Mode: Cost Optimization', () => {
    test('should generate cost-optimized meal plan', async () => {
      // Select cost optimization mode
      await page.selectOption('#mealPlanMode', 'cost_optimization');
      
      // Click generate button
      await page.click('button[data-action="generateAIWeekMenu"]');
      
      // Wait for plan generation
      await page.waitForSelector('.meal-event', { timeout: 10000 });
      
      // Verify recipes were added to the meal plan
      const meals = await page.$$('.calendar-cell .meal-event');
      expect(meals.length).toBeGreaterThan(0);
      
      // Check if total cost is displayed
      const costElement = await page.waitForSelector('#totalCost');
      const costText = await costElement.textContent();
      expect(costText).toMatch(/\d+,\d{2} €/);
    });

    test('should prioritize low-cost recipes', async () => {
      await page.selectOption('#mealPlanMode', 'cost_optimization');
      await page.click('button[data-action="generateAIWeekMenu"]');
      await page.waitForSelector('.meal-event', { timeout: 10000 });
      
      // Get all recipe costs
      const recipeCosts = await page.$$eval('.meal-event', items => 
        items.map(item => {
          const costText = item.querySelector('.meal-details')?.textContent || '';
          const match = costText.match(/€\s*([\d,]+)/);
          return match ? parseFloat(match[1].replace(',', '.')) : 0;
        })
      );
      
      // Verify average cost is reasonable for cost optimization
      const avgCost = recipeCosts.reduce((a, b) => a + b, 0) / recipeCosts.length;
      expect(avgCost).toBeLessThan(8); // Expect low average cost
    });
  });

  test.describe('AI Mode: Nutrition Balance', () => {
    test('should generate nutritionally balanced meal plan', async () => {
      await page.selectOption('#mealPlanMode', 'nutrition_balance');
      await page.click('button[data-action="generateAIWeekMenu"]');
      await page.waitForSelector('.meal-event', { timeout: 10000 });
      
      // Check if nutritional values are displayed
      const nutritionPanel = await page.waitForSelector('#nutritionBalance');
      expect(nutritionPanel).toBeTruthy();
      
      // Verify balanced nutrition indicators
      const calories = await page.$eval('#totalCalories', el => el.textContent);
      expect(calories).toMatch(/\d+\s*kcal/);
      
      const protein = await page.$eval('#totalProtein', el => el.textContent);
      expect(protein).toMatch(/\d+\s*g/);
    });

    test('should include variety of food groups', async () => {
      await page.selectOption('#mealPlanMode', 'nutrition_balance');
      await page.click('button[data-action="generateAIWeekMenu"]');
      await page.waitForSelector('.meal-event', { timeout: 10000 });
      
      // Get all recipe categories
      const categories = await page.$$eval('.meal-event', items => 
        [...new Set(items.map(item => item.dataset.category))]
      );
      
      // Expect variety in categories
      expect(categories.length).toBeGreaterThan(2);
    });
  });

  test.describe('AI Mode: Variety', () => {
    test('should generate meal plan with diverse recipes', async () => {
      await page.selectOption('#mealPlanMode', 'variety');
      await page.click('button[data-action="generateAIWeekMenu"]');
      await page.waitForSelector('.meal-event', { timeout: 10000 });
      
      // Get all recipe names
      const recipeNames = await page.$$eval('.meal-event .meal-title', 
        elements => elements.map(el => el.textContent)
      );
      
      // Check for uniqueness
      const uniqueRecipes = new Set(recipeNames);
      expect(uniqueRecipes.size).toBe(recipeNames.length);
      
      // Verify variety across days
      const mondayRecipes = await page.$$('.calendar-cell[data-day="1"] .meal-event');
      const tuesdayRecipes = await page.$$('.calendar-cell[data-day="2"] .meal-event');
      expect(mondayRecipes.length).toBeGreaterThan(0);
      expect(tuesdayRecipes.length).toBeGreaterThan(0);
    });
  });

  test.describe('AI Mode: Seasonal', () => {
    test('should generate seasonal meal plan', async () => {
      await page.selectOption('#mealPlanMode', 'seasonal');
      await page.click('button[data-action="generateAIWeekMenu"]');
      await page.waitForSelector('.meal-event', { timeout: 10000 });
      
      // Get current month for seasonal check
      const currentMonth = new Date().getMonth();
      const isWinter = currentMonth >= 11 || currentMonth <= 2;
      const isSummer = currentMonth >= 5 && currentMonth <= 8;
      
      // Get recipe names
      const recipeNames = await page.$$eval('.meal-event .meal-title', 
        elements => elements.map(el => el.textContent.toLowerCase())
      );
      
      // Check for seasonal keywords
      if (isWinter) {
        const winterDishes = recipeNames.filter(name => 
          name.includes('suppe') || name.includes('eintopf') || name.includes('braten')
        );
        expect(winterDishes.length).toBeGreaterThan(0);
      } else if (isSummer) {
        const summerDishes = recipeNames.filter(name => 
          name.includes('salat') || name.includes('grill') || name.includes('kalt')
        );
        expect(summerDishes.length).toBeGreaterThan(0);
      }
    });
  });

  test.describe('AI Mode: Inventory Based', () => {
    test('should generate meal plan based on inventory', async () => {
      await page.selectOption('#mealPlanMode', 'inventory_based');
      await page.click('button[data-action="generateAIWeekMenu"]');
      await page.waitForSelector('.meal-event', { timeout: 10000 });
      
      // Verify recipes were generated
      const recipes = await page.$$('.calendar-cell .meal-event');
      expect(recipes.length).toBeGreaterThan(0);
      
      // Check that inventory optimization message appears
      const messages = await page.$$('.alert-info');
      const inventoryMessage = messages.find(async msg => {
        const text = await msg.textContent();
        return text.includes('Lagerbestand') || text.includes('Inventar');
      });
      expect(inventoryMessage).toBeTruthy();
    });
  });

  test.describe('Drag and Drop Functionality', () => {
    test('should allow dragging recipes to calendar', async () => {
      // First generate a meal plan
      await page.selectOption('#mealPlanMode', 'variety');
      await page.click('button[data-action="generateAIWeekMenu"]');
      await page.waitForSelector('.meal-event', { timeout: 10000 });
      
      // Get a recipe from the library
      const sourceRecipe = await page.$('.recipe-library .recipe-item');
      const targetCell = await page.$('.calendar-cell[data-day="3"][data-meal="lunch"]');
      
      if (sourceRecipe && targetCell) {
        // Perform drag and drop
        await sourceRecipe.dragTo(targetCell);
        
        // Verify recipe was added to the cell
        const addedRecipe = await targetCell.$('.meal-event');
        expect(addedRecipe).toBeTruthy();
      }
    });

    test('should allow reordering recipes between days', async () => {
      // Generate meal plan first
      await page.selectOption('#mealPlanMode', 'variety');
      await page.click('button[data-action="generateAIWeekMenu"]');
      await page.waitForSelector('.meal-event', { timeout: 10000 });
      
      // Find source and target cells
      const sourceCell = await page.$('.calendar-cell[data-day="1"][data-meal="lunch"] .meal-event');
      const targetCell = await page.$('.calendar-cell[data-day="2"][data-meal="lunch"]');
      
      if (sourceCell && targetCell) {
        const recipeName = await sourceCell.$eval('.meal-title', el => el.textContent);
        
        // Drag from Monday to Tuesday
        await sourceCell.dragTo(targetCell);
        
        // Verify recipe moved
        const movedRecipe = await targetCell.$eval('.meal-event .meal-title', el => el.textContent);
        expect(movedRecipe).toBe(recipeName);
      }
    });
  });

  test.describe('Shopping List Generation', () => {
    test('should generate shopping list from meal plan', async () => {
      // Generate a meal plan
      await page.selectOption('#mealPlanMode', 'cost_optimization');
      await page.click('button[data-action="generateAIWeekMenu"]');
      await page.waitForSelector('.meal-event', { timeout: 10000 });
      
      // Click shopping list button
      await page.click('button:has-text("Einkaufsliste erstellen")');
      
      // Wait for shopping list modal
      await page.waitForSelector('#shoppingListModal', { state: 'visible' });
      
      // Verify shopping list contains items
      const listItems = await page.$$('#shoppingListItems li');
      expect(listItems.length).toBeGreaterThan(0);
      
      // Check item format
      const firstItem = await listItems[0].textContent();
      expect(firstItem).toMatch(/\d+(\.\d+)?\s*(kg|g|L|ml|Stück)/);
    });

    test('should group items by category', async () => {
      await page.selectOption('#mealPlanMode', 'variety');
      await page.click('button[data-action="generateAIWeekMenu"]');
      await page.waitForSelector('.meal-event', { timeout: 10000 });
      
      await page.click('button:has-text("Einkaufsliste erstellen")');
      await page.waitForSelector('#shoppingListModal', { state: 'visible' });
      
      // Check for category headers
      const categories = await page.$$('.shopping-list-category');
      expect(categories.length).toBeGreaterThan(0);
      
      // Verify categories have items
      for (const category of categories) {
        const items = await category.$$('li');
        expect(items.length).toBeGreaterThan(0);
      }
    });
  });

  test.describe('Error Handling', () => {
    test('should handle empty meal plan gracefully', async () => {
      // Try to generate shopping list without meal plan
      const shoppingListBtn = await page.$('button:has-text("Einkaufsliste erstellen")');
      if (shoppingListBtn) {
        await shoppingListBtn.click();
        
        // Should show error or empty message
        const errorMsg = await page.waitForSelector('.alert-warning, .alert-danger', { timeout: 5000 }).catch(() => null);
        if (errorMsg) {
          const text = await errorMsg.textContent();
          expect(text).toMatch(/keine|leer|empty/i);
        }
      }
    });

    test('should validate meal plan before saving', async () => {
      // Try to save empty meal plan
      const saveBtn = await page.$('button:has-text("Speichern")');
      if (saveBtn) {
        await saveBtn.click();
        
        // Should show validation message
        const validationMsg = await page.waitForSelector('.alert-warning', { timeout: 5000 }).catch(() => null);
        expect(validationMsg).toBeTruthy();
      }
    });
  });

  test.describe('Performance', () => {
    test('should generate meal plan within reasonable time', async () => {
      const startTime = Date.now();
      
      await page.selectOption('#mealPlanMode', 'variety');
      await page.click('button[data-action="generateAIWeekMenu"]');
      await page.waitForSelector('.meal-event', { timeout: 10000 });
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Should complete within 5 seconds
      expect(duration).toBeLessThan(5000);
    });
  });
});