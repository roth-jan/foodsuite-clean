const { test, expect } = require('@playwright/test');

test('AI Assistant Features - Final Test', async ({ page }) => {
    console.log('🚀 Starting AI Assistant test...\n');
    
    // Navigate to localhost
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(2000);
    
    // Click on KI-Speiseplanung tab
    await page.click('.nav-link:has-text("KI-Speiseplanung")');
    await page.waitForTimeout(3000);
    
    console.log('✅ Navigated to KI-Speiseplanung tab');
    
    // Take screenshot of initial state
    await page.screenshot({ path: 'test-screenshots/ai-test-1-initial.png' });
    
    // Check for AI assistant panel
    const aiPanel = await page.locator('.ai-assistant-panel').isVisible();
    console.log(`🤖 AI Assistant Panel: ${aiPanel ? '✓' : '✗'}`);
    
    // Check for AI mode buttons
    const aiModes = await page.locator('.ai-button').count();
    console.log(`🎛️  AI Mode Buttons: ${aiModes} found`);
    
    // Check for optimize button
    const optimizeBtn = await page.locator('button:has-text("Plan optimieren")').isVisible();
    console.log(`🔧 Optimize Button: ${optimizeBtn ? '✓' : '✗'}`);
    
    // Wait for meal calendar to generate
    await page.waitForSelector('.meal-event', { timeout: 15000 });
    const mealCount = await page.locator('.meal-event').count();
    console.log(`📅 Generated Meals: ${mealCount}`);
    
    // Test AI mode switching
    console.log('\n🔄 Testing AI Mode Switching...');
    
    // Click on Variety mode
    await page.click('.ai-button:has-text("Abwechslung")');
    await page.waitForTimeout(2000);
    
    // Check status
    const aiStatus = await page.locator('#aiStatus').textContent();
    console.log(`📊 AI Status: ${aiStatus}`);
    expect(aiStatus).toContain('Abwechslung');
    
    await page.screenshot({ path: 'test-screenshots/ai-test-2-variety-mode.png' });
    
    // Test collapsible panels
    console.log('\n📋 Testing Collapsible Panels...');
    
    // Open cost panel
    await page.click('button:has-text("Kosten-Übersicht")');
    await page.waitForTimeout(1000);
    const costVisible = await page.locator('#costCollapse').isVisible();
    console.log(`💰 Cost Panel Opens: ${costVisible ? '✓' : '✗'}`);
    
    // Open nutrition panel
    await page.click('button:has-text("Nährwert-Balance")');
    await page.waitForTimeout(1000);
    const nutritionVisible = await page.locator('#nutritionCollapse').isVisible();
    console.log(`🥗 Nutrition Panel Opens: ${nutritionVisible ? '✓' : '✗'}`);
    
    await page.screenshot({ path: 'test-screenshots/ai-test-3-panels-open.png' });
    
    // Check layout changes
    console.log('\n📐 Checking Layout Updates...');
    const calendarCol = await page.locator('.col-lg-6:has(#mealCalendar)').isVisible();
    const recipeCol = await page.locator('.col-lg-6:has(.recipe-library)').isVisible();
    console.log(`📅 Calendar Column (col-lg-6): ${calendarCol ? '✓' : '✗'}`);
    console.log(`📚 Recipe Column (col-lg-6): ${recipeCol ? '✓' : '✗'}`);
    
    // Test optimize button
    console.log('\n🎯 Testing Optimize Button...');
    await page.click('button:has-text("Plan optimieren")');
    await page.waitForTimeout(2000);
    
    // Take final screenshot
    await page.screenshot({ path: 'test-screenshots/ai-test-4-final.png', fullPage: true });
    
    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('✅ AI ASSISTANT TEST SUMMARY:');
    console.log('='.repeat(50));
    console.log(`AI Panel Visible: ${aiPanel ? '✅' : '❌'}`);
    console.log(`AI Modes Available: ${aiModes > 0 ? '✅' : '❌'} (${aiModes} modes)`);
    console.log(`Optimize Button: ${optimizeBtn ? '✅' : '❌'}`);
    console.log(`Mode Switching Works: ${aiStatus.includes('Abwechslung') ? '✅' : '❌'}`);
    console.log(`Collapsible Panels: ${costVisible && nutritionVisible ? '✅' : '❌'}`);
    console.log(`Layout Updated: ${calendarCol && recipeCol ? '✅' : '❌'}`);
    console.log(`Meals Generated: ${mealCount > 0 ? '✅' : '❌'} (${mealCount} meals)`);
    console.log('='.repeat(50));
});