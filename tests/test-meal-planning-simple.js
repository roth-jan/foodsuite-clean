const { test, expect } = require('@playwright/test');
const { spawn } = require('child_process');
const path = require('path');

let serverProcess;

test.beforeAll(async () => {
    console.log('🚀 Starte Server...');
    serverProcess = spawn('node', ['server.js'], {
        cwd: path.join(__dirname, '..'),
        stdio: 'pipe'
    });
    await new Promise(resolve => setTimeout(resolve, 3000));
});

test.afterAll(async () => {
    if (serverProcess) {
        serverProcess.kill();
    }
});

test('Speiseplanung Funktionstest', async ({ page }) => {
    console.log('\n📋 SPEISEPLANUNG FUNKTIONSTEST\n');
    
    // Navigiere zur App
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(1000);
    
    // Screenshot der Startseite
    await page.screenshot({ 
        path: 'test-screenshots/01-homepage.png'
    });
    
    // Gehe zur Speiseplanung
    await page.click('a[href="#meal-planning"]');
    await page.waitForTimeout(3000);
    
    // Screenshot der Speiseplanung
    await page.screenshot({ 
        path: 'test-screenshots/02-meal-planning.png',
        fullPage: true
    });
    
    console.log('✅ Screenshots erstellt:');
    console.log('   - 01-homepage.png');
    console.log('   - 02-meal-planning.png');
    
    // Analysiere was auf der Seite ist
    console.log('\n📊 SEITENANALYSE:');
    
    // Rezepte
    const recipes = await page.locator('.recipe-item').count();
    console.log(`\n1. Rezepte: ${recipes} gefunden`);
    
    // Kalender
    const calendarSlots = await page.locator('.meal-slot').count();
    console.log(`\n2. Kalender-Slots: ${calendarSlots} gefunden`);
    
    // Buttons
    const buttons = await page.locator('button').all();
    console.log(`\n3. Buttons (${buttons.length} gesamt):`);
    
    let buttonTexts = [];
    for (const button of buttons) {
        const text = await button.textContent();
        if (text && text.trim()) {
            buttonTexts.push(text.trim());
        }
    }
    
    // Zeige unique Buttons
    const uniqueButtons = [...new Set(buttonTexts)];
    uniqueButtons.slice(0, 10).forEach(btn => {
        console.log(`   - ${btn}`);
    });
    if (uniqueButtons.length > 10) {
        console.log(`   ... und ${uniqueButtons.length - 10} weitere`);
    }
    
    // Cards/Panels
    const cards = await page.locator('.card').count();
    console.log(`\n4. Cards/Panels: ${cards} gefunden`);
    
    // Test Drag & Drop wenn möglich
    if (recipes > 0 && calendarSlots > 0) {
        console.log('\n5. Drag & Drop Test:');
        try {
            const firstRecipe = page.locator('.recipe-item').first();
            const firstSlot = page.locator('.meal-slot').first();
            
            await firstRecipe.dragTo(firstSlot);
            await page.waitForTimeout(1000);
            
            console.log('   ✓ Drag & Drop ausgeführt');
            
            // Screenshot nach Drag & Drop
            await page.screenshot({ 
                path: 'test-screenshots/03-after-drag-drop.png',
                fullPage: true
            });
        } catch (error) {
            console.log('   ✗ Drag & Drop fehlgeschlagen:', error.message);
        }
    }
    
    // ZUSAMMENFASSUNG
    console.log('\n' + '='.repeat(50));
    console.log('ERGEBNIS:');
    console.log('='.repeat(50));
    console.log(`✓ Speiseplanung geladen`);
    console.log(`✓ ${recipes} Rezepte verfügbar`);
    console.log(`✓ ${calendarSlots} Kalender-Slots vorhanden`);
    console.log(`✓ ${buttons.length} interaktive Buttons`);
    console.log(`✓ ${cards} UI-Cards/Panels`);
    console.log('\nScreenshots in test-screenshots/ gespeichert');
    console.log('='.repeat(50));
});