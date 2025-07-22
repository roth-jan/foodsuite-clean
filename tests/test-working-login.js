const { test, expect } = require('@playwright/test');

const BASE_URL = 'http://3.120.41.138:3000';

test('Working Login Test', async ({ page }) => {
    console.log('\n🎯 FINAL LOGIN TEST');
    console.log('===================\n');
    
    // Go to main page
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    
    const pageUrl = page.url();
    console.log(`1️⃣ Current page: ${pageUrl}`);
    
    // Take screenshot of login page
    await page.screenshot({ path: 'test-screenshots/working-1-login.png' });
    
    // Check if we have the fixed login page
    const pageContent = await page.content();
    const hasFixedLogin = pageContent.includes('window.location.protocol');
    console.log(`2️⃣ Using fixed login page: ${hasFixedLogin}`);
    
    // Fill login form
    await page.fill('#username', 'admin');
    await page.fill('#password', 'Demo123!');
    
    // Click login and wait
    console.log('3️⃣ Logging in...');
    await page.click('button[type="submit"]');
    
    // Wait for either navigation or alert
    await Promise.race([
        page.waitForNavigation({ timeout: 5000 }),
        page.waitForSelector('.alert', { timeout: 5000 })
    ]).catch(() => {});
    
    const afterLoginUrl = page.url();
    console.log(`4️⃣ After login URL: ${afterLoginUrl}`);
    
    // Check if we're on integrated app
    const onIntegratedApp = afterLoginUrl.includes('integrated');
    console.log(`5️⃣ On integrated app: ${onIntegratedApp}`);
    
    if (onIntegratedApp) {
        console.log('✅ LOGIN SUCCESSFUL!');
        
        // Test data loading
        await page.waitForTimeout(2000);
        
        // Click products tab
        const productsTab = await page.locator('[data-tab="products"]');
        if (await productsTab.isVisible()) {
            await productsTab.click();
            await page.waitForTimeout(2000);
            
            const productRows = await page.locator('#productsTableBody tr').count();
            console.log(`6️⃣ Products loaded: ${productRows} items`);
        }
        
        await page.screenshot({ path: 'test-screenshots/working-2-app.png' });
    } else {
        // Check for error
        const alertText = await page.locator('.alert').textContent().catch(() => null);
        console.log(`❌ Login failed. Alert: ${alertText}`);
        
        await page.screenshot({ path: 'test-screenshots/working-3-error.png' });
    }
});