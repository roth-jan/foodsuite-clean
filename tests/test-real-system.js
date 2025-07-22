const { test, expect } = require('@playwright/test');

const BASE_URL = 'http://3.120.41.138:3000';

test('REAL System Test - What Actually Works', async ({ page }) => {
    console.log('\n🔍 TESTING WHAT REALLY WORKS');
    console.log('==============================\n');
    
    // Test 1: Open main URL
    console.log('1️⃣ Opening main URL...');
    try {
        await page.goto(BASE_URL);
        const currentUrl = page.url();
        console.log(`   Current URL: ${currentUrl}`);
        
        // Take screenshot of what we see
        await page.screenshot({ path: 'test-screenshots/actual-main-page.png' });
        console.log('   📸 Screenshot saved: actual-main-page.png');
        
        // Check what's actually on the page
        const pageTitle = await page.title();
        console.log(`   Page title: "${pageTitle}"`);
        
    } catch (error) {
        console.log(`   ❌ Error opening main URL: ${error.message}`);
    }
    
    // Test 2: Check if login exists
    console.log('\n2️⃣ Checking for login elements...');
    
    const hasUsernameField = await page.locator('#username').count() > 0;
    const hasPasswordField = await page.locator('#password').count() > 0;
    const hasLoginButton = await page.locator('button[type="submit"]').count() > 0;
    
    console.log(`   Username field exists: ${hasUsernameField}`);
    console.log(`   Password field exists: ${hasPasswordField}`);
    console.log(`   Login button exists: ${hasLoginButton}`);
    
    if (!hasUsernameField || !hasPasswordField) {
        console.log('   ❌ No login form found - checking what IS on the page...');
        
        // Check for any visible text
        const visibleText = await page.locator('body').innerText();
        console.log(`   First 200 chars of page: ${visibleText.substring(0, 200)}...`);
    }
    
    // Test 3: Try to login if form exists
    if (hasUsernameField && hasPasswordField && hasLoginButton) {
        console.log('\n3️⃣ Attempting login...');
        
        await page.fill('#username', 'admin');
        await page.fill('#password', 'Demo123!');
        await page.click('button[type="submit"]');
        
        // Wait and see what happens
        await page.waitForTimeout(3000);
        
        const afterLoginUrl = page.url();
        console.log(`   After login URL: ${afterLoginUrl}`);
        
        // Check for any errors
        const hasAlert = await page.locator('.alert').count() > 0;
        if (hasAlert) {
            const alertText = await page.locator('.alert').innerText();
            console.log(`   Alert message: ${alertText}`);
        }
        
        // Take screenshot after login attempt
        await page.screenshot({ path: 'test-screenshots/after-login-attempt.png' });
        console.log('   📸 Screenshot saved: after-login-attempt.png');
    }
    
    // Test 4: Check current page content
    console.log('\n4️⃣ Checking current page content...');
    
    // Check for navigation elements
    const hasSidebar = await page.locator('.sidebar').count() > 0;
    const hasNavbar = await page.locator('.navbar').count() > 0;
    const hasUserMenu = await page.locator('.user-menu').count() > 0;
    const hasDropdown = await page.locator('.dropdown').count() > 0;
    
    console.log(`   Sidebar exists: ${hasSidebar}`);
    console.log(`   Navbar exists: ${hasNavbar}`);
    console.log(`   User menu exists: ${hasUserMenu}`);
    console.log(`   Dropdown exists: ${hasDropdown}`);
    
    // Test 5: Check for data tables
    console.log('\n5️⃣ Checking for data tables...');
    
    const hasProductsTable = await page.locator('#productsTableBody').count() > 0;
    const hasRecipesTable = await page.locator('#recipesTableBody').count() > 0;
    const hasSuppliersTable = await page.locator('#suppliersTableBody').count() > 0;
    
    console.log(`   Products table exists: ${hasProductsTable}`);
    console.log(`   Recipes table exists: ${hasRecipesTable}`);
    console.log(`   Suppliers table exists: ${hasSuppliersTable}`);
    
    // Test 6: Try to click on tabs if they exist
    if (hasSidebar) {
        console.log('\n6️⃣ Testing navigation...');
        
        // Try products tab
        const productsLink = await page.locator('[data-tab="products"]').count() > 0;
        if (productsLink) {
            await page.click('[data-tab="products"]');
            await page.waitForTimeout(2000);
            console.log('   Clicked on Products tab');
            
            // Check if products loaded
            const productsVisible = await page.locator('#products').isVisible();
            console.log(`   Products section visible: ${productsVisible}`);
        }
    }
    
    // Test 7: Check API directly
    console.log('\n7️⃣ Testing API directly...');
    
    try {
        const healthResponse = await page.request.get(`${BASE_URL}/api/health`);
        console.log(`   API Health check: ${healthResponse.status()}`);
        
        const loginResponse = await page.request.post(`${BASE_URL}/api/auth/login`, {
            data: {
                username: 'admin',
                password: 'Demo123!'
            },
            headers: {
                'Content-Type': 'application/json',
                'x-tenant-id': 'demo'
            }
        });
        console.log(`   API Login: ${loginResponse.status()}`);
        
        if (loginResponse.ok()) {
            const data = await loginResponse.json();
            console.log(`   ✅ API login successful - token received`);
        }
    } catch (error) {
        console.log(`   ❌ API error: ${error.message}`);
    }
    
    // Final verdict
    console.log('\n📊 REALITY CHECK:');
    console.log('==================');
    console.log('This is what ACTUALLY works, not what I claimed works!');
});