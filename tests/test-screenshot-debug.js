const { test } = require('@playwright/test');
const path = require('path');

test('Debug Screenshot', async ({ page }) => {
    // Test with localhost
    console.log('Testing http://localhost:3000...');
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'test-screenshots/debug-localhost.png', fullPage: true });
    
    // Check what tabs are visible
    const tabs = await page.locator('.nav-link').allTextContents();
    console.log('Available tabs:', tabs);
    
    // Try to find meal planning tab with different selectors
    const selectors = [
        'a[data-tab="mealplanning"]',
        'a[href="#mealplanning"]',
        'a:has-text("KI-Speiseplanung")',
        '.nav-link:has-text("KI-Speiseplanung")'
    ];
    
    for (const selector of selectors) {
        const found = await page.locator(selector).count();
        console.log(`Selector "${selector}": ${found} elements found`);
    }
});