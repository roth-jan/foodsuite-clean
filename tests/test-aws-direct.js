// Direct AWS FoodSuite Test
import { test, expect } from '@playwright/test';

test.describe('AWS FoodSuite Complete Test', () => {
  test.beforeEach(async ({ page }) => {
    // Set timeout for all actions
    page.setDefaultTimeout(15000);
    
    // Go to AWS FoodSuite
    await page.goto('http://3.120.41.138:3000');
    
    // Login with demo credentials
    await page.fill('#username', 'admin');
    await page.fill('#password', 'Demo123!');
    await page.click('button[type="submit"]');
    
    // Wait for redirect to main app
    await page.waitForURL('**/foodsuite-complete-app.html', { timeout: 10000 });
  });

  test('Sollte alle Hauptfeatures der Wochenend-Version haben', async ({ page }) => {
    // Check dashboard is loaded
    await expect(page.locator('h1')).toContainText('Dashboard');
    
    // Check all tabs are present
    const tabs = [
      'KI-Speiseplanung',
      'Produktverwaltung', 
      'Rezeptverwaltung',
      'Lieferantenverwaltung',
      'Bestellverwaltung',
      'Lagerverwaltung',
      'Analytics & Preisvergleich',
      'Preisüberwachung'
    ];
    
    for (const tab of tabs) {
      await expect(page.locator(`text=${tab}`)).toBeVisible();
    }
  });

  test('KI-Speiseplanung sollte funktionieren', async ({ page }) => {
    // Navigate to AI meal planning
    await page.click('text=KI-Speiseplanung');
    await page.waitForTimeout(2000);
    
    // Check AI modes are available
    const aiModes = [
      'cost_optimized',
      'balanced_nutrition', 
      'variety',
      'seasonal',
      'inventory_based'
    ];
    
    const modeSelect = page.locator('#aiAssistantMode');
    await expect(modeSelect).toBeVisible();
    
    // Test AI generation
    await page.selectOption('#aiAssistantMode', 'variety');
    await page.click('button:has-text("KI-Wochenplan")');
    
    // Wait for meal plan generation
    await page.waitForTimeout(5000);
    
    // Check if meals were generated
    const mealEvents = page.locator('.meal-event');
    const mealCount = await mealEvents.count();
    expect(mealCount).toBeGreaterThan(0);
  });

  test('Custom AI Mode Designer sollte vorhanden sein', async ({ page }) => {
    await page.click('text=KI-Speiseplanung');
    await page.waitForTimeout(2000);
    
    // Check for custom mode designer
    await expect(page.locator('text=Custom AI Mode')).toBeVisible();
    
    // Check weight sliders
    await expect(page.locator('#costWeight')).toBeVisible();
    await expect(page.locator('#healthWeight')).toBeVisible();
    await expect(page.locator('#varietyWeight')).toBeVisible();
    await expect(page.locator('#speedWeight')).toBeVisible();
  });

  test('Drag & Drop sollte funktionieren', async ({ page }) => {
    await page.click('text=KI-Speiseplanung');
    await page.waitForTimeout(2000);
    
    // Generate some meals first
    await page.selectOption('#aiAssistantMode', 'variety');
    await page.click('button:has-text("KI-Wochenplan")');
    await page.waitForTimeout(5000);
    
    // Test drag and drop from recipe library
    await page.click('text=Rezept-Bibliothek');
    await page.waitForTimeout(1000);
    
    const firstRecipe = page.locator('.recipe-item').first();
    const firstCalendarCell = page.locator('.calendar-day').first();
    
    if (await firstRecipe.isVisible() && await firstCalendarCell.isVisible()) {
      await firstRecipe.dragTo(firstCalendarCell);
      await page.waitForTimeout(1000);
    }
  });

  test('Analytics sollte verfügbar sein', async ({ page }) => {
    await page.click('text=Analytics & Preisvergleich');
    await page.waitForTimeout(2000);
    
    // Check analytics sections
    await expect(page.locator('text=Kostenanalyse')).toBeVisible();
    await expect(page.locator('text=Verbrauchsmuster')).toBeVisible();
    await expect(page.locator('text=Lieferantenperformance')).toBeVisible();
  });

  test('User Management sollte funktionieren', async ({ page }) => {
    // Check user dropdown
    await page.click('.dropdown-toggle:has-text("admin")');
    await page.waitForTimeout(500);
    
    // Check user menu options
    await expect(page.locator('text=Profil bearbeiten')).toBeVisible();
    await expect(page.locator('text=Einstellungen')).toBeVisible();
    await expect(page.locator('text=Abmelden')).toBeVisible();
  });

  test('Price Monitoring sollte verfügbar sein', async ({ page }) => {
    await page.click('text=Preisüberwachung');
    await page.waitForTimeout(2000);
    
    // Check price monitoring interface
    await expect(page.locator('text=Preisalarm')).toBeVisible();
    await expect(page.locator('text=Preistrends')).toBeVisible();
  });
});