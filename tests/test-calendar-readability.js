const { test, expect } = require('@playwright/test');

test.describe('Meal Planning Calendar Readability', () => {
    test('should display readable meal plan calendar', async ({ page }) => {
        // Start server and navigate to the app
        await page.goto('http://localhost:3000');
        
        // Wait for page load
        await page.waitForLoadState('networkidle');
        
        // Click on the meal planning tab
        await page.click('a[data-tab="meal-planning"]');
        
        // Wait for the meal planning tab content to be visible
        await page.waitForSelector('#meal-planning', { state: 'visible' });
        
        // Wait for the calendar container to be visible
        await page.waitForSelector('.calendar-container', { state: 'visible' });
        
        // Wait for calendar generation to complete
        await page.waitForTimeout(5000);
        
        // Take screenshot of full meal planning view
        await page.screenshot({ 
            path: 'calendar-full-view.png',
            fullPage: true 
        });
        
        // Take screenshot of just the calendar
        const calendar = await page.locator('.calendar-container');
        await calendar.screenshot({ 
            path: 'calendar-only.png' 
        });
        
        // Check calendar structure - look inside the calendar container
        const calendarHTML = await page.locator('.calendar-container').innerHTML();
        console.log('Calendar container has content:', calendarHTML.length > 100);
        
        // Look for the actual calendar element ID
        const calendarIds = await page.evaluate(() => {
            const container = document.querySelector('.calendar-container');
            if (!container) return 'No container found';
            const elements = container.querySelectorAll('[id]');
            return Array.from(elements).map(el => el.id);
        });
        console.log('IDs found in calendar container:', calendarIds);
        
        // Check if mealCalendar div exists and look for table inside it
        const mealCalendarDiv = await page.locator('#mealCalendar');
        const mealCalendarExists = await mealCalendarDiv.count() > 0;
        console.log('mealCalendar div exists:', mealCalendarExists);
        
        if (mealCalendarExists) {
            const mealCalendarHTML = await mealCalendarDiv.innerHTML();
            console.log('mealCalendar content length:', mealCalendarHTML.length);
            console.log('mealCalendar contains table:', mealCalendarHTML.includes('<table'));
        }
        
        // Find tables in the mealCalendar div specifically
        const tables = await page.locator('#mealCalendar table');
        const tableCount = await tables.count();
        console.log('Number of tables in mealCalendar:', tableCount);
        
        // Check for day headers in mealCalendar
        const dayHeaders = await page.locator('#mealCalendar th').allTextContents();
        console.log('Day headers:', dayHeaders);
        
        // Check for meal cells in mealCalendar
        const mealCells = await page.locator('#mealCalendar td');
        const cellCount = await mealCells.count();
        console.log('Number of meal slots:', cellCount);
        
        // Check text readability in cells
        for (let i = 0; i < Math.min(5, cellCount); i++) {
            const cell = mealCells.nth(i);
            const isVisible = await cell.isVisible();
            
            if (isVisible) {
                const cellText = await cell.textContent();
                console.log(`Cell ${i} content:`, cellText);
                
                // Check if text is not empty
                if (cellText && cellText.trim()) {
                    // Check font size
                    const fontSize = await cell.evaluate(el => 
                        window.getComputedStyle(el).fontSize
                    );
                    console.log(`Cell ${i} font size:`, fontSize);
                    
                    // Check text color contrast
                    const color = await cell.evaluate(el => 
                        window.getComputedStyle(el).color
                    );
                    const bgColor = await cell.evaluate(el => 
                        window.getComputedStyle(el).backgroundColor
                    );
                    console.log(`Cell ${i} colors - text: ${color}, bg: ${bgColor}`);
                }
            }
        }
        
        // Check if cells have proper spacing (only if cells exist)
        if (cellCount > 0) {
            const firstCell = mealCells.first();
            const cellPadding = await firstCell.evaluate(el => 
                window.getComputedStyle(el).padding
            );
            console.log('Cell padding:', cellPadding);
        }
        
        // Check table dimensions if table exists
        if (tableCount > 0) {
            const firstTable = tables.first();
            const tableWidth = await firstTable.evaluate(el => el.offsetWidth);
            const tableHeight = await firstTable.evaluate(el => el.offsetHeight);
            console.log(`Calendar dimensions: ${tableWidth}x${tableHeight}px`);
        }
        
        // Check if calendar is scrollable
        const containerHeight = await page.evaluate(() => {
            const container = document.querySelector('.calendar-container');
            return container ? container.scrollHeight > container.clientHeight : false;
        });
        console.log('Calendar is scrollable:', containerHeight);
        
        // Take zoomed screenshot of any meal cell with content
        const mealWithContent = await page.locator('.calendar-container td').filter({ 
            hasText: /\w+/ 
        }).first();
        
        if (await mealWithContent.count() > 0) {
            await mealWithContent.screenshot({ 
                path: 'calendar-meal-detail.png' 
            });
        }
        
        // Check responsive behavior
        await page.setViewportSize({ width: 1200, height: 800 });
        await page.screenshot({ 
            path: 'calendar-desktop-view.png',
            fullPage: false 
        });
        
        await page.setViewportSize({ width: 768, height: 1024 });
        await page.screenshot({ 
            path: 'calendar-tablet-view.png',
            fullPage: false 
        });
        
        await page.setViewportSize({ width: 375, height: 667 });
        await page.screenshot({ 
            path: 'calendar-mobile-view.png',
            fullPage: false 
        });
    });
});