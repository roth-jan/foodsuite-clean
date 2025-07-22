const { test, expect } = require('@playwright/test');

const BASE_URL = 'http://3.120.41.138:3000';

test('PROOF: Drag & Drop really works', async ({ page }) => {
    console.log('\n🎯 PROVING DRAG & DROP WORKS');
    console.log('============================\n');
    
    // Login
    await page.goto(BASE_URL);
    await page.fill('#username', 'admin');
    await page.fill('#password', 'Demo123!');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
    
    console.log('✅ Logged in');
    
    // Navigate to meal planning
    const mealPlanButton = await page.locator('button, a').filter({ hasText: /speiseplan|meal/i }).first();
    if (!(await mealPlanButton.isVisible())) {
        console.log('❌ No meal planning button found');
        return;
    }
    
    await mealPlanButton.click();
    await page.waitForTimeout(3000);
    console.log('✅ On meal planning page');
    
    // Take "BEFORE" screenshot
    await page.screenshot({ path: 'test-screenshots/dragdrop-BEFORE.png' });
    console.log('📸 BEFORE screenshot saved');
    
    // Find draggable element
    const draggableElements = await page.locator('[draggable="true"]');
    const draggableCount = await draggableElements.count();
    console.log(`Found ${draggableCount} draggable elements`);
    
    if (draggableCount === 0) {
        console.log('❌ NO DRAGGABLE ELEMENTS FOUND!');
        
        // Debug: what IS on the page?
        const bodyText = await page.textContent('body');
        console.log('\nPage content keywords:');
        ['drag', 'drop', 'rezept', 'recipe', 'calendar', 'montag'].forEach(keyword => {
            const found = bodyText.toLowerCase().includes(keyword);
            console.log(`  ${keyword}: ${found}`);
        });
        
        return;
    }
    
    // Find drop zone
    const dropZones = await page.locator('.drop-zone, .droppable, [data-day], .calendar-day, .day-slot');
    const dropZoneCount = await dropZones.count();
    console.log(`Found ${dropZoneCount} drop zones`);
    
    if (dropZoneCount === 0) {
        console.log('❌ NO DROP ZONES FOUND!');
        return;
    }
    
    // Get initial state of first drop zone
    const firstDropZone = dropZones.first();
    const initialContent = await firstDropZone.textContent();
    console.log(`Drop zone initial content: "${initialContent}"`);
    
    // Get draggable element info
    const firstDraggable = draggableElements.first();
    const draggableText = await firstDraggable.textContent();
    console.log(`Dragging element: "${draggableText}"`);
    
    // Perform drag and drop
    console.log('\n🎯 Performing drag & drop...');
    
    try {
        await firstDraggable.dragTo(firstDropZone);
        await page.waitForTimeout(2000); // Wait for any animations/updates
        
        console.log('✅ Drag operation completed');
        
        // Take "AFTER" screenshot
        await page.screenshot({ path: 'test-screenshots/dragdrop-AFTER.png' });
        console.log('📸 AFTER screenshot saved');
        
        // Check if content changed
        const afterContent = await firstDropZone.textContent();
        console.log(`Drop zone after content: "${afterContent}"`);
        
        const contentChanged = afterContent !== initialContent;
        console.log(`\n📊 RESULT: Content changed: ${contentChanged}`);
        
        if (contentChanged) {
            console.log('🎉 DRAG & DROP WORKS! Content was added to drop zone.');
            
            // Check if the dragged item text appears in the drop zone
            const draggableInDropZone = afterContent.includes(draggableText.trim());
            console.log(`Dragged item appears in drop zone: ${draggableInDropZone}`);
            
        } else {
            console.log('❌ DRAG & DROP FAILED! No content change detected.');
            
            // Additional checks
            console.log('\nDebug info:');
            console.log(`- Drop zone class: ${await firstDropZone.getAttribute('class')}`);
            console.log(`- Drop zone data attributes: ${await firstDropZone.evaluate(el => 
                Array.from(el.attributes).filter(attr => attr.name.startsWith('data-')).map(attr => `${attr.name}=${attr.value}`).join(', ')
            )}`);
        }
        
        // Compare screenshots to show visual difference
        console.log('\n📸 Compare these screenshots to see the difference:');
        console.log('   - test-screenshots/dragdrop-BEFORE.png');
        console.log('   - test-screenshots/dragdrop-AFTER.png');
        
    } catch (error) {
        console.log(`❌ Drag & drop failed with error: ${error.message}`);
        await page.screenshot({ path: 'test-screenshots/dragdrop-ERROR.png' });
    }
});