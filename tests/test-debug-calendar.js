const { test, expect } = require('@playwright/test');

test('Debug Calendar Structure', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.click('a[data-tab="meal-planning"]');
    await page.waitForTimeout(2000);
    
    // Debug info
    const calendarGrid = await page.locator('#mealCalendar').count();
    console.log('Calendar grid found:', calendarGrid > 0);
    
    const dayHeaders = await page.locator('.calendar-day-header').count();
    console.log('Day headers found:', dayHeaders);
    
    const calendarCells = await page.locator('.calendar-cell').count();
    console.log('Calendar cells found:', calendarCells);
    
    const mealSlots = await page.locator('.meal-slot').count();
    console.log('Meal slots found:', mealSlots);
    
    const dayColumns = await page.locator('.day-column').count();
    console.log('Day columns found:', dayColumns);
    
    const addMealButtons = await page.locator('.add-meal-btn').count();
    console.log('Add meal buttons found:', addMealButtons);
    
    // Check HTML structure
    const calendarHTML = await page.locator('#mealCalendar').innerHTML();
    console.log('\nCalendar HTML (first 500 chars):\n', calendarHTML.substring(0, 500));
    
    await page.screenshot({ path: 'test-results/debug-calendar.png', fullPage: true });
});