const { test, expect } = require('@playwright/test');

test.describe('Suppliers Working Test', () => {
  test('should test suppliers edit button with working API', async ({ page }) => {
    console.log('🎯 TESTING SUPPLIERS EDIT BUTTON WITH WORKING API');
    console.log('═══════════════════════════════════════════════════════════════');

    // Monitor console messages
    page.on('console', msg => {
      console.log(`🔍 Console ${msg.type()}: ${msg.text()}`);
    });

    // Monitor network requests
    page.on('response', response => {
      if (response.status() >= 400) {
        console.log(`❌ Network Error: ${response.status()} ${response.url()}`);
      } else if (response.url().includes('/api/')) {
        console.log(`✅ API Success: ${response.status()} ${response.url()}`);
      }
    });

    await page.goto('http://localhost:3461');
    console.log('✅ Page loaded on port 3461');

    // Wait for page to initialize
    await page.waitForTimeout(3000);

    // Navigate to suppliers tab
    console.log('📂 Navigating to suppliers tab...');
    await page.click('a[href="#suppliers"]');
    await page.waitForTimeout(3000);

    // Check if suppliers data loaded
    console.log('📊 Checking suppliers data...');
    const suppliersTable = page.locator('#suppliersTableBody');
    const tableExists = await suppliersTable.count() > 0;
    console.log(`📊 Suppliers table exists: ${tableExists}`);

    if (tableExists) {
      const tableContent = await suppliersTable.textContent();
      const hasData = tableContent && !tableContent.includes('Lade') && !tableContent.includes('Fehler') && tableContent.trim().length > 10;
      console.log(`📈 Table has data: ${hasData}`);
      console.log(`📄 Table content preview: ${tableContent.substring(0, 100)}...`);

      if (hasData) {
        // Count rows
        const rows = await suppliersTable.locator('tr').count();
        console.log(`📊 Supplier rows: ${rows}`);

        // Find edit buttons
        const editButtons = page.locator('button[data-action="editSupplier"]');
        const editCount = await editButtons.count();
        console.log(`✏️  Edit buttons found: ${editCount}`);

        if (editCount > 0) {
          console.log('\\n🖱️  TESTING EDIT BUTTON FUNCTIONALITY...');
          
          for (let i = 0; i < editCount; i++) {
            console.log(`\\n   Testing edit button ${i + 1}:`);
            
            try {
              const button = editButtons.nth(i);
              const isVisible = await button.isVisible();
              const isEnabled = await button.isEnabled();
              const buttonText = await button.textContent();
              
              console.log(`   Text: "${buttonText?.trim()}" | Visible: ${isVisible} | Enabled: ${isEnabled}`);
              
              if (isVisible && isEnabled) {
                await button.click();
                console.log(`   ✅ Edit button ${i + 1} clicked successfully`);
                await page.waitForTimeout(2000);
                
                // Check for modal
                const modal = page.locator('.modal.show');
                const modalExists = await modal.count() > 0;
                console.log(`   🪟 Edit modal opened: ${modalExists}`);
                
                if (modalExists) {
                  // Check modal content
                  const modalTitle = await modal.locator('.modal-title').textContent();
                  console.log(`   📝 Modal title: "${modalTitle}"`);
                  
                  // Check for form fields
                  const formFields = await modal.locator('input, select, textarea').count();
                  console.log(`   📝 Form fields: ${formFields}`);
                  
                  // Close modal
                  const closeButton = modal.locator('.btn-close, button:has-text("Schließen"), button:has-text("Abbrechen")');
                  const closeCount = await closeButton.count();
                  if (closeCount > 0) {
                    await closeButton.first().click();
                    await page.waitForTimeout(1000);
                    console.log(`   ❌ Modal closed`);
                  }
                } else {
                  console.log(`   ❌ Edit modal did not open`);
                }
              } else {
                console.log(`   ⚠️  Edit button ${i + 1} not clickable`);
              }
            } catch (error) {
              console.log(`   ❌ Edit button ${i + 1} error: ${error.message}`);
            }
          }
        } else {
          console.log('⚠️  No edit buttons found');
        }
      } else {
        console.log('⚠️  No supplier data loaded or loading error');
      }
    } else {
      console.log('❌ Suppliers table not found');
    }

    // Check for any error messages
    console.log('\\n🚨 CHECKING FOR ERROR MESSAGES...');
    const errorSelectors = [
      '.alert-danger',
      '.text-danger',
      '.toast-error',
      '.error-message',
      '[class*="error"]'
    ];

    let totalErrors = 0;
    for (const selector of errorSelectors) {
      const errors = page.locator(selector);
      const errorCount = await errors.count();
      if (errorCount > 0) {
        totalErrors += errorCount;
        console.log(`❌ Found ${errorCount} errors with selector: ${selector}`);
        for (let i = 0; i < errorCount; i++) {
          const errorText = await errors.nth(i).textContent();
          if (errorText?.trim()) {
            console.log(`   Error ${i + 1}: ${errorText.trim()}`);
          }
        }
      }
    }

    if (totalErrors === 0) {
      console.log('✅ No error messages found');
    }

    console.log('\\n🎯 SUPPLIERS EDIT TEST COMPLETED');
  });
});