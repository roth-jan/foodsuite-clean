const { test, expect } = require('@playwright/test');

test.describe('Current Application State Test', () => {
  test('should check what is actually visible on localhost:3456', async ({ page }) => {
    console.log('🔍 CHECKING CURRENT STATE OF APPLICATION');
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
    console.log('\n🌐 Navigating to http://localhost:3456/');
    await page.goto('http://localhost:3456/');
    
    // Wait a bit for page to load
    await page.waitForTimeout(3000);
    
    // Take a screenshot
    await page.screenshot({ path: 'current-state.png', fullPage: true });
    console.log('📸 Screenshot saved as current-state.png');
    
    // Check page title
    const title = await page.title();
    console.log(`\n📄 Page Title: "${title}"`);
    
    // Check if main elements exist
    console.log('\n🔍 CHECKING MAIN ELEMENTS:');
    
    // Check for navbar
    const navbar = await page.locator('.navbar').count();
    console.log(`✓ Navbar found: ${navbar > 0 ? 'YES' : 'NO'}`);
    
    // Check for navigation links
    const navLinks = await page.locator('.navbar .nav-link').count();
    console.log(`✓ Navigation links: ${navLinks}`);
    
    // Check for main content
    const mainContent = await page.locator('.main-content').count();
    console.log(`✓ Main content area: ${mainContent > 0 ? 'YES' : 'NO'}`);
    
    // Check for dashboard
    const dashboard = await page.locator('#dashboard').count();
    console.log(`✓ Dashboard tab: ${dashboard > 0 ? 'YES' : 'NO'}`);
    
    // Check if dashboard is visible
    const dashboardVisible = await page.locator('#dashboard.active').count();
    console.log(`✓ Dashboard visible: ${dashboardVisible > 0 ? 'YES' : 'NO'}`);
    
    // Check for any error messages
    console.log('\n🚨 CHECKING FOR ERRORS:');
    const errors = await page.locator('.alert-danger, .error, .text-danger').count();
    console.log(`✓ Error messages found: ${errors}`);
    
    if (errors > 0) {
      for (let i = 0; i < errors; i++) {
        const errorText = await page.locator('.alert-danger, .error, .text-danger').nth(i).textContent();
        console.log(`  Error ${i + 1}: ${errorText}`);
      }
    }
    
    // Check body content
    console.log('\n📄 CHECKING BODY CONTENT:');
    const bodyText = await page.locator('body').textContent();
    if (bodyText.trim().length === 0) {
      console.log('❌ BODY IS EMPTY!');
    } else {
      console.log(`✓ Body has content (${bodyText.length} characters)`);
      console.log(`✓ First 200 chars: ${bodyText.substring(0, 200)}...`);
    }
    
    // Check for specific tabs
    console.log('\n📂 CHECKING TABS:');
    const tabs = [
      'Dashboard',
      'KI-Speiseplanung', 
      'Produkte',
      'Rezepte',
      'Lieferanten',
      'Bestellungen',
      'Lager',
      'Analytics'
    ];
    
    for (const tab of tabs) {
      const tabExists = await page.locator(`text="${tab}"`).count();
      console.log(`✓ ${tab} tab: ${tabExists > 0 ? 'EXISTS' : 'NOT FOUND'}`);
    }
    
    // Test clicking on Rezepte tab
    console.log('\n🖱️ TESTING RECIPE TAB:');
    const recipeLink = page.locator('a[href="#recipes"]');
    const recipeLinkExists = await recipeLink.count();
    
    if (recipeLinkExists > 0) {
      console.log('✓ Recipe link found, clicking...');
      await recipeLink.click();
      await page.waitForTimeout(2000);
      
      // Check recipe dashboard
      const totalRecipes = await page.locator('#totalRecipes').textContent();
      const favoriteRecipes = await page.locator('#favoriteRecipes').textContent();
      const averagePortions = await page.locator('#averagePortions').textContent();
      const averageCost = await page.locator('#averageCost').textContent();
      
      console.log('\n📊 RECIPE DASHBOARD VALUES:');
      console.log(`  Total Recipes: ${totalRecipes}`);
      console.log(`  Favorite Recipes: ${favoriteRecipes}`);
      console.log(`  Average Portions: ${averagePortions}`);
      console.log(`  Average Cost: ${averageCost}`);
    }
    
    console.log('\n✅ Current state check completed');
  });
});