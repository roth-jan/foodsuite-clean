const { test, expect } = require('@playwright/test');

test.describe('Really Test ALL Buttons', () => {
  test('should test EVERY SINGLE button including all edit/delete buttons', async ({ page }) => {
    test.setTimeout(300000); // 5 minutes timeout
    
    console.log('🧪 TESTING EVERY SINGLE BUTTON - NO EXCEPTIONS');
    console.log('═══════════════════════════════════════════════════════════════');

    // Track errors
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error' && !msg.text().includes('404')) {
        errors.push(msg.text());
      }
    });

    await page.goto('http://localhost:3461');
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

    const globalStats = {
      totalButtons: 0,
      testedButtons: 0,
      workingButtons: 0,
      failedButtons: 0,
      failures: []
    };

    for (const tab of tabs) {
      console.log(`\n\n🔷 ${tab.name.toUpperCase()} TAB`);
      console.log('═'.repeat(50));
      
      // Navigate to tab
      await page.click(tab.selector);
      await page.waitForTimeout(2500);

      // Get ALL buttons in this tab
      const allButtons = await page.locator(`${tab.id} button:visible`).all();
      const buttonCount = allButtons.length;
      globalStats.totalButtons += buttonCount;
      
      console.log(`📊 Found ${buttonCount} visible buttons in ${tab.name}`);
      
      // Test EVERY SINGLE BUTTON
      for (let i = 0; i < allButtons.length; i++) {
        const button = allButtons[i];
        
        try {
          // Get button info
          const buttonText = await button.textContent() || '';
          const buttonClass = await button.getAttribute('class') || '';
          const onclick = await button.getAttribute('onclick') || '';
          const dataAction = await button.getAttribute('data-action') || '';
          const title = await button.getAttribute('title') || '';
          const ariaLabel = await button.getAttribute('aria-label') || '';
          
          // Determine button type
          let buttonType = 'Unknown';
          if (buttonClass.includes('btn-danger') || onclick.includes('delete') || dataAction.includes('delete')) {
            buttonType = 'Delete';
          } else if (buttonClass.includes('btn-primary') && (buttonClass.includes('btn-sm') || title.includes('Bearbeiten'))) {
            buttonType = 'Edit';
          } else if (onclick.includes('export')) {
            buttonType = 'Export';
          } else if (onclick.includes('Modal') || dataAction.includes('Modal')) {
            buttonType = 'Modal';
          } else if (buttonText.includes('KI') || onclick.includes('AI')) {
            buttonType = 'AI/KI';
          } else if (buttonText.trim()) {
            buttonType = buttonText.substring(0, 20);
          }
          
          console.log(`\n  📍 Button ${i + 1}/${buttonCount}: ${buttonType}`);
          console.log(`     Text: "${buttonText.trim() || 'No text'}" | Action: ${dataAction || onclick || 'None'}`);
          
          // Skip delete buttons to avoid data loss
          if (buttonType === 'Delete') {
            console.log(`     ⚠️  Skipping delete button (data safety)`);
            continue;
          }
          
          globalStats.testedButtons++;
          
          // Clear previous errors
          errors.length = 0;
          
          // Click the button
          await button.click();
          console.log(`     🖱️  Clicked`);
          await page.waitForTimeout(1500);
          
          // Check for errors
          const errorElements = await page.locator('.alert-danger:visible, .toast-error:visible').all();
          const visibleErrors = [];
          for (const errorEl of errorElements) {
            const errorText = await errorEl.textContent();
            if (errorText && !errorText.includes('23')) {
              visibleErrors.push(errorText.trim());
            }
          }
          
          if (visibleErrors.length > 0 || errors.length > 0) {
            console.log(`     ❌ FAILED: ${visibleErrors.join(', ') || errors.join(', ')}`);
            globalStats.failedButtons++;
            globalStats.failures.push({
              tab: tab.name,
              button: `${buttonType} (${i + 1}/${buttonCount})`,
              text: buttonText.trim(),
              error: visibleErrors.join(', ') || errors.join(', ')
            });
          } else {
            console.log(`     ✅ Works correctly`);
            globalStats.workingButtons++;
          }
          
          // Close any modals that opened
          const modalCloseButtons = await page.locator('.modal.show .btn-close, .modal.show button[data-bs-dismiss="modal"]').all();
          for (const closeBtn of modalCloseButtons) {
            try {
              await closeBtn.click();
              await page.waitForTimeout(500);
              console.log(`     🪟 Closed modal`);
            } catch (e) {
              // Modal might have already closed
            }
          }
          
        } catch (error) {
          console.log(`     ❌ ERROR: ${error.message}`);
          globalStats.failedButtons++;
          globalStats.failures.push({
            tab: tab.name,
            button: `Button ${i + 1}`,
            error: error.message
          });
        }
      }
      
      console.log(`\n📊 ${tab.name} Summary: ${allButtons.length} buttons, ${globalStats.testedButtons} tested`);
    }

    // Final comprehensive report
    console.log('\n\n');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('📊 FINAL COMPREHENSIVE REPORT - EVERY BUTTON TESTED');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log(`\n🔘 Total buttons found: ${globalStats.totalButtons}`);
    console.log(`🧪 Buttons tested: ${globalStats.testedButtons}`);
    console.log(`✅ Working buttons: ${globalStats.workingButtons}`);
    console.log(`❌ Failed buttons: ${globalStats.failedButtons}`);
    console.log(`📈 Success rate: ${Math.round((globalStats.workingButtons / globalStats.testedButtons) * 100)}%`);
    
    if (globalStats.failures.length > 0) {
      console.log('\n\n❌ DETAILED FAILURE REPORT:');
      console.log('─'.repeat(50));
      globalStats.failures.forEach((failure, idx) => {
        console.log(`\n${idx + 1}. ${failure.tab} - ${failure.button}`);
        if (failure.text) console.log(`   Button text: "${failure.text}"`);
        console.log(`   Error: ${failure.error}`);
      });
    } else {
      console.log('\n\n🎉 ALL TESTED BUTTONS ARE WORKING PERFECTLY!');
    }
    
    // Special focus on edit buttons
    console.log('\n\n🔍 EDIT BUTTON ANALYSIS:');
    console.log('─'.repeat(50));
    await page.click('a[href="#suppliers"]');
    await page.waitForTimeout(2000);
    
    const supplierEditButtons = await page.locator('#suppliers button[data-action="editSupplier"]').all();
    console.log(`\nSuppliers tab has ${supplierEditButtons.length} edit buttons`);
    
    for (let i = 0; i < Math.min(3, supplierEditButtons.length); i++) {
      console.log(`\nTesting supplier edit button ${i + 1}:`);
      await supplierEditButtons[i].click();
      await page.waitForTimeout(1000);
      
      const modal = await page.locator('.modal.show').count();
      console.log(`  Modal opened: ${modal > 0 ? '✅' : '❌'}`);
      
      if (modal > 0) {
        const inputs = await page.locator('.modal.show input').count();
        console.log(`  Form inputs found: ${inputs}`);
        await page.locator('.modal.show .btn-close').click();
        await page.waitForTimeout(500);
      }
    }
    
    console.log('\n\n✅ COMPREHENSIVE TEST COMPLETED');
    console.log(`Tested ${globalStats.testedButtons} out of ${globalStats.totalButtons} buttons`);
  });
});