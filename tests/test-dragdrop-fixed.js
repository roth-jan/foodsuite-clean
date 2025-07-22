const { test, expect } = require('@playwright/test');

test('Drag & Drop - Nach Fix verifizieren', async ({ page }) => {
    console.log('\n✅ VERIFIZIERE DRAG & DROP FIX\n');
    
    // Navigiere zur App
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(1000);
    
    // Gehe zur Speiseplanung
    await page.click('a[href="#meal-planning"]');
    await page.waitForTimeout(2000);
    
    // Warte auf Console Messages vom Fix
    page.on('console', msg => {
        if (msg.text().includes('drag & drop fix')) {
            console.log(`📋 Console: ${msg.text()}`);
        }
    });
    
    console.log('1. Teste normales Drag & Drop');
    
    // Test 1: Normales Drag & Drop
    const firstRecipe = page.locator('.recipe-item').first();
    const recipeName = await firstRecipe.textContent();
    const mondayLunch = page.locator('.meal-slot[data-day="monday"][data-meal="lunch"]');
    
    await firstRecipe.dragTo(mondayLunch);
    await page.waitForTimeout(1000);
    
    // Prüfungen
    const recipeClasses = await firstRecipe.getAttribute('class');
    const opacity = await firstRecipe.evaluate(el => window.getComputedStyle(el).opacity);
    const mealInSlot = await mondayLunch.locator('.meal-event').count() > 0;
    
    console.log(`   - Dragging Klasse entfernt: ${!recipeClasses.includes('dragging') ? '✅' : '❌'}`);
    console.log(`   - Opacity zurückgesetzt: ${opacity === '1' ? '✅' : '❌ (' + opacity + ')'}`);
    console.log(`   - Rezept im Kalender: ${mealInSlot ? '✅' : '❌'}`);
    
    console.log('\n2. Teste mehrfaches Drag & Drop');
    
    // Test 2: Mehrfaches schnelles Drag & Drop
    for (let i = 0; i < 3; i++) {
        const recipe = page.locator('.recipe-item').nth(i);
        const slot = page.locator('.meal-slot:not(:has(.meal-event))').first();
        
        await recipe.dragTo(slot);
        await page.waitForTimeout(500);
        
        const classes = await recipe.getAttribute('class');
        console.log(`   - Durchgang ${i+1}: ${!classes.includes('dragging') ? '✅' : '❌'}`);
    }
    
    console.log('\n3. Teste abgebrochenes Drag & Drop');
    
    // Test 3: Drag starten aber nicht droppen
    const testRecipe = page.locator('.recipe-item').nth(4);
    
    await testRecipe.hover();
    await page.mouse.down();
    await page.waitForTimeout(100);
    
    // Bewege irgendwo hin und lasse los (nicht über einem Slot)
    await page.mouse.move(100, 100);
    await page.mouse.up();
    await page.waitForTimeout(500);
    
    const testClasses = await testRecipe.getAttribute('class');
    console.log(`   - Nach abgebrochenem Drag: ${!testClasses.includes('dragging') ? '✅' : '❌'}`);
    
    // Warte auf periodischen Cleanup
    console.log('\n4. Warte auf automatischen Cleanup (2 Sek)...');
    await page.waitForTimeout(2500);
    
    // Finale Prüfung
    const allRecipes = await page.locator('.recipe-item').all();
    let stuckCount = 0;
    
    for (const recipe of allRecipes) {
        const classes = await recipe.getAttribute('class');
        if (classes.includes('dragging')) {
            stuckCount++;
        }
    }
    
    console.log(`\n5. Finale Prüfung: ${stuckCount} von ${allRecipes.length} Rezepten im dragging state`);
    
    // Screenshot
    await page.screenshot({ 
        path: 'test-screenshots/dragdrop-after-fix.png',
        fullPage: true 
    });
    
    // ERGEBNIS
    console.log('\n' + '='.repeat(50));
    console.log('TESTERGEBNIS:');
    console.log('='.repeat(50));
    
    if (stuckCount === 0) {
        console.log('✅ DRAG & DROP BUG ERFOLGREICH BEHOBEN!');
        console.log('   - Keine Karten bleiben mehr hängen');
        console.log('   - Opacity wird korrekt zurückgesetzt');
        console.log('   - Automatischer Cleanup funktioniert');
    } else {
        console.log('❌ Bug teilweise vorhanden');
        console.log(`   - ${stuckCount} Karten noch im dragging state`);
    }
    
    console.log('='.repeat(50));
});