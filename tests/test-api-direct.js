const { test, expect } = require("@playwright/test");

const BASE_URL = "http://3.120.41.138:3000";

test("Test API Direct Call", async ({ page }) => {
    console.log("\n=== TESTING API DIRECT CALL ===");
    
    // Go to API test page
    await page.goto(`${BASE_URL}/test-api-direct.html`);
    
    // Listen for console messages
    page.on("console", msg => {
        console.log(`Browser console: ${msg.type()}: ${msg.text()}`);
    });
    
    // Click test button
    await page.click("button");
    
    // Wait for result
    await page.waitForTimeout(3000);
    
    // Get result
    const result = await page.locator("#result").textContent();
    console.log(`Result: ${result}`);
    
    // Check if the API call was successful
    if (result.includes("Status: 200")) {
        console.log("✓ API call successful\!");
    } else {
        console.log("✗ API call failed");
    }
});
