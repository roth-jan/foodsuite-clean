const { test, expect } = require('@playwright/test');

test.describe('Comprehensive All Buttons Test', () => {
  test('should test ALL buttons across ALL tabs', async ({ page }) => {
    console.log('🧪 TESTING ALL BUTTONS ACROSS ALL TABS');
    console.log('═══════════════════════════════════════════════════════════════');

    // Monitor console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log(`❌ Console Error: ${msg.text()}`);
      }
    });

    // Monitor network errors
    page.on('response', response => {
      if (response.status() >= 400) {
        console.log(`❌ Network Error: ${response.status()} ${response.url()}`);
      }
    });

    await page.goto('http://localhost:3000');
    await page.waitForTimeout(3000);

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

    const buttonStats = {
      total: 0,
      working: 0,
      failed: 0,
      skipped: 0,
      byTab: {},
      failedButtons: []
    };

    for (const tab of tabs) {
      console.log(`\n📂 TESTING ${tab.name.toUpperCase()} TAB`);
      console.log('─'.repeat(50));

      // Navigate to tab
      await page.click(tab.selector);
      await page.waitForTimeout(2000);

      // Initialize tab stats
      buttonStats.byTab[tab.name] = {
        total: 0,
        working: 0,
        failed: 0,
        buttons: []
      };

      // Find all buttons in this tab
      const allButtons = page.locator(`${tab.id} button`);
      const buttonCount = await allButtons.count();
      console.log(`🔘 Found ${buttonCount} buttons in ${tab.name}`);

      for (let i = 0; i < buttonCount; i++) {
        const button = allButtons.nth(i);
        
        try {
          // Get button details
          const buttonText = await button.textContent();
          const buttonClass = await button.getAttribute('class') || '';
          const buttonOnClick = await button.getAttribute('onclick') || '';
          const buttonDataAction = await button.getAttribute('data-action') || '';
          const buttonType = await button.getAttribute('type') || 'button';
          const isVisible = await button.isVisible();
          const isEnabled = await button.isEnabled();

          const buttonInfo = {
            text: buttonText?.trim() || 'No text',
            type: buttonType,
            action: buttonDataAction || buttonOnClick || 'None',
            visible: isVisible,
            enabled: isEnabled,
            index: i + 1
          };

          buttonStats.total++;
          buttonStats.byTab[tab.name].total++;
          buttonStats.byTab[tab.name].buttons.push(buttonInfo);

          console.log(`\n   Button ${i + 1}: "${buttonInfo.text}" (${buttonInfo.type})`);
          console.log(`   Action: ${buttonInfo.action}`);
          console.log(`   State: Visible=${isVisible}, Enabled=${isEnabled}`);

          if (isVisible && isEnabled) {
            // Skip destructive actions
            const isDestructive = buttonText?.includes('Löschen') || 
                                buttonText?.includes('Delete') || 
                                buttonOnClick?.includes('delete') ||
                                buttonDataAction?.includes('delete');

            if (!isDestructive) {
              try {
                // Clear any existing errors before clicking
                await page.evaluate(() => {
                  document.querySelectorAll('.alert-danger, .text-danger').forEach(el => {
                    if (el.textContent?.includes('Fehler') || el.textContent?.includes('Error')) {
                      el.remove();
                    }
                  });
                });

                await button.click();
                await page.waitForTimeout(1500);
                
                // Check for any error messages after click
                const errorMessages = await page.evaluate(() => {
                  const errors = [];
                  document.querySelectorAll('.alert-danger, .text-danger, .toast-error').forEach(el => {
                    const text = el.textContent?.trim();
                    if (text && text.length > 0 && text !== '23') {
                      errors.push(text);
                    }
                  });
                  return errors;
                });
                
                if (errorMessages.length > 0) {
                  console.log(`   ❌ Button caused error: ${errorMessages.join(', ')}`);
                  buttonStats.failed++;
                  buttonStats.byTab[tab.name].failed++;
                  buttonStats.failedButtons.push({
                    tab: tab.name,
                    button: buttonInfo.text,
                    action: buttonInfo.action,
                    error: errorMessages.join(', ')
                  });
                } else {
                  console.log(`   ✅ Button works correctly`);
                  buttonStats.working++;
                  buttonStats.byTab[tab.name].working++;
                }

                // Close any modals that may have opened
                const closeButtons = page.locator('.modal.show .btn-close, .modal.show button:has-text("Schließen"), .modal.show button:has-text("Abbrechen")');
                const closeCount = await closeButtons.count();
                if (closeCount > 0) {
                  await closeButtons.first().click();
                  await page.waitForTimeout(500);
                }
              } catch (clickError) {
                console.log(`   ❌ Click error: ${clickError.message}`);
                buttonStats.failed++;
                buttonStats.byTab[tab.name].failed++;
                buttonStats.failedButtons.push({
                  tab: tab.name,
                  button: buttonInfo.text,
                  action: buttonInfo.action,
                  error: clickError.message
                });
              }
            } else {
              console.log(`   ⚠️  Skipped destructive button`);
              buttonStats.skipped++;
            }
          } else {
            console.log(`   ⚠️  Button not clickable`);
            buttonStats.skipped++;
          }
        } catch (error) {
          console.log(`   ❌ Button analysis error: ${error.message}`);
          buttonStats.failed++;
        }
      }

      // Summary for this tab
      console.log(`\n📊 ${tab.name} Summary:`);
      console.log(`   Total: ${buttonStats.byTab[tab.name].total}`);
      console.log(`   Working: ${buttonStats.byTab[tab.name].working}`);
      console.log(`   Failed: ${buttonStats.byTab[tab.name].failed}`);
    }

    // Final comprehensive summary
    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('📊 FINAL COMPREHENSIVE BUTTON TEST SUMMARY');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log(`🔘 Total buttons tested: ${buttonStats.total}`);
    console.log(`✅ Working buttons: ${buttonStats.working}`);
    console.log(`❌ Failed buttons: ${buttonStats.failed}`);
    console.log(`⚠️  Skipped buttons: ${buttonStats.skipped}`);
    console.log(`📈 Success rate: ${buttonStats.total > 0 ? Math.round((buttonStats.working / (buttonStats.working + buttonStats.failed)) * 100) : 0}%`);

    console.log('\n📋 BREAKDOWN BY TAB:');
    for (const [tabName, stats] of Object.entries(buttonStats.byTab)) {
      console.log(`\n${tabName}:`);
      console.log(`  - Total: ${stats.total}`);
      console.log(`  - Working: ${stats.working}`);
      console.log(`  - Failed: ${stats.failed}`);
    }

    if (buttonStats.failedButtons.length > 0) {
      console.log('\n❌ FAILED BUTTONS DETAILS:');
      buttonStats.failedButtons.forEach((failure, index) => {
        console.log(`\n${index + 1}. Tab: ${failure.tab}`);
        console.log(`   Button: "${failure.button}"`);
        console.log(`   Action: ${failure.action}`);
        console.log(`   Error: ${failure.error}`);
      });
    }

    // Check specific button types
    console.log('\n🔍 SPECIFIC BUTTON TYPE ANALYSIS:');
    
    // Check edit buttons
    const editButtons = await page.locator('button[data-action*="edit"], button[onclick*="edit"]').count();
    console.log(`✏️  Edit buttons: ${editButtons}`);
    
    // Check modal buttons
    const modalButtons = await page.locator('button[data-bs-toggle="modal"], button[onclick*="Modal"]').count();
    console.log(`🪟 Modal buttons: ${modalButtons}`);
    
    // Check export buttons
    const exportButtons = await page.locator('button[onclick*="export"], button:has-text("Export")').count();
    console.log(`📤 Export buttons: ${exportButtons}`);
    
    // Check AI buttons
    const aiButtons = await page.locator('button[onclick*="AI"], button:has-text("KI")').count();
    console.log(`🤖 AI buttons: ${aiButtons}`);
    
    // Check navigation buttons
    const navButtons = await page.locator('button[onclick*="previous"], button[onclick*="next"]').count();
    console.log(`🔄 Navigation buttons: ${navButtons}`);

    console.log('\n✅ Comprehensive button test completed');
    
    // Final verdict
    if (buttonStats.failed === 0) {
      console.log('\n🎉 ALL BUTTONS ARE WORKING CORRECTLY!');
    } else {
      console.log(`\n⚠️  ${buttonStats.failed} BUTTONS NEED FIXING!`);
    }
  });
});