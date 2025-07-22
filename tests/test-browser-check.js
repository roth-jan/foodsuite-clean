const { test } = require('@playwright/test');

const BASE_URL = 'http://3.120.41.138:3000';

test('Browser Check - Open in headed mode', async ({ browser }) => {
    // Launch browser in headed mode
    const context = await browser.newContext({
        headless: false,
        viewport: { width: 1280, height: 720 }
    });
    
    const page = await context.newPage();
    
    console.log('\n🌐 OPENING BROWSER FOR MANUAL CHECK');
    console.log('====================================');
    console.log(`Opening: ${BASE_URL}`);
    console.log('\nPlease test manually:');
    console.log('1. Check if login page loads');
    console.log('2. Try logging in with admin/Demo123!');
    console.log('3. Check if it redirects to the app');
    console.log('4. Check if dropdown menu works');
    console.log('5. Check if data loads\n');
    
    await page.goto(BASE_URL);
    
    // Keep browser open for manual testing
    await page.waitForTimeout(60000); // 60 seconds
    
    await context.close();
});