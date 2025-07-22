const { test, expect } = require('@playwright/test');

test('KI-Speiseplanung - Funktioniert sie wirklich?', async ({ page }) => {
    console.log('\n🤖 TESTE KI-SPEISEPLANUNG FUNKTIONALITÄT\n');
    
    // Navigiere zur App
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(1000);
    
    // Gehe zur Speiseplanung
    await page.click('a[href="#meal-planning"]');
    await page.waitForTimeout(2000);
    
    // Suche nach KI-Buttons
    console.log('1️⃣ Suche KI-Funktionen...');
    
    // Sammle alle Buttons
    const buttons = await page.locator('button').all();
    let kiButtons = [];
    
    for (const button of buttons) {
        const text = await button.textContent();
        if (text && (text.includes('KI') || text.includes('AI') || text.includes('Generate') || text.includes('Plan'))) {
            kiButtons.push({ button, text: text.trim() });
        }
    }
    
    console.log(`   Gefundene KI-Buttons: ${kiButtons.length}`);
    kiButtons.forEach(kb => console.log(`   - "${kb.text}"`));
    
    if (kiButtons.length === 0) {
        console.log('\n❌ KEINE KI-BUTTONS GEFUNDEN!');
        return;
    }
    
    // Teste den ersten KI-Button
    console.log('\n2️⃣ Teste KI-Generierung...');
    
    // Leere erst den Kalender
    const filledSlotsBefore = await page.locator('.meal-slot .meal-event').count();
    console.log(`   Slots vor KI: ${filledSlotsBefore} gefüllt`);
    
    // Screenshot vorher
    await page.screenshot({ 
        path: 'test-screenshots/ai-before.png',
        fullPage: true 
    });
    
    // Klicke KI-Button
    const aiButton = kiButtons[0].button;
    console.log(`\n3️⃣ Klicke auf "${kiButtons[0].text}"`);
    await aiButton.click();
    await page.waitForTimeout(3000);
    
    // Prüfe Ergebnis
    const filledSlotsAfter = await page.locator('.meal-slot .meal-event').count();
    console.log(`   Slots nach KI: ${filledSlotsAfter} gefüllt`);
    
    // Screenshot nachher
    await page.screenshot({ 
        path: 'test-screenshots/ai-after.png',
        fullPage: true 
    });
    
    // Analysiere die generierten Mahlzeiten
    console.log('\n4️⃣ Analysiere generierte Mahlzeiten:');
    
    const meals = await page.locator('.meal-slot .meal-event').all();
    const mealData = [];
    
    for (let i = 0; i < Math.min(5, meals.length); i++) {
        const mealText = await meals[i].textContent();
        mealData.push(mealText.trim());
        console.log(`   ${i+1}. ${mealText.trim()}`);
    }
    
    if (meals.length > 5) {
        console.log(`   ... und ${meals.length - 5} weitere`);
    }
    
    // Teste verschiedene Modi (falls vorhanden)
    console.log('\n5️⃣ Suche nach KI-Modi...');
    
    const selects = await page.locator('select').all();
    let aiModeSelect = null;
    
    for (const select of selects) {
        const options = await select.locator('option').all();
        for (const option of options) {
            const text = await option.textContent();
            if (text && (text.includes('Kosten') || text.includes('optimiert') || text.includes('Nutrition'))) {
                aiModeSelect = select;
                break;
            }
        }
    }
    
    if (aiModeSelect) {
        console.log('   ✓ KI-Modi-Auswahl gefunden');
        
        // Hole alle Optionen
        const options = await aiModeSelect.locator('option').all();
        console.log('   Verfügbare Modi:');
        
        for (const option of options) {
            const value = await option.getAttribute('value');
            const text = await option.textContent();
            console.log(`     - ${text} (${value})`);
        }
    } else {
        console.log('   ✗ Keine KI-Modi-Auswahl gefunden');
    }
    
    // ANALYSE
    console.log('\n' + '='.repeat(60));
    console.log('🔍 ANALYSE DER KI-FUNKTIONALITÄT:');
    console.log('='.repeat(60));
    
    const aiWorks = filledSlotsAfter > filledSlotsBefore;
    
    if (aiWorks) {
        console.log('✅ KI FUNKTIONIERT!');
        console.log(`   - ${filledSlotsAfter - filledSlotsBefore} neue Mahlzeiten generiert`);
        console.log(`   - Kalender wurde automatisch gefüllt`);
        
        // Prüfe ob die Auswahl sinnvoll ist
        const uniqueMeals = new Set(mealData);
        if (uniqueMeals.size > 1) {
            console.log(`   - ${uniqueMeals.size} verschiedene Rezepte verwendet`);
            console.log('   - Abwechslung ist vorhanden');
        } else {
            console.log('   - ⚠️  Wenig Abwechslung in der Auswahl');
        }
    } else {
        console.log('❌ KI FUNKTIONIERT NICHT RICHTIG!');
        console.log('   - Keine neuen Mahlzeiten generiert');
        console.log('   - Button hat keine sichtbare Wirkung');
    }
    
    console.log('\nScreenshots gespeichert:');
    console.log('   - ai-before.png (vor KI-Generierung)');
    console.log('   - ai-after.png (nach KI-Generierung)');
    console.log('='.repeat(60));
});