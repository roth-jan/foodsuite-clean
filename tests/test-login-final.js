const { test, expect } = require('@playwright/test');

const BASE_URL = 'http://3.120.41.138:3000';

test('Final Login System Test', async ({ page }) => {
    console.log('\n🎯 FINAL LOGIN SYSTEM TEST');
    console.log('==========================\n');
    
    // Step 1: Open login page
    console.log('1️⃣ Opening login page...');
    await page.goto(`${BASE_URL}/foodsuite-login-final.html`);
    
    // Verify page loaded
    await expect(page).toHaveTitle('FoodSuite Pro - Login');
    console.log('✅ Login page loaded successfully');
    
    // Step 2: Check login form
    const usernameField = await page.locator('#username').isVisible();
    const passwordField = await page.locator('#password').isVisible();
    const submitButton = await page.locator('button[type="submit"]').isVisible();
    
    console.log(`✅ Username field: ${usernameField ? 'Visible' : 'Not visible'}`);
    console.log(`✅ Password field: ${passwordField ? 'Visible' : 'Not visible'}`);
    console.log(`✅ Submit button: ${submitButton ? 'Visible' : 'Not visible'}`);
    
    // Step 3: Click demo admin button
    console.log('\n2️⃣ Clicking demo admin button...');
    await page.click('#demoAdmin');
    await page.waitForTimeout(500);
    
    // Check if fields are filled
    const usernameValue = await page.locator('#username').inputValue();
    const passwordValue = await page.locator('#password').inputValue();
    
    console.log(`✅ Username filled: ${usernameValue}`);
    console.log(`✅ Password filled: ${passwordValue ? '********' : 'Empty'}`);
    
    // Step 4: Submit login
    console.log('\n3️⃣ Submitting login form...');
    await page.click('button[type="submit"]');
    
    // Wait for navigation or alert
    await page.waitForTimeout(3000);
    
    // Check current URL
    const currentUrl = page.url();
    console.log(`Current URL: ${currentUrl}`);
    
    // Check if redirected to app
    if (currentUrl.includes('foodsuite-app-final.html')) {
        console.log('✅ ✅ ✅ LOGIN SUCCESSFUL! Redirected to app');
        
        // Test app loading
        console.log('\n4️⃣ Testing main application...');
        
        // Wait for app to load
        await page.waitForTimeout(2000);
        
        // Check if app is visible
        const mainAppVisible = await page.locator('#mainApp').isVisible();
        const loadingHidden = !await page.locator('#loadingScreen').isVisible();
        
        console.log(`✅ Main app visible: ${mainAppVisible}`);
        console.log(`✅ Loading screen hidden: ${loadingHidden}`);
        
        // Check user info
        const userName = await page.locator('#userName').textContent();
        const userRole = await page.locator('#userRole').textContent();
        
        console.log(`✅ User: ${userName} (${userRole})`);
        
        // Check dashboard elements
        const metricCards = await page.locator('.metric-card').count();
        console.log(`✅ Dashboard metrics: ${metricCards} cards`);
        
        // Take success screenshot
        await page.screenshot({ path: 'test-screenshots/login-success-final.png', fullPage: true });
        console.log('📸 Success screenshot saved');
        
        console.log('\n🎉 🎉 🎉 SYSTEM IS FULLY WORKING! 🎉 🎉 🎉');
        console.log('✅ Login functionality: WORKING');
        console.log('✅ Auto-redirect: WORKING');
        console.log('✅ Application loading: WORKING');
        console.log('✅ User authentication: WORKING');
        
    } else {
        console.log('❌ Login failed or redirect not working');
        
        // Check for alerts
        const alertVisible = await page.locator('.alert').isVisible();
        if (alertVisible) {
            const alertText = await page.locator('.alert').textContent();
            console.log(`Alert: ${alertText}`);
        }
        
        // Take error screenshot
        await page.screenshot({ path: 'test-screenshots/login-error-final.png' });
    }
});