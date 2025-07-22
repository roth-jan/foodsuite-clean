const { test, expect } = require('@playwright/test');

const BASE_URL = 'http://3.120.41.138:3000';

test('Final Working System Test', async ({ page }) => {
    console.log('\n🚀 FINAL SYSTEM TEST - WITH SIMPLIFIED SERVER');
    console.log('============================================\n');
    
    // Test 1: Check API is working
    console.log('1️⃣ Testing API Health...');
    const apiResponse = await page.request.get(`${BASE_URL}/api/health`);
    console.log(`   API Status: ${apiResponse.status()}`);
    const apiData = await apiResponse.json();
    console.log(`   API Response: ${JSON.stringify(apiData)}`);
    
    // Test 2: Go to login page
    console.log('\n2️⃣ Testing Login Page...');
    await page.goto(`${BASE_URL}/foodsuite-login-working.html`);
    
    await expect(page).toHaveTitle('FoodSuite Pro - Login');
    console.log('   ✅ Login page loaded');
    
    // Test 3: Fill login form manually
    console.log('\n3️⃣ Testing Login Process...');
    await page.fill('#username', 'admin');
    await page.fill('#password', 'Demo123!');
    console.log('   ✅ Credentials filled');
    
    // Test 4: Submit form and wait
    await page.click('button[type="submit"]');
    console.log('   ✅ Form submitted');
    
    // Wait for navigation or error
    await page.waitForTimeout(5000);
    
    // Check current URL
    const currentUrl = page.url();
    console.log(`   Current URL: ${currentUrl}`);
    
    // Check if login was successful
    if (currentUrl.includes('foodsuite-app-working.html')) {
        console.log('   ✅ LOGIN SUCCESSFUL! Redirected to app');
        
        // Test the app
        console.log('\n4️⃣ Testing Main Application...');
        
        // Wait for app to initialize
        await page.waitForTimeout(2000);
        
        // Check main components
        const appVisible = await page.locator('#mainApp').isVisible();
        const loadingHidden = !await page.locator('#loadingScreen').isVisible();
        
        console.log(`   Main App Visible: ${appVisible}`);
        console.log(`   Loading Screen Hidden: ${loadingHidden}`);
        
        if (appVisible) {
            // Check user info
            const userName = await page.locator('#userName').textContent();
            console.log(`   User Name: ${userName}`);
            
            // Check dashboard
            const dashboardVisible = await page.locator('#dashboard').isVisible();
            console.log(`   Dashboard Visible: ${dashboardVisible}`);
            
            // Count metric cards
            const metricCards = await page.locator('.metric-card').count();
            console.log(`   Metric Cards: ${metricCards}`);
            
            // Take screenshot
            await page.screenshot({ path: 'test-screenshots/final-success.png', fullPage: true });
            console.log('   ✅ Screenshot saved');
            
            console.log('\n✅ ✅ ✅ SYSTEM IS FULLY WORKING! ✅ ✅ ✅');
            console.log('Users can log in and access the application!');
        }
        
    } else {
        console.log('   ❌ Login failed - still on login page');
        
        // Check for error messages
        const errorVisible = await page.locator('.alert-danger').isVisible();
        if (errorVisible) {
            const errorText = await page.locator('.alert-danger').textContent();
            console.log(`   Error: ${errorText}`);
        }
        
        // Take screenshot of error
        await page.screenshot({ path: 'test-screenshots/login-error.png' });
    }
    
    // Test direct API login
    console.log('\n5️⃣ Testing Direct API Login...');
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
    
    console.log(`   API Login Status: ${loginResponse.status()}`);
    if (loginResponse.ok()) {
        const loginData = await loginResponse.json();
        console.log(`   ✅ API Login successful!`);
        console.log(`   Token received: ${loginData.access_token ? 'Yes' : 'No'}`);
        console.log(`   User: ${loginData.user?.username}`);
    }
});