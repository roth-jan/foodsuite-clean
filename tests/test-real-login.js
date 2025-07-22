const { test, expect } = require('@playwright/test');

const BASE_URL = 'http://3.120.41.138:3000';

test('Real Login Test - Fix the actual problem', async ({ page }) => {
    console.log('\n🔧 FIXING THE REAL PROBLEM');
    console.log('=========================\n');
    
    // First, test the API directly
    console.log('1️⃣ Testing API directly...');
    const apiResponse = await page.request.post(`${BASE_URL}/api/auth/login`, {
        data: {
            username: 'admin',
            password: 'Demo123!'
        },
        headers: {
            'Content-Type': 'application/json',
            'x-tenant-id': 'demo'
        }
    });
    
    console.log(`   API Status: ${apiResponse.status()}`);
    if (apiResponse.ok()) {
        const data = await apiResponse.json();
        console.log(`   ✅ API works! Got token: ${data.access_token.substring(0, 50)}...`);
    }
    
    // Now test the actual login page
    console.log('\n2️⃣ Testing login page...');
    await page.goto(BASE_URL);
    
    // Check what page we're actually on
    const pageUrl = page.url();
    const pageTitle = await page.title();
    console.log(`   Current URL: ${pageUrl}`);
    console.log(`   Page title: ${pageTitle}`);
    
    // Look for login form
    const hasLoginForm = await page.locator('#loginForm').count() > 0;
    const hasUsername = await page.locator('#username').count() > 0;
    console.log(`   Has login form: ${hasLoginForm}`);
    console.log(`   Has username field: ${hasUsername}`);
    
    if (!hasLoginForm) {
        console.log('\n❌ No login form found! Checking what IS on the page...');
        const bodyText = await page.locator('body').innerText();
        console.log(`   Page content (first 200 chars): ${bodyText.substring(0, 200)}...`);
        
        // Take screenshot to see what's there
        await page.screenshot({ path: 'test-screenshots/real-page-content.png' });
        return;
    }
    
    // Try to fill and submit form
    console.log('\n3️⃣ Attempting login...');
    await page.fill('#username', 'admin');
    await page.fill('#password', 'Demo123!');
    
    // Listen for network requests
    page.on('request', request => {
        if (request.url().includes('/api/auth/login')) {
            console.log(`   📤 Login request to: ${request.url()}`);
        }
    });
    
    page.on('response', response => {
        if (response.url().includes('/api/auth/login')) {
            console.log(`   📥 Login response: ${response.status()} from ${response.url()}`);
        }
    });
    
    // Click login
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
    
    // Check result
    const afterLoginUrl = page.url();
    console.log(`\n4️⃣ After login URL: ${afterLoginUrl}`);
    
    // Check for errors
    const alerts = await page.locator('.alert').allTextContents();
    if (alerts.length > 0) {
        console.log(`   Alert messages: ${alerts.join(', ')}`);
    }
    
    // Check localStorage
    const storage = await page.evaluate(() => {
        return {
            token: localStorage.getItem('access_token'),
            user: localStorage.getItem('user')
        };
    });
    
    console.log(`   Token in storage: ${storage.token ? 'Yes' : 'No'}`);
    console.log(`   User in storage: ${storage.user ? 'Yes' : 'No'}`);
    
    await page.screenshot({ path: 'test-screenshots/real-after-login.png' });
});