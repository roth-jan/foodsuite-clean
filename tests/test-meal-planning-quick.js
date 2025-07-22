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

test.describe('Speiseplanung Quick Test', () => {
    test('Überprüfe Speiseplanung Funktionalität', async ({ page }) => {
        // Navigiere zur App
        await page.goto('http://localhost:3000');
        await page.waitForTimeout(1000);
        
        // Gehe zur Speiseplanung
        await page.click('a[href="#meal-planning"]');
        await page.waitForTimeout(2000);
        
        // 1. Prüfe Rezeptbibliothek
        console.log('\n📚 Prüfe Rezeptbibliothek...');
        const recipes = await page.locator('.recipe-item').count();
        console.log(`   ✓ ${recipes} Rezepte geladen (API Limit: 10)`);
        expect(recipes).toBeGreaterThan(0);
        
        // 2. Prüfe Kategoriefilter
        console.log('\n🔍 Prüfe Kategoriefilter...');
        const categoryFilter = page.locator('#categoryFilter');
        const hasFilter = await categoryFilter.isVisible();
        console.log(`   ${hasFilter ? '✓' : '✗'} Kategoriefilter vorhanden`);
        
        // 3. Prüfe Suchfeld
        console.log('\n🔎 Prüfe Suchfunktion...');
        const searchField = page.locator('#recipeSearch');
        const hasSearch = await searchField.isVisible();
        console.log(`   ${hasSearch ? '✓' : '✗'} Suchfeld vorhanden`);
        
        // 4. Prüfe Drag & Drop
        console.log('\n🎯 Teste Drag & Drop...');
        if (recipes > 0) {
            const firstRecipe = page.locator('.recipe-item').first();
            const recipeName = await firstRecipe.textContent();
            const emptySlot = page.locator('.meal-slot:not(:has(.meal-item))').first();
            
            await firstRecipe.dragTo(emptySlot);
            await page.waitForTimeout(1000);
            
            const slotHasContent = await emptySlot.locator('.meal-item').count() > 0;
            console.log(`   ${slotHasContent ? '✓' : '✗'} Drag & Drop funktioniert`);
        }
        
        // 5. Prüfe KI-Button
        console.log('\n🤖 Prüfe KI-Funktionen...');
        const aiButtons = await page.locator('button:has-text("KI")').count();
        const generateButton = await page.locator('button:has-text("Plan erstellen"), button:has-text("Generate")').count();
        console.log(`   ${(aiButtons > 0 || generateButton > 0) ? '✓' : '✗'} KI-Buttons gefunden`);
        
        // 6. Prüfe kollabierbare Panels
        console.log('\n📊 Prüfe Panels...');
        const costPanel = await page.locator(':has-text("Kosten"), :has-text("Cost")').count();
        const nutritionPanel = await page.locator(':has-text("Nährwert"), :has-text("Nutrition")').count();
        console.log(`   ${costPanel > 0 ? '✓' : '✗'} Kosten-Panel vorhanden`);
        console.log(`   ${nutritionPanel > 0 ? '✓' : '✗'} Nährwert-Panel vorhanden`);
        
        // Screenshot
        await page.screenshot({ 
            path: 'test-screenshots/meal-planning-current-state.png',
            fullPage: true 
        });
        
        console.log('\n📸 Screenshot gespeichert: meal-planning-current-state.png');
        
        // Zusammenfassung
        console.log('\n' + '='.repeat(50));
        console.log('ZUSAMMENFASSUNG:');
        console.log('='.repeat(50));
        console.log(`Rezepte geladen: ${recipes}`);
        console.log(`Features vorhanden:`);
        console.log(`  - Kategoriefilter: ${hasFilter ? 'JA' : 'NEIN'}`);
        console.log(`  - Suchfunktion: ${hasSearch ? 'JA' : 'NEIN'}`);
        console.log(`  - Drag & Drop: ${recipes > 0 ? 'GETESTET' : 'NICHT TESTBAR'}`);
        console.log(`  - KI-Funktionen: ${(aiButtons > 0 || generateButton > 0) ? 'JA' : 'NEIN'}`);
        console.log(`  - Kosten-Panel: ${costPanel > 0 ? 'JA' : 'NEIN'}`);
        console.log(`  - Nährwert-Panel: ${nutritionPanel > 0 ? 'JA' : 'NEIN'}`);
    });
});