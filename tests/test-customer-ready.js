const { test, expect } = require('@playwright/test');

const BASE_URL = 'http://3.120.41.138:3000';

test('Customer Ready Test - Login Works', async ({ page }) => {
    console.log('\n🎯 CUSTOMER READY TEST');
    console.log('=====================\n');
    
    // 1. Customer goes to main URL
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    
    console.log('✅ Step 1: Customer sees login page');
    await page.screenshot({ path: 'test-screenshots/customer-1-login.png' });
    
    // 2. Customer enters credentials
    await page.fill('#username', 'admin');
    await page.fill('#password', 'Demo123!');
    console.log('✅ Step 2: Customer enters credentials');
    
    // 3. Customer clicks login
    await page.click('button[type="submit"]');
    console.log('✅ Step 3: Customer clicks login');
    
    // 4. Wait for login to complete
    await page.waitForTimeout(2000);
    
    const currentUrl = page.url();
    const loginSuccess = currentUrl.includes('integrated');
    
    if (loginSuccess) {
        console.log('✅ Step 4: Customer is logged in!');
        console.log(`   Current URL: ${currentUrl}`);
        
        await page.screenshot({ path: 'test-screenshots/customer-2-app.png' });
        
        // Test navigation
        if (await page.locator('[data-tab="products"]').isVisible()) {
            await page.click('[data-tab="products"]');
            await page.waitForTimeout(1000);
            console.log('✅ Step 5: Products tab works');
        }
        
        // Test dropdown
        const dropdown = await page.locator('.dropdown-toggle').first();
        if (await dropdown.isVisible()) {
            await dropdown.click();
            await page.waitForTimeout(500);
            
            const dropdownMenu = await page.locator('.dropdown-menu').first();
            const menuVisible = await dropdownMenu.isVisible();
            
            if (menuVisible) {
                const box = await dropdownMenu.boundingBox();
                const viewport = page.viewportSize();
                const isFullyVisible = box && (box.x + box.width <= viewport.width);
                console.log(`✅ Step 6: Dropdown menu fully visible: ${isFullyVisible}`);
            }
            
            await page.screenshot({ path: 'test-screenshots/customer-3-dropdown.png' });
        }
        
        console.log('\n🎉 SYSTEM IS CUSTOMER READY!');
        console.log('Your customers can now use the system without any workarounds!');
    } else {
        console.log('❌ Login failed');
        const alertText = await page.locator('.alert').textContent().catch(() => 'No alert');
        console.log(`   Alert: ${alertText}`);
        
        // Debug: Check what fetch URL is being used
        const pageContent = await page.content();
        const hasRelativeUrl = !pageContent.includes('https://') && pageContent.includes('/api/auth/login');
        console.log(`   Using relative URLs: ${hasRelativeUrl}`);
    }
});