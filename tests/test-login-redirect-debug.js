const { test, expect } = require('@playwright/test');

const BASE_URL = 'http://3.120.41.138:3000';

test('Debug Login Redirect', async ({ page }) => {
    console.log('\n🔍 DEBUGGING LOGIN REDIRECT');
    console.log('============================\n');
    
    // Listen to console and network
    page.on('console', msg => {
        if (msg.type() === 'error') {
            console.log(`❌ Console Error: ${msg.text()}`);
        }
    });
    
    page.on('response', response => {
        if (response.url().includes('/api/auth/login')) {
            console.log(`📡 Login API: ${response.status()} ${response.url()}`);
        }
    });
    
    // Go to login
    await page.goto(BASE_URL);
    console.log(`1️⃣ Initial URL: ${page.url()}`);
    console.log(`   Title: ${await page.title()}`);
    
    // Fill and submit login
    await page.fill('#username', 'admin');
    await page.fill('#password', 'Demo123!');
    
    console.log('2️⃣ Submitting login...');
    
    // Click submit and wait for navigation
    await Promise.all([
        page.waitForLoadState('networkidle'),
        page.click('button[type="submit"]')
    ]);
    
    await page.waitForTimeout(3000);
    
    const afterLoginUrl = page.url();
    const afterLoginTitle = await page.title();
    
    console.log(`3️⃣ After login:`);
    console.log(`   URL: ${afterLoginUrl}`);
    console.log(`   Title: ${afterLoginTitle}`);
    
    // Check if redirect happened
    const redirectedToApp = afterLoginUrl.includes('foodsuite-complete-app.html');
    console.log(`   Redirected to app: ${redirectedToApp}`);
    
    if (!redirectedToApp) {
        console.log('\n❌ LOGIN REDIRECT FAILED!');
        
        // Check for alerts/errors
        const alerts = await page.locator('.alert').allTextContents();
        if (alerts.length > 0) {
            console.log(`   Alerts: ${alerts.join(', ')}`);
        }
        
        // Check localStorage
        const storage = await page.evaluate(() => ({
            token: localStorage.getItem('access_token'),
            user: localStorage.getItem('user')
        }));
        
        console.log(`   Token stored: ${!!storage.token}`);
        console.log(`   User stored: ${!!storage.user}`);
        
        if (storage.token) {
            console.log('   ✅ Token exists but redirect failed!');
            
            // Try manual redirect
            console.log('4️⃣ Trying manual redirect...');
            await page.goto(BASE_URL + '/foodsuite-complete-app.html');
            
            const manualUrl = page.url();
            const manualTitle = await page.title();
            console.log(`   Manual URL: ${manualUrl}`);
            console.log(`   Manual Title: ${manualTitle}`);
            
            // Check if the app loaded
            const hasProducts = await page.locator('text=/produkt/i').count() > 0;
            const hasRecipes = await page.locator('text=/rezept/i').count() > 0;
            console.log(`   Has products section: ${hasProducts}`);
            console.log(`   Has recipes section: ${hasRecipes}`);
        }
    } else {
        console.log('\n✅ LOGIN REDIRECT WORKED!');
        
        // Check if app features are there
        const hasProducts = await page.locator('text=/produkt/i').count() > 0;
        const hasRecipes = await page.locator('text=/rezept/i').count() > 0;
        const hasDragDrop = await page.locator('[draggable="true"]').count() > 0;
        
        console.log(`   Has products: ${hasProducts}`);
        console.log(`   Has recipes: ${hasRecipes}`);
        console.log(`   Has drag&drop: ${hasDragDrop}`);
    }
    
    await page.screenshot({ path: 'test-screenshots/login-debug-final.png' });
});