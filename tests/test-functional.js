const { test, expect } = require('@playwright/test');

test.describe('FoodSuite Functional Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Start HTTP server for the HTML file
    await page.goto('file:///C:/Users/JanHendrikRoth/Desktop/Claude%20Ergebnisse/Claude%20Ergebnisse/Foodsuite/foodsuite-complete-app.html');
    await page.waitForTimeout(2000);
  });

  test('should load basic application structure', async ({ page }) => {
    console.log('\n=== TESTING BASIC APPLICATION STRUCTURE ===');
    
    // Check if main elements are present
    const header = page.locator('.main-header');
    await expect(header).toBeVisible();
    console.log('✓ Main header visible');
    
    const navigation = page.locator('.navbar');
    await expect(navigation).toBeVisible();
    console.log('✓ Navigation visible');
    
    const tabContent = page.locator('.tab-content');
    await expect(tabContent).toBeVisible();
    console.log('✓ Tab content area visible');
    
    console.log('Basic application structure loaded successfully!');
  });

  test('should show dashboard as default tab', async ({ page }) => {
    console.log('\n=== TESTING DEFAULT TAB ===');
    
    // Check if dashboard is the active tab by default
    const dashboardTab = page.locator('#dashboard');
    await expect(dashboardTab).toHaveClass(/active/);
    console.log('✓ Dashboard tab is active by default');
    
    // Check dashboard content is visible
    const dashboardContent = page.locator('#dashboard .metric-card');
    const cardCount = await dashboardContent.count();
    console.log(`✓ Dashboard metric cards: ${cardCount}`);
    expect(cardCount).toBeGreaterThan(0);
    
    console.log('Dashboard default tab working!');
  });

  test('should have all main navigation tabs', async ({ page }) => {
    console.log('\n=== TESTING NAVIGATION TABS ===');
    
    const expectedTabs = [
      { name: 'Dashboard', selector: 'a[href="#dashboard"]' },
      { name: 'Meal Planning', selector: 'a[href="#meal-planning"]' },
      { name: 'Products', selector: 'a[href="#products"]' },
      { name: 'Suppliers', selector: 'a[href="#suppliers"]' },
      { name: 'Orders', selector: 'a[href="#orders"]' },
      { name: 'Inventory', selector: 'a[href="#inventory"]' },
      { name: 'Recipes', selector: 'a[href="#recipes"]' },
      { name: 'Analytics', selector: 'a[href="#analytics"]' }
    ];
    
    for (const tab of expectedTabs) {
      const tabElement = page.locator(tab.selector);
      const count = await tabElement.count();
      console.log(`✓ ${tab.name} tab: ${count > 0 ? 'present' : 'missing'}`);
      expect(count).toBeGreaterThan(0);
    }
    
    console.log('All navigation tabs present!');
  });

  test('should switch between tabs correctly', async ({ page }) => {
    console.log('\n=== TESTING TAB SWITCHING ===');
    
    const tabsToTest = [
      { name: 'Products', href: '#products', id: 'products' },
      { name: 'Suppliers', href: '#suppliers', id: 'suppliers' },
      { name: 'Dashboard', href: '#dashboard', id: 'dashboard' }
    ];
    
    for (const tab of tabsToTest) {
      console.log(`Testing ${tab.name} tab...`);
      
      // Click the nav link (specifically the one with onclick)
      await page.click(`a.nav-link[href="${tab.href}"]`);
      await page.waitForTimeout(500);
      
      // Verify correct tab content is visible
      const tabContent = page.locator(`#${tab.id}`);
      await expect(tabContent).toHaveClass(/active/);
      
      console.log(`✓ ${tab.name} tab activated successfully`);
    }
    
    console.log('Tab switching working correctly!');
  });

  test('should have working buttons for main functions', async ({ page }) => {
    console.log('\n=== TESTING MAIN FUNCTION BUTTONS ===');
    
    // Check AI recommendation buttons
    const aiButtons = page.locator('button[onclick*="applyAIRecommendation"], button[onclick*="generateAIWeekMenu"], button[onclick*="optimizeCurrentPlan"]');
    const aiButtonCount = await aiButtons.count();
    console.log(`✓ AI function buttons: ${aiButtonCount}`);
    expect(aiButtonCount).toBeGreaterThan(0);
    
    // Check export buttons
    const exportButtons = page.locator('button[onclick*="export"]');
    const exportButtonCount = await exportButtons.count();
    console.log(`✓ Export function buttons: ${exportButtonCount}`);
    expect(exportButtonCount).toBeGreaterThan(0);
    
    // Check navigation buttons
    const navButtons = page.locator('button[onclick*="previousWeek"], button[onclick*="nextWeek"]');
    const navButtonCount = await navButtons.count();
    console.log(`✓ Navigation buttons: ${navButtonCount}`);
    expect(navButtonCount).toBeGreaterThan(0);
    
    console.log('Main function buttons present!');
  });

  test('should test AI mode toggle functionality', async ({ page }) => {
    console.log('\n=== TESTING AI MODE TOGGLE ===');
    
    // Look for AI toggle buttons
    const aiToggleButtons = page.locator('.ai-button[onclick*="toggleAIMode"]');
    const toggleCount = await aiToggleButtons.count();
    console.log(`✓ AI toggle buttons found: ${toggleCount}`);
    
    if (toggleCount > 0) {
      // Click first AI toggle button
      await aiToggleButtons.first().click();
      await page.waitForTimeout(500);
      
      console.log('✓ AI toggle button clicked successfully');
    }
    
    console.log('AI mode toggle functionality tested!');
  });

  test('should verify meal planning calendar structure', async ({ page }) => {
    console.log('\n=== TESTING MEAL PLANNING STRUCTURE ===');
    
    // Switch to meal planning tab
    await page.click('a.nav-link[href="#meal-planning"]');
    await page.waitForTimeout(1000);
    
    // Check if meal planning content is active
    const mealPlanningTab = page.locator('#meal-planning');
    await expect(mealPlanningTab).toHaveClass(/active/);
    
    // Check for calendar structure
    const calendar = page.locator('.calendar-grid, .meal-calendar');
    const calendarCount = await calendar.count();
    console.log(`✓ Calendar elements: ${calendarCount}`);
    
    // Check for week navigation
    const weekNav = page.locator('button[onclick*="previousWeek"], button[onclick*="nextWeek"]');
    const weekNavCount = await weekNav.count();
    console.log(`✓ Week navigation buttons: ${weekNavCount}`);
    expect(weekNavCount).toBeGreaterThan(0);
    
    console.log('Meal planning structure verified!');
  });

  test('should test responsive design elements', async ({ page }) => {
    console.log('\n=== TESTING RESPONSIVE DESIGN ===');
    
    // Test different viewport sizes
    const viewports = [
      { width: 1920, height: 1080, name: 'Desktop' },
      { width: 768, height: 1024, name: 'Tablet' },
      { width: 375, height: 667, name: 'Mobile' }
    ];
    
    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.waitForTimeout(500);
      
      // Check if main navigation is still accessible
      const navigation = page.locator('.navbar');
      await expect(navigation).toBeVisible();
      console.log(`✓ Navigation visible on ${viewport.name} (${viewport.width}x${viewport.height})`);
    }
    
    // Reset to desktop size
    await page.setViewportSize({ width: 1920, height: 1080 });
    
    console.log('Responsive design elements working!');
  });

  test('should verify charts and visualizations load', async ({ page }) => {
    console.log('\n=== TESTING CHARTS AND VISUALIZATIONS ===');
    
    // Go to dashboard
    await page.click('a.nav-link[href="#dashboard"]');
    await page.waitForTimeout(2000);
    
    // Check for chart containers
    const chartContainers = page.locator('.chart-container, canvas');
    const chartCount = await chartContainers.count();
    console.log(`✓ Chart containers/canvases: ${chartCount}`);
    
    // Charts should be present
    expect(chartCount).toBeGreaterThan(0);
    
    // Check for Chart.js specific elements
    const chartJs = await page.evaluate(() => {
      return typeof window.Chart !== 'undefined';
    });
    console.log(`✓ Chart.js library loaded: ${chartJs}`);
    
    console.log('Charts and visualizations verified!');
  });

  test('should check Bootstrap components', async ({ page }) => {
    console.log('\n=== TESTING BOOTSTRAP COMPONENTS ===');
    
    // Check for Bootstrap classes
    const bootstrapElements = {
      'Cards': '.card',
      'Buttons': '.btn',
      'Badges': '.badge',
      'Tables': '.table',
      'Navbar': '.navbar'
    };
    
    for (const [component, selector] of Object.entries(bootstrapElements)) {
      const elements = page.locator(selector);
      const count = await elements.count();
      console.log(`✓ ${component}: ${count} elements`);
      expect(count).toBeGreaterThan(0);
    }
    
    console.log('Bootstrap components verified!');
  });
});