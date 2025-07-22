const { test, expect } = require('@playwright/test');

const BASE_URL = 'http://3.120.41.138:3000';

test('Debug Login Redirect Issue', async ({ page }) => {
    // Enable console logging
    page.on('console', msg => {
        if (msg.type() === 'error') {
            console.log('❌ Console Error:', msg.text());
        }
    });
    
    page.on('response', response => {
        if (response.url().includes('/api/auth/login')) {
            console.log('Login API Response:', response.status(), response.url());
        }
    });
    
    console.log('\n🔍 DEBUGGING LOGIN REDIRECT');
    console.log('===========================\n');
    
    // Go to login page
    await page.goto(BASE_URL);
    console.log('1️⃣ On login page');
    
    // Fill login form
    await page.fill('#username', 'admin');
    await page.fill('#password', 'Demo123!');
    console.log('2️⃣ Filled login form');
    
    // Click login and wait for response
    await Promise.all([
        page.waitForResponse(response => response.url().includes('/api/auth/login')),
        page.click('button[type="submit"]')
    ]);
    
    console.log('3️⃣ Login request sent');
    
    // Wait a bit
    await page.waitForTimeout(3000);
    
    // Check current URL
    const currentUrl = page.url();
    console.log(`4️⃣ Current URL: ${currentUrl}`);
    
    // Check localStorage
    const hasToken = await page.evaluate(() => {
        const token = localStorage.getItem('access_token');
        const user = localStorage.getItem('user');
        return {
            hasToken: !!token,
            hasUser: !!user,
            tokenLength: token ? token.length : 0
        };
    });
    
    console.log('5️⃣ LocalStorage check:', hasToken);
    
    // Check for any alerts
    const alertText = await page.locator('.alert').textContent().catch(() => null);
    if (alertText) {
        console.log(`6️⃣ Alert message: ${alertText}`);
    }
    
    // Try manual navigation
    if (hasToken.hasToken) {
        console.log('7️⃣ Token found, manually navigating to integrated app...');
        await page.goto(BASE_URL + '/foodsuite-integrated.html');
        await page.waitForLoadState('networkidle');
        
        const afterNavUrl = page.url();
        console.log(`8️⃣ After manual navigation: ${afterNavUrl}`);
        
        // Check if we stayed on integrated page or got redirected
        const stayedOnIntegrated = afterNavUrl.includes('integrated');
        console.log(`9️⃣ Stayed on integrated page: ${stayedOnIntegrated}`);
    }
    
    await page.screenshot({ path: 'test-screenshots/debug-login-final.png' });
});