const { test, expect } = require('@playwright/test');

test('Drag & Drop Bug - Karte bleibt hängen', async ({ page }) => {
    console.log('\n🐛 TESTE DRAG & DROP BUG\n');
    
    // Navigiere zur App
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(1000);
    
    // Gehe zur Speiseplanung
    await page.click('a[href="#meal-planning"]');
    await page.waitForTimeout(2000);
    
    // Screenshot vor Drag & Drop
    await page.screenshot({ 
        path: 'test-screenshots/01-before-drag.png',
        fullPage: true 
    });
    
    console.log('1️⃣ Ausgangszustand erfasst');
    
    // Finde erstes Rezept
    const firstRecipe = page.locator('.recipe-item').first();
    const recipeName = await firstRecipe.textContent();
    console.log(`\n2️⃣ Teste Drag & Drop mit: ${recipeName.split('€')[0].trim()}`);
    
    // Finde Ziel-Slot
    const targetSlot = page.locator('.meal-slot[data-day="monday"][data-meal="lunch"]');
    
    // Simuliere Drag Start
    await firstRecipe.hover();
    await page.mouse.down();
    await page.waitForTimeout(100);
    
    // Screenshot während des Drags
    await page.screenshot({ 
        path: 'test-screenshots/02-during-drag.png',
        fullPage: true 
    });
    console.log('3️⃣ Screenshot während Drag erstellt');
    
    // Bewege zum Ziel
    await targetSlot.hover();
    await page.waitForTimeout(100);
    
    // Drop
    await page.mouse.up();
    await page.waitForTimeout(500);
    
    // Screenshot nach Drop
    await page.screenshot({ 
        path: 'test-screenshots/03-after-drop.png',
        fullPage: true 
    });
    console.log('4️⃣ Screenshot nach Drop erstellt');
    
    // Prüfe ob Rezept noch in der Liste sichtbar ist
    const recipeStillVisible = await firstRecipe.isVisible();
    console.log(`\n5️⃣ Rezept in Liste noch sichtbar: ${recipeStillVisible ? 'JA ❌' : 'NEIN ✅'}`);
    
    // Prüfe ob Rezept im Kalender ist
    const mealInSlot = await targetSlot.locator('.meal-event').count() > 0;
    console.log(`6️⃣ Rezept im Kalender: ${mealInSlot ? 'JA ✅' : 'NEIN ❌'}`);
    
    // Teste erneutes Drag & Drop vom selben Rezept
    console.log('\n7️⃣ Teste erneutes Drag & Drop...');
    
    const secondSlot = page.locator('.meal-slot[data-day="tuesday"][data-meal="lunch"]');
    
    await firstRecipe.hover();
    await page.mouse.down();
    await page.waitForTimeout(100);
    await secondSlot.hover();
    await page.mouse.up();
    await page.waitForTimeout(500);
    
    // Finale Analyse
    await page.screenshot({ 
        path: 'test-screenshots/04-second-drop.png',
        fullPage: true 
    });
    
    // Prüfe CSS Klassen
    const recipeClasses = await firstRecipe.getAttribute('class');
    console.log(`\n8️⃣ CSS Klassen am Rezept: ${recipeClasses}`);
    
    // Prüfe ob dragging Klasse noch aktiv ist
    const hasDraggingClass = recipeClasses.includes('dragging');
    console.log(`9️⃣ 'dragging' Klasse noch aktiv: ${hasDraggingClass ? 'JA ❌ (BUG!)' : 'NEIN ✅'}`);
    
    // Prüfe opacity
    const opacity = await firstRecipe.evaluate(el => window.getComputedStyle(el).opacity);
    console.log(`🔟 Opacity des Rezepts: ${opacity} ${opacity < 1 ? '❌ (sollte 1 sein!)' : '✅'}`);
    
    // ZUSAMMENFASSUNG
    console.log('\n' + '='.repeat(50));
    console.log('BUG ANALYSE:');
    console.log('='.repeat(50));
    
    if (hasDraggingClass || opacity < 1) {
        console.log('❌ BUG BESTÄTIGT: Karte bleibt im "dragging" Zustand');
        console.log('   - dragging Klasse wird nicht entfernt');
        console.log('   - Opacity bleibt reduziert');
    } else if (recipeStillVisible && mealInSlot) {
        console.log('⚠️  MÖGLICHER BUG: Rezept ist sowohl in Liste als auch im Kalender');
    } else {
        console.log('✅ Kein offensichtlicher Bug gefunden');
    }
    
    console.log('\nScreenshots gespeichert in test-screenshots/');
    console.log('='.repeat(50));
});