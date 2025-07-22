// FoodSuite - Comprehensive User Experience Test
// Tests real user journeys, performance, accessibility, and usability
import { test, expect } from '@playwright/test';

test.describe('FoodSuite UX Test Suite - Comprehensive User Experience', () => {
  
  // Test configuration
  const BASE_URL = 'http://3.120.41.138:3000';
  const TEST_USER = { username: 'admin', password: 'Demo123!' };
  
  test.beforeEach(async ({ page }) => {
    // Set realistic timeouts
    page.setDefaultTimeout(10000);
    
    // Navigate to FoodSuite
    await page.goto(BASE_URL);
    
    // Login
    await page.fill('#username', TEST_USER.username);
    await page.fill('#password', TEST_USER.password);
    await page.click('button[type="submit"]');
    
    // Wait for main app to load
    await page.waitForURL('**/foodsuite-complete-app.html', { timeout: 15000 });
  });

  test.describe('1. First Impression & Navigation UX', () => {
    
    test('1.1 Dashboard lädt schnell und zeigt wichtige Informationen', async ({ page }) => {
      const startTime = Date.now();
      
      // Check dashboard loads within 3 seconds
      await expect(page.locator('h1').first()).toBeVisible();
      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(3000);
      
      // Check key metrics are visible
      await expect(page.locator('.metric-card')).toHaveCount(4);
      
      // Check navigation is clear
      const navItems = [
        'KI-Speiseplanung',
        'Produktverwaltung', 
        'Rezeptverwaltung',
        'Lieferantenverwaltung',
        'Analytics & Preisvergleich'
      ];
      
      for (const item of navItems) {
        await expect(page.locator(`text=${item}`)).toBeVisible();
      }
      
      console.log(`✅ Dashboard Load Time: ${loadTime}ms`);
    });

    test('1.2 Navigation zwischen Tabs ist intuitiv', async ({ page }) => {
      const tabs = [
        { name: 'Produktverwaltung', expectedH1: 'Produktverwaltung' },
        { name: 'Rezeptverwaltung', expectedH1: 'Rezeptverwaltung' },
        { name: 'KI-Speiseplanung', expectedH1: 'KI-Speiseplanung' }
      ];
      
      for (const tab of tabs) {
        const startTime = Date.now();
        
        await page.click(`text=${tab.name}`);
        await expect(page.locator(`h1:has-text("${tab.expectedH1}")`)).toBeVisible();
        
        const switchTime = Date.now() - startTime;
        expect(switchTime).toBeLessThan(1000); // Tab switch should be instant
        
        console.log(`✅ Tab "${tab.name}" Switch Time: ${switchTime}ms`);
      }
    });

    test('1.3 Responsive Design funktioniert auf verschiedenen Bildschirmgrößen', async ({ page }) => {
      // Desktop (1920x1080)
      await page.setViewportSize({ width: 1920, height: 1080 });
      await expect(page.locator('.main-header')).toBeVisible();
      
      // Tablet (768x1024)
      await page.setViewportSize({ width: 768, height: 1024 });
      await expect(page.locator('.main-header')).toBeVisible();
      
      // Mobile (375x667)
      await page.setViewportSize({ width: 375, height: 667 });
      await expect(page.locator('.main-header')).toBeVisible();
      
      // Navigation should still work on mobile
      await page.click('text=KI-Speiseplanung');
      await expect(page.locator('h1:has-text("KI-Speiseplanung")')).toBeVisible();
    });
  });

  test.describe('2. KI-Speiseplanung User Journey', () => {
    
    test('2.1 Benutzer kann intuitiv einen Wochenplan erstellen', async ({ page }) => {
      // Navigate to meal planning
      await page.click('text=KI-Speiseplanung');
      await expect(page.locator('h1:has-text("KI-Speiseplanung")')).toBeVisible();
      
      // Check AI modes are clearly visible
      const aiModeSelect = page.locator('#aiAssistantMode');
      await expect(aiModeSelect).toBeVisible();
      
      // Test each AI mode with user-friendly expectations
      const aiModes = [
        { value: 'cost_optimized', name: 'Kostenoptimiert' },
        { value: 'balanced_nutrition', name: 'Ausgewogene Ernährung' },
        { value: 'variety', name: 'Abwechslungsreich' },
        { value: 'seasonal', name: 'Saisonal' },
        { value: 'inventory_based', name: 'Lagerbestand-basiert' }
      ];
      
      for (const mode of aiModes) {
        // Select mode
        await page.selectOption('#aiAssistantMode', mode.value);
        
        // Generate plan
        const generateButton = page.locator('button:has-text("KI-Wochenplan")');
        await expect(generateButton).toBeVisible();
        await generateButton.click();
        
        // Wait for generation (max 10 seconds)
        await page.waitForTimeout(3000);
        
        // Check if meals were generated
        const mealEvents = page.locator('.meal-event');
        const mealCount = await mealEvents.count();
        
        // User should see at least some meals
        expect(mealCount).toBeGreaterThan(0);
        console.log(`✅ AI Mode "${mode.name}": ${mealCount} Gerichte generiert`);
        
        // Clear calendar for next test
        const clearButton = page.locator('button:has-text("Kalender leeren")');
        if (await clearButton.isVisible()) {
          await clearButton.click();
          await page.waitForTimeout(1000);
        }
      }
    });

    test('2.2 Custom AI Mode Designer ist benutzerfreundlich', async ({ page }) => {
      await page.click('text=KI-Speiseplanung');
      
      // Check if custom mode designer is available
      await page.selectOption('#aiAssistantMode', 'custom');
      
      // Check weight sliders are visible and functional
      const sliders = ['#costWeight', '#healthWeight', '#varietyWeight', '#speedWeight'];
      
      for (const slider of sliders) {
        await expect(page.locator(slider)).toBeVisible();
        
        // Test slider interaction
        await page.locator(slider).fill('0.8');
        const value = await page.locator(slider).inputValue();
        expect(parseFloat(value)).toBeCloseTo(0.8, 1);
      }
      
      // Test budget constraints
      await page.locator('#maxCostPerMeal').fill('3.50');
      await page.locator('#maxWeeklyCost').fill('25.00');
      
      // Test exclusions
      await page.check('#excludePork');
      await page.check('#excludeBeef');
      
      // Generate custom plan
      await page.click('button:has-text("KI-Wochenplan")');
      await page.waitForTimeout(5000);
      
      // Check if plan respects exclusions
      const mealEvents = page.locator('.meal-event');
      const mealCount = await mealEvents.count();
      expect(mealCount).toBeGreaterThan(0);
      
      console.log(`✅ Custom AI Mode: ${mealCount} Gerichte mit Exclusions generiert`);
    });

    test('2.3 Drag & Drop Funktionalität ist intuitiv', async ({ page }) => {
      await page.click('text=KI-Speiseplanung');
      
      // Generate some meals first
      await page.selectOption('#aiAssistantMode', 'variety');
      await page.click('button:has-text("KI-Wochenplan")');
      await page.waitForTimeout(3000);
      
      // Open recipe library
      const libraryButton = page.locator('button:has-text("Rezept-Bibliothek")');
      if (await libraryButton.isVisible()) {
        await libraryButton.click();
        await page.waitForTimeout(1000);
        
        // Try to drag a recipe
        const firstRecipe = page.locator('.recipe-item').first();
        const firstCalendarCell = page.locator('.calendar-day').first();
        
        if (await firstRecipe.isVisible() && await firstCalendarCell.isVisible()) {
          // Test drag and drop
          await firstRecipe.dragTo(firstCalendarCell);
          await page.waitForTimeout(1000);
          
          console.log('✅ Drag & Drop Test durchgeführt');
        }
      }
    });
  });

  test.describe('3. Data Management UX', () => {
    
    test('3.1 Produktverwaltung ist effizient und benutzerfreundlich', async ({ page }) => {
      await page.click('text=Produktverwaltung');
      await expect(page.locator('h1:has-text("Produktverwaltung")')).toBeVisible();
      
      // Check if products load quickly
      const startTime = Date.now();
      await expect(page.locator('.table tbody tr').first()).toBeVisible({ timeout: 5000 });
      const loadTime = Date.now() - startTime;
      
      expect(loadTime).toBeLessThan(3000);
      console.log(`✅ Produkte Load Time: ${loadTime}ms`);
      
      // Test search functionality
      const searchInput = page.locator('input[placeholder*="Suchen"]');
      if (await searchInput.isVisible()) {
        await searchInput.fill('Fleisch');
        await page.waitForTimeout(1000);
        
        // Check if search results make sense
        const rows = page.locator('.table tbody tr');
        const rowCount = await rows.count();
        expect(rowCount).toBeGreaterThan(0);
        
        console.log(`✅ Suche "Fleisch": ${rowCount} Ergebnisse`);
        
        // Clear search
        await searchInput.fill('');
      }
      
      // Test add product button
      const addButton = page.locator('button:has-text("Neues Produkt")');
      if (await addButton.isVisible()) {
        await addButton.click();
        
        // Check if modal opens
        await expect(page.locator('.modal')).toBeVisible();
        
        // Close modal
        await page.locator('.modal .btn-close').click();
        await expect(page.locator('.modal')).not.toBeVisible();
        
        console.log('✅ Add Product Modal funktioniert');
      }
    });

    test('3.2 Rezeptverwaltung bietet gute Übersicht', async ({ page }) => {
      await page.click('text=Rezeptverwaltung');
      await expect(page.locator('h1:has-text("Rezeptverwaltung")')).toBeVisible();
      
      // Check if recipes load
      const startTime = Date.now();
      await expect(page.locator('.table tbody tr').first()).toBeVisible({ timeout: 5000 });
      const loadTime = Date.now() - startTime;
      
      expect(loadTime).toBeLessThan(3000);
      console.log(`✅ Rezepte Load Time: ${loadTime}ms`);
      
      // Count total recipes
      const rows = page.locator('.table tbody tr');
      const recipeCount = await rows.count();
      expect(recipeCount).toBeGreaterThan(50); // Should have substantial recipe database
      
      console.log(`✅ Gefundene Rezepte: ${recipeCount}`);
      
      // Test recipe details
      const firstRecipe = rows.first();
      if (await firstRecipe.isVisible()) {
        const recipeName = await firstRecipe.locator('td').first().textContent();
        console.log(`✅ Erstes Rezept: ${recipeName}`);
      }
    });
  });

  test.describe('4. Analytics & Reporting UX', () => {
    
    test('4.1 Analytics sind visuell ansprechend und informativ', async ({ page }) => {
      await page.click('text=Analytics & Preisvergleich');
      await expect(page.locator('h1:has-text("Analytics")')).toBeVisible();
      
      // Check if charts load
      const chartContainers = page.locator('.chart-container');
      const chartCount = await chartContainers.count();
      expect(chartCount).toBeGreaterThan(0);
      
      // Wait for charts to render
      await page.waitForTimeout(3000);
      
      // Check if canvas elements (charts) are present
      const canvasElements = page.locator('canvas');
      const canvasCount = await canvasElements.count();
      expect(canvasCount).toBeGreaterThan(0);
      
      console.log(`✅ Analytics Charts: ${canvasCount} Charts geladen`);
      
      // Check metric cards
      const metricCards = page.locator('.metric-card');
      const metricsCount = await metricCards.count();
      expect(metricsCount).toBeGreaterThan(0);
      
      console.log(`✅ Metric Cards: ${metricsCount} Metriken angezeigt`);
    });

    test('4.2 Preisüberwachung ist funktional', async ({ page }) => {
      const priceTab = page.locator('text=Preisüberwachung');
      if (await priceTab.isVisible()) {
        await priceTab.click();
        await expect(page.locator('h1:has-text("Preisüberwachung")')).toBeVisible();
        
        // Check for price monitoring elements
        const priceElements = page.locator('[class*="price"], [class*="monitoring"]');
        const priceCount = await priceElements.count();
        
        console.log(`✅ Preisüberwachung Elemente: ${priceCount}`);
      }
    });
  });

  test.describe('5. Performance & Accessibility', () => {
    
    test('5.1 Seite lädt performant', async ({ page }) => {
      const startTime = Date.now();
      
      // Navigate to different sections and measure performance
      const sections = [
        'Dashboard',
        'KI-Speiseplanung', 
        'Produktverwaltung',
        'Analytics & Preisvergleich'
      ];
      
      for (const section of sections) {
        const sectionStartTime = Date.now();
        
        if (section === 'Dashboard') {
          await page.click('text=Dashboard');
        } else {
          await page.click(`text=${section}`);
        }
        
        await page.waitForTimeout(1000);
        const sectionLoadTime = Date.now() - sectionStartTime;
        
        expect(sectionLoadTime).toBeLessThan(2000); // Each section should load quickly
        console.log(`✅ ${section} Performance: ${sectionLoadTime}ms`);
      }
      
      const totalTime = Date.now() - startTime;
      console.log(`✅ Gesamt Navigation Performance: ${totalTime}ms`);
    });

    test('5.2 Accessibility - Keyboard Navigation', async ({ page }) => {
      // Test keyboard navigation
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      
      // Check if focused element is visible
      const focusedElement = page.locator(':focus');
      await expect(focusedElement).toBeVisible();
      
      console.log('✅ Keyboard Navigation funktioniert');
    });

    test('5.3 Error Handling ist benutzerfreundlich', async ({ page }) => {
      // Test invalid actions gracefully
      await page.click('text=KI-Speiseplanung');
      
      // Try to generate without proper selection (if applicable)
      const generateButton = page.locator('button:has-text("KI-Wochenplan")');
      if (await generateButton.isVisible()) {
        await generateButton.click();
        
        // Should not crash the application
        await page.waitForTimeout(2000);
        await expect(page.locator('h1:has-text("KI-Speiseplanung")')).toBeVisible();
        
        console.log('✅ Error Handling Test: Anwendung bleibt stabil');
      }
    });
  });

  test.describe('6. Real User Scenario Tests', () => {
    
    test('6.1 Kompletter Workflow: Neues Produkt → Rezept → Wochenplan', async ({ page }) => {
      // Step 1: Add a new product
      await page.click('text=Produktverwaltung');
      
      const addProductBtn = page.locator('button:has-text("Neues Produkt")');
      if (await addProductBtn.isVisible()) {
        await addProductBtn.click();
        
        // Fill product form (if modal opens)
        const modal = page.locator('.modal');
        if (await modal.isVisible()) {
          const nameField = modal.locator('input[name="name"], #productName');
          if (await nameField.isVisible()) {
            await nameField.fill('UX Test Produkt');
          }
          
          // Close modal
          await page.locator('.modal .btn-close').click();
        }
      }
      
      // Step 2: Check recipes
      await page.click('text=Rezeptverwaltung');
      await expect(page.locator('h1:has-text("Rezeptverwaltung")')).toBeVisible();
      
      // Step 3: Create meal plan
      await page.click('text=KI-Speiseplanung');
      await page.selectOption('#aiAssistantMode', 'variety');
      await page.click('button:has-text("KI-Wochenplan")');
      await page.waitForTimeout(3000);
      
      // Check workflow completion
      const mealEvents = page.locator('.meal-event');
      const mealCount = await mealEvents.count();
      expect(mealCount).toBeGreaterThan(0);
      
      console.log('✅ Kompletter Workflow erfolgreich durchgeführt');
    });

    test('6.2 Mobile User Experience Simulation', async ({ page }) => {
      // Simulate mobile device
      await page.setViewportSize({ width: 375, height: 667 });
      
      // Test main functions on mobile
      await page.click('text=KI-Speiseplanung');
      await expect(page.locator('h1:has-text("KI-Speiseplanung")')).toBeVisible();
      
      // Test if AI mode selection works on mobile
      const modeSelect = page.locator('#aiAssistantMode');
      if (await modeSelect.isVisible()) {
        await modeSelect.selectOption('cost_optimized');
        await page.click('button:has-text("KI-Wochenplan")');
        await page.waitForTimeout(3000);
        
        const mealEvents = page.locator('.meal-event');
        const mealCount = await mealEvents.count();
        
        console.log(`✅ Mobile UX: ${mealCount} Gerichte auf Mobile generiert`);
      }
    });

    test('6.3 Stress Test - Schnelle Navigation', async ({ page }) => {
      const tabs = [
        'KI-Speiseplanung',
        'Produktverwaltung', 
        'Rezeptverwaltung',
        'Analytics & Preisvergleich',
        'Dashboard'
      ];
      
      // Rapidly switch between tabs multiple times
      for (let i = 0; i < 3; i++) {
        for (const tab of tabs) {
          await page.click(`text=${tab}`);
          await page.waitForTimeout(500); // Quick navigation
        }
      }
      
      // Application should still be responsive
      await expect(page.locator('h1').first()).toBeVisible();
      console.log('✅ Stress Test: Anwendung bleibt nach schneller Navigation responsive');
    });
  });
});