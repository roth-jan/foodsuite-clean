// FoodSuite - Performance & Usability UX Test
// Focuses on performance metrics, load times, and usability patterns
import { test, expect } from '@playwright/test';

test.describe('FoodSuite Performance & Usability Tests', () => {
  
  const BASE_URL = 'http://3.120.41.138:3000';
  const TEST_USER = { username: 'admin', password: 'Demo123!' };
  
  test.beforeEach(async ({ page }) => {
    page.setDefaultTimeout(15000);
    await page.goto(BASE_URL);
    
    // Login with performance measurement
    const loginStart = Date.now();
    await page.fill('#username', TEST_USER.username);
    await page.fill('#password', TEST_USER.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/foodsuite-complete-app.html');
    const loginTime = Date.now() - loginStart;
    
    console.log(`🔐 Login Performance: ${loginTime}ms`);
    expect(loginTime).toBeLessThan(5000); // Login should be under 5 seconds
  });

  test.describe('Performance Benchmarks', () => {
    
    test('Page Load Performance - All Major Sections', async ({ page }) => {
      const sections = [
        { name: 'Dashboard', selector: 'text=Dashboard', expectedH1: 'Dashboard' },
        { name: 'KI-Speiseplanung', selector: 'text=KI-Speiseplanung', expectedH1: 'KI-Speiseplanung' },
        { name: 'Produktverwaltung', selector: 'text=Produktverwaltung', expectedH1: 'Produktverwaltung' },
        { name: 'Rezeptverwaltung', selector: 'text=Rezeptverwaltung', expectedH1: 'Rezeptverwaltung' },
        { name: 'Analytics', selector: 'text=Analytics & Preisvergleich', expectedH1: 'Analytics' }
      ];
      
      const performanceResults = {};
      
      for (const section of sections) {
        const startTime = Date.now();
        
        await page.click(section.selector);
        await expect(page.locator(`h1:has-text("${section.expectedH1}")`)).toBeVisible();
        
        // Wait for content to be fully loaded
        await page.waitForTimeout(1000);
        
        const loadTime = Date.now() - startTime;
        performanceResults[section.name] = loadTime;
        
        // Performance expectations
        if (section.name === 'Analytics') {
          expect(loadTime).toBeLessThan(4000); // Analytics can take longer due to charts
        } else {
          expect(loadTime).toBeLessThan(2000); // Other sections should be fast
        }
        
        console.log(`⚡ ${section.name}: ${loadTime}ms`);
      }
      
      // Overall performance assessment
      const avgLoadTime = Object.values(performanceResults).reduce((a, b) => a + b, 0) / Object.values(performanceResults).length;
      console.log(`📊 Average Load Time: ${avgLoadTime.toFixed(0)}ms`);
      expect(avgLoadTime).toBeLessThan(2500);
    });

    test('AI Meal Planning Performance', async ({ page }) => {
      await page.click('text=KI-Speiseplanung');
      
      const aiModes = [
        'cost_optimized',
        'balanced_nutrition', 
        'variety',
        'seasonal',
        'inventory_based'
      ];
      
      const aiPerformance = {};
      
      for (const mode of aiModes) {
        // Clear previous plan
        const clearBtn = page.locator('button:has-text("Kalender leeren")');
        if (await clearBtn.isVisible()) {
          await clearBtn.click();
          await page.waitForTimeout(500);
        }
        
        // Measure AI generation time
        const startTime = Date.now();
        
        await page.selectOption('#aiAssistantMode', mode);
        await page.click('button:has-text("KI-Wochenplan")');
        
        // Wait for at least one meal to appear
        await expect(page.locator('.meal-event').first()).toBeVisible({ timeout: 15000 });
        
        const generationTime = Date.now() - startTime;
        aiPerformance[mode] = generationTime;
        
        // Count generated meals
        const mealCount = await page.locator('.meal-event').count();
        
        console.log(`🤖 AI ${mode}: ${generationTime}ms (${mealCount} Gerichte)`);
        
        // AI should generate plans within 10 seconds
        expect(generationTime).toBeLessThan(10000);
        expect(mealCount).toBeGreaterThan(0);
      }
      
      const avgAITime = Object.values(aiPerformance).reduce((a, b) => a + b, 0) / Object.values(aiPerformance).length;
      console.log(`🎯 Average AI Generation: ${avgAITime.toFixed(0)}ms`);
    });

    test('Data Loading Performance - Large Datasets', async ({ page }) => {
      // Test product loading
      const productStart = Date.now();
      await page.click('text=Produktverwaltung');
      await expect(page.locator('.table tbody tr').first()).toBeVisible();
      const productLoadTime = Date.now() - productStart;
      console.log(`📦 Products Load: ${productLoadTime}ms`);
      expect(productLoadTime).toBeLessThan(3000);
      
      // Count products for performance context
      const productCount = await page.locator('.table tbody tr').count();
      console.log(`📊 Products Loaded: ${productCount}`);
      
      // Test recipe loading
      const recipeStart = Date.now();
      await page.click('text=Rezeptverwaltung');
      await expect(page.locator('.table tbody tr').first()).toBeVisible();
      const recipeLoadTime = Date.now() - recipeStart;
      console.log(`👨‍🍳 Recipes Load: ${recipeLoadTime}ms`);
      expect(recipeLoadTime).toBeLessThan(3000);
      
      // Count recipes
      const recipeCount = await page.locator('.table tbody tr').count();
      console.log(`📊 Recipes Loaded: ${recipeCount}`);
      expect(recipeCount).toBeGreaterThan(50); // Should have substantial recipe database
    });
  });

  test.describe('Usability & User Experience', () => {
    
    test('Form Usability - Error Handling and Validation', async ({ page }) => {
      await page.click('text=Produktverwaltung');
      
      // Try to add new product
      const addBtn = page.locator('button:has-text("Neues Produkt")');
      if (await addBtn.isVisible()) {
        await addBtn.click();
        
        // Check if modal opens quickly
        await expect(page.locator('.modal')).toBeVisible();
        
        // Test form validation (submit without filling required fields)
        const submitBtn = page.locator('.modal button[type="submit"], .modal .btn-primary');
        if (await submitBtn.isVisible()) {
          await submitBtn.click();
          
          // Should show validation errors or prevent submission
          // Form should still be open if validation failed
          const modalStillOpen = await page.locator('.modal').isVisible();
          console.log(`✅ Form Validation: Modal ${modalStillOpen ? 'remains open' : 'closed'}`);
        }
        
        // Close modal
        await page.locator('.modal .btn-close, .modal .btn-secondary').click();
        await expect(page.locator('.modal')).not.toBeVisible();
        
        console.log('✅ Modal interaction completed successfully');
      }
    });

    test('Search and Filter Usability', async ({ page }) => {
      await page.click('text=Produktverwaltung');
      await expect(page.locator('.table tbody tr').first()).toBeVisible();
      
      // Test search functionality
      const searchInput = page.locator('input[placeholder*="Suchen"], input[type="search"]');
      if (await searchInput.isVisible()) {
        // Search for common term
        await searchInput.fill('Fleisch');
        await page.waitForTimeout(1000); // Allow search to process
        
        const initialRows = await page.locator('.table tbody tr').count();
        console.log(`🔍 Search "Fleisch": ${initialRows} results`);
        
        // Search for more specific term
        await searchInput.fill('Rindfleisch');
        await page.waitForTimeout(1000);
        
        const specificRows = await page.locator('.table tbody tr').count();
        console.log(`🔍 Search "Rindfleisch": ${specificRows} results`);
        
        // Specific search should return fewer or equal results
        expect(specificRows).toBeLessThanOrEqual(initialRows);
        
        // Clear search
        await searchInput.fill('');
        await page.waitForTimeout(1000);
        
        const allRows = await page.locator('.table tbody tr').count();
        console.log(`🔍 Clear search: ${allRows} results`);
        
        // Should show more results after clearing
        expect(allRows).toBeGreaterThanOrEqual(initialRows);
      }
    });

    test('Mobile Responsiveness & Touch Interactions', async ({ page }) => {
      // Test mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      
      // Navigation should work on mobile
      await page.click('text=KI-Speiseplanung');
      await expect(page.locator('h1:has-text("KI-Speiseplanung")')).toBeVisible();
      
      // Check if mobile elements are appropriately sized
      const modeSelect = page.locator('#aiAssistantMode');
      if (await modeSelect.isVisible()) {
        const boundingBox = await modeSelect.boundingBox();
        expect(boundingBox.height).toBeGreaterThan(30); // Touch-friendly size
        
        console.log(`📱 Mobile Element Size: ${boundingBox.width}x${boundingBox.height}`);
      }
      
      // Test mobile meal planning
      if (await modeSelect.isVisible()) {
        await modeSelect.selectOption('variety');
        await page.click('button:has-text("KI-Wochenplan")');
        await page.waitForTimeout(3000);
        
        const mealEvents = page.locator('.meal-event');
        const mealCount = await mealEvents.count();
        console.log(`📱 Mobile AI Generation: ${mealCount} meals`);
        expect(mealCount).toBeGreaterThan(0);
      }
      
      // Test tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 });
      await expect(page.locator('h1:has-text("KI-Speiseplanung")')).toBeVisible();
      
      console.log('✅ Mobile & Tablet responsiveness verified');
    });

    test('Accessibility - Keyboard Navigation & Focus Management', async ({ page }) => {
      // Reset to desktop for accessibility testing
      await page.setViewportSize({ width: 1920, height: 1080 });
      
      // Test keyboard navigation through main navigation
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      
      // Check if focus is visible
      const focusedElement = await page.locator(':focus');
      await expect(focusedElement).toBeVisible();
      
      // Test navigation with Enter key
      const focusedText = await focusedElement.textContent();
      if (focusedText && focusedText.includes('KI-Speiseplanung')) {
        await page.keyboard.press('Enter');
        await expect(page.locator('h1:has-text("KI-Speiseplanung")')).toBeVisible();
        console.log('✅ Keyboard navigation to KI-Speiseplanung successful');
      }
      
      // Test form accessibility
      await page.click('text=Produktverwaltung');
      const addBtn = page.locator('button:has-text("Neues Produkt")');
      if (await addBtn.isVisible()) {
        await addBtn.click();
        
        // Test Tab navigation in modal
        const modal = page.locator('.modal');
        if (await modal.isVisible()) {
          await page.keyboard.press('Tab');
          const modalFocusedElement = await page.locator('.modal :focus');
          await expect(modalFocusedElement).toBeVisible();
          
          // Close with Escape
          await page.keyboard.press('Escape');
          await expect(modal).not.toBeVisible();
          console.log('✅ Modal keyboard navigation successful');
        }
      }
    });

    test('Error States & Recovery', async ({ page }) => {
      // Test graceful handling of potential errors
      await page.click('text=KI-Speiseplanung');
      
      // Test rapid clicking (potential error scenario)
      const generateBtn = page.locator('button:has-text("KI-Wochenplan")');
      if (await generateBtn.isVisible()) {
        // Click multiple times rapidly
        await generateBtn.click();
        await generateBtn.click();
        await generateBtn.click();
        
        // Wait and check if application is still responsive
        await page.waitForTimeout(5000);
        await expect(page.locator('h1:has-text("KI-Speiseplanung")')).toBeVisible();
        
        console.log('✅ Application handles rapid clicking gracefully');
      }
      
      // Test navigation during loading
      if (await generateBtn.isVisible()) {
        await generateBtn.click();
        
        // Immediately navigate away
        await page.click('text=Produktverwaltung');
        await expect(page.locator('h1:has-text("Produktverwaltung")')).toBeVisible();
        
        // Navigate back
        await page.click('text=KI-Speiseplanung');
        await expect(page.locator('h1:has-text("KI-Speiseplanung")')).toBeVisible();
        
        console.log('✅ Navigation during operations handled gracefully');
      }
    });
  });

  test.describe('User Satisfaction Metrics', () => {
    
    test('Feature Completeness Assessment', async ({ page }) => {
      const features = {
        'AI Meal Planning': false,
        'Product Management': false,
        'Recipe Management': false,
        'Analytics': false,
        'Drag & Drop': false,
        'Custom AI Modes': false,
        'Responsive Design': false
      };
      
      // Test AI Meal Planning
      await page.click('text=KI-Speiseplanung');
      if (await page.locator('#aiAssistantMode').isVisible()) {
        features['AI Meal Planning'] = true;
        
        // Test custom AI mode
        await page.selectOption('#aiAssistantMode', 'custom');
        if (await page.locator('#costWeight').isVisible()) {
          features['Custom AI Modes'] = true;
        }
        
        // Test drag & drop by checking for draggable elements
        const draggableElements = page.locator('[draggable="true"], .draggable');
        if ((await draggableElements.count()) > 0) {
          features['Drag & Drop'] = true;
        }
      }
      
      // Test Product Management
      await page.click('text=Produktverwaltung');
      if (await page.locator('.table tbody tr').first().isVisible()) {
        features['Product Management'] = true;
      }
      
      // Test Recipe Management
      await page.click('text=Rezeptverwaltung');
      if (await page.locator('.table tbody tr').first().isVisible()) {
        features['Recipe Management'] = true;
      }
      
      // Test Analytics
      await page.click('text=Analytics & Preisvergleich');
      if (await page.locator('.chart-container, canvas').first().isVisible()) {
        features['Analytics'] = true;
      }
      
      // Test Responsive Design
      await page.setViewportSize({ width: 375, height: 667 });
      if (await page.locator('.main-header').isVisible()) {
        features['Responsive Design'] = true;
      }
      
      // Calculate feature completeness
      const completedFeatures = Object.values(features).filter(Boolean).length;
      const totalFeatures = Object.keys(features).length;
      const completeness = (completedFeatures / totalFeatures) * 100;
      
      console.log('\n📋 Feature Completeness Report:');
      Object.entries(features).forEach(([feature, completed]) => {
        console.log(`${completed ? '✅' : '❌'} ${feature}`);
      });
      console.log(`\n🎯 Overall Completeness: ${completeness.toFixed(1)}% (${completedFeatures}/${totalFeatures})`);
      
      // Expect high feature completeness
      expect(completeness).toBeGreaterThan(80);
    });

    test('User Journey Completion Rate', async ({ page }) => {
      const journeys = {
        'Quick Meal Plan Generation': false,
        'Product Browse and Search': false,
        'Recipe Discovery': false,
        'Analytics Review': false,
        'Multi-Device Usage': false
      };
      
      try {
        // Journey 1: Quick Meal Plan Generation
        await page.click('text=KI-Speiseplanung');
        await page.selectOption('#aiAssistantMode', 'variety');
        await page.click('button:has-text("KI-Wochenplan")');
        await page.waitForTimeout(5000);
        
        const mealCount = await page.locator('.meal-event').count();
        if (mealCount > 0) {
          journeys['Quick Meal Plan Generation'] = true;
        }
      } catch (e) {
        console.log('Journey 1 failed:', e.message);
      }
      
      try {
        // Journey 2: Product Browse and Search
        await page.click('text=Produktverwaltung');
        await page.waitForTimeout(2000);
        
        const productCount = await page.locator('.table tbody tr').count();
        if (productCount > 0) {
          journeys['Product Browse and Search'] = true;
        }
      } catch (e) {
        console.log('Journey 2 failed:', e.message);
      }
      
      try {
        // Journey 3: Recipe Discovery
        await page.click('text=Rezeptverwaltung');
        await page.waitForTimeout(2000);
        
        const recipeCount = await page.locator('.table tbody tr').count();
        if (recipeCount > 0) {
          journeys['Recipe Discovery'] = true;
        }
      } catch (e) {
        console.log('Journey 3 failed:', e.message);
      }
      
      try {
        // Journey 4: Analytics Review
        await page.click('text=Analytics & Preisvergleich');
        await page.waitForTimeout(3000);
        
        const chartCount = await page.locator('.chart-container, canvas').count();
        if (chartCount > 0) {
          journeys['Analytics Review'] = true;
        }
      } catch (e) {
        console.log('Journey 4 failed:', e.message);
      }
      
      try {
        // Journey 5: Multi-Device Usage
        await page.setViewportSize({ width: 375, height: 667 });
        await page.click('text=KI-Speiseplanung');
        
        if (await page.locator('h1:has-text("KI-Speiseplanung")').isVisible()) {
          journeys['Multi-Device Usage'] = true;
        }
      } catch (e) {
        console.log('Journey 5 failed:', e.message);
      }
      
      // Calculate completion rate
      const completedJourneys = Object.values(journeys).filter(Boolean).length;
      const totalJourneys = Object.keys(journeys).length;
      const completionRate = (completedJourneys / totalJourneys) * 100;
      
      console.log('\n🚀 User Journey Completion Report:');
      Object.entries(journeys).forEach(([journey, completed]) => {
        console.log(`${completed ? '✅' : '❌'} ${journey}`);
      });
      console.log(`\n📊 Journey Completion Rate: ${completionRate.toFixed(1)}% (${completedJourneys}/${totalJourneys})`);
      
      // Expect high journey completion rate
      expect(completionRate).toBeGreaterThan(70);
    });
  });
});