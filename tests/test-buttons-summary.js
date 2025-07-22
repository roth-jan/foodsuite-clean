const { test, expect } = require('@playwright/test');

test.describe('Button Summary Test', () => {
  test('should quickly test button functionality across all tabs', async ({ page }) => {
    // Set longer timeout for this test
    test.setTimeout(120000);
    
    console.log('🧪 QUICK BUTTON FUNCTIONALITY TEST');
    console.log('═══════════════════════════════════════════════════════════════');

    await page.goto('http://localhost:3461');
    await page.waitForTimeout(2000);

    const results = {
      totalButtons: 0,
      workingButtons: 0,
      failedButtons: [],
      byTab: {}
    };

    const tabs = [
      { name: 'Dashboard', selector: 'a[href="#dashboard"]', id: '#dashboard' },
      { name: 'Meal Planning', selector: 'a[href="#meal-planning"]', id: '#meal-planning' },
      { name: 'Products', selector: 'a[href="#products"]', id: '#products' },
      { name: 'Suppliers', selector: 'a[href="#suppliers"]', id: '#suppliers' },
      { name: 'Orders', selector: 'a[href="#orders"]', id: '#orders' },
      { name: 'Inventory', selector: 'a[href="#inventory"]', id: '#inventory' },
      { name: 'Recipes', selector: 'a[href="#recipes"]', id: '#recipes' },
      { name: 'Analytics', selector: 'a[href="#analytics"]', id: '#analytics' }
    ];

    for (const tab of tabs) {
      console.log(`\n📂 ${tab.name.toUpperCase()}`);
      
      // Navigate to tab
      await page.click(tab.selector);
      await page.waitForTimeout(1500);

      // Count all buttons
      const buttons = await page.locator(`${tab.id} button`).count();
      results.totalButtons += buttons;
      results.byTab[tab.name] = { total: buttons, types: [] };
      
      console.log(`   Total buttons: ${buttons}`);

      // Check for different button types
      const buttonTypes = [
        { name: 'Edit', selector: `${tab.id} button[data-action*="edit"], ${tab.id} button[onclick*="edit"]` },
        { name: 'Delete', selector: `${tab.id} button[data-action*="delete"], ${tab.id} button[onclick*="delete"]` },
        { name: 'Modal', selector: `${tab.id} button[data-bs-toggle="modal"], ${tab.id} button[onclick*="Modal"]` },
        { name: 'Export', selector: `${tab.id} button[onclick*="export"], ${tab.id} button:has-text("Export")` },
        { name: 'AI/KI', selector: `${tab.id} button[onclick*="AI"], ${tab.id} button:has-text("KI")` },
        { name: 'Navigation', selector: `${tab.id} button[onclick*="previous"], ${tab.id} button[onclick*="next"]` }
      ];

      for (const type of buttonTypes) {
        const count = await page.locator(type.selector).count();
        if (count > 0) {
          console.log(`   - ${type.name} buttons: ${count}`);
          results.byTab[tab.name].types.push(`${type.name}: ${count}`);
        }
      }

      // Test one representative button per tab (non-destructive)
      const testButton = page.locator(`${tab.id} button`).first();
      const testButtonCount = await testButton.count();
      
      if (testButtonCount > 0) {
        try {
          const buttonText = await testButton.textContent();
          const isEnabled = await testButton.isEnabled();
          
          if (isEnabled && !buttonText?.includes('Löschen')) {
            await testButton.click();
            await page.waitForTimeout(1000);
            
            // Check for errors
            const errors = await page.locator('.alert-danger:visible, .toast-error:visible').count();
            if (errors > 0) {
              console.log(`   ❌ First button causes error`);
              results.failedButtons.push(`${tab.name}: First button`);
            } else {
              console.log(`   ✅ First button works`);
              results.workingButtons++;
            }
            
            // Close any modals
            const closeBtn = page.locator('.modal.show .btn-close');
            if (await closeBtn.count() > 0) {
              await closeBtn.click();
              await page.waitForTimeout(500);
            }
          }
        } catch (e) {
          console.log(`   ⚠️  Could not test button: ${e.message}`);
        }
      }
    }

    // Final summary
    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('📊 BUTTON TEST SUMMARY');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log(`\n🔘 Total buttons found: ${results.totalButtons}`);
    console.log(`✅ Sample buttons tested successfully: ${results.workingButtons}`);
    console.log(`❌ Failed buttons: ${results.failedButtons.length}`);
    
    console.log('\n📋 BUTTONS BY TAB:');
    for (const [tabName, data] of Object.entries(results.byTab)) {
      console.log(`\n${tabName}: ${data.total} buttons`);
      if (data.types.length > 0) {
        data.types.forEach(type => console.log(`  ${type}`));
      }
    }

    if (results.failedButtons.length > 0) {
      console.log('\n❌ FAILED BUTTONS:');
      results.failedButtons.forEach(button => console.log(`  - ${button}`));
    }

    // Specific checks
    console.log('\n🔍 SPECIFIC CHECKS:');
    
    // Test suppliers edit specifically
    await page.click('a[href="#suppliers"]');
    await page.waitForTimeout(1500);
    const suppliersEditButtons = await page.locator('button[data-action="editSupplier"]').count();
    console.log(`\n✏️  Suppliers edit buttons: ${suppliersEditButtons}`);
    
    if (suppliersEditButtons > 0) {
      const firstEdit = page.locator('button[data-action="editSupplier"]').first();
      await firstEdit.click();
      await page.waitForTimeout(1000);
      
      const modal = await page.locator('.modal.show').count();
      console.log(`   Edit modal opens: ${modal > 0 ? '✅ Yes' : '❌ No'}`);
      
      if (modal > 0) {
        await page.locator('.modal.show .btn-close').click();
      }
    }

    console.log('\n✅ Button summary test completed');
  });
});