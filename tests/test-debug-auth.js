const { test, expect } = require('@playwright/test');

const BASE_URL = 'http://3.120.41.138:3000';

test('Debug Authentication', async ({ page }) => {
    console.log('\n=== DEBUG AUTHENTICATION ===');
    
    // Listen for console messages
    page.on('console', msg => {
        console.log(`Browser console: ${msg.type()}: ${msg.text()}`);
    });
    
    // Listen for page errors
    page.on('pageerror', exception => {
        console.log(`Page error: ${exception.message}`);
    });
    
    // Go to login page
    await page.goto(`${BASE_URL}/foodsuite-login.html`);
    
    // Wait for page to load
    await page.waitForTimeout(2000);
    
    // Check if auth-manager.js is loaded
    const authManagerExists = await page.evaluate(() => {
        return typeof window.authManager !== 'undefined';
    });
    
    console.log(`AuthManager loaded: ${authManagerExists}`);
    
    // Fill and submit login form
    await page.fill('#username', 'admin');
    await page.fill('#password', 'Demo123!');
    
    console.log('Attempting login...');
    await page.click('button[type="submit"]');
    
    // Wait and check for changes
    await page.waitForTimeout(5000);
    
    const currentUrl = page.url();
    console.log(`Current URL: ${currentUrl}`);
    
    // Check for any error messages
    const errorMessage = await page.locator('.alert-danger').isVisible();
    console.log(`Error message visible: ${errorMessage}`);
    
    if (errorMessage) {
        const errorText = await page.locator('.alert-danger').textContent();
        console.log(`Error text: ${errorText}`);
    }
    
    // Check network tab for failed requests
    const responsePromise = page.waitForResponse('**/api/auth/login');
    
    try {
        const response = await responsePromise;
        console.log(`Login API response: ${response.status()}`);
        
        if (response.status() !== 200) {
            const responseText = await response.text();
            console.log(`Response text: ${responseText}`);
        }
    } catch (error) {
        console.log(`Login API error: ${error.message}`);
    }
});