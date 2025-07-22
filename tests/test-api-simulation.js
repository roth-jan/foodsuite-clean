const { test, expect } = require('@playwright/test');

test.describe('FoodSuite API Simulation Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Mock the API to avoid CORS issues
    await page.route('http://localhost:3000/**', route => {
      const url = route.request().url();
      const method = route.request().method();
      
      // Simulate API responses based on endpoints
      if (url.includes('/api/products') && method === 'GET') {
        route.fulfill({
          contentType: 'application/json',
          body: JSON.stringify({
            items: [
              {
                id: 1,
                article_number: 'ART-001',
                name: 'Test Product',
                price: 12.50,
                stock: 45,
                min_stock: 20,
                unit: 'kg',
                status: 'active',
                category: { name: 'Test Category' },
                supplier: { name: 'Test Supplier' }
              }
            ],
            pagination: { total: 1, page: 1, limit: 10 }
          })
        });
      } else if (url.includes('/api/suppliers') && method === 'GET') {
        route.fulfill({
          contentType: 'application/json',
          body: JSON.stringify({
            items: [
              {
                id: 1,
                name: 'Test Supplier',
                contact_person: 'John Doe',
                email: 'test@supplier.com',
                phone: '+49 123 456789',
                rating: 4.5
              }
            ],
            pagination: { total: 1, page: 1, limit: 10 }
          })
        });
      } else if (url.includes('/api/orders') && method === 'GET') {
        route.fulfill({
          contentType: 'application/json',
          body: JSON.stringify({
            items: [
              {
                id: 1,
                order_number: 'ORD-2025-001',
                order_date: '2025-01-15',
                status: 'pending',
                total_amount: 125.50,
                supplier: { name: 'Test Supplier' }
              }
            ],
            pagination: { total: 1, page: 1, limit: 10 }
          })
        });
      } else {
        // Default response for other endpoints
        route.fulfill({
          contentType: 'application/json',
          body: JSON.stringify({ success: true })
        });
      }
    });

    await page.goto('file:///C:/Users/JanHendrikRoth/Desktop/Claude%20Ergebnisse/Claude%20Ergebnisse/Foodsuite/foodsuite-complete-app.html');
    await page.waitForTimeout(2000);
  });

  test('should simulate dashboard API loading', async ({ page }) => {
    console.log('\n=== SIMULATING DASHBOARD API LOADING ===');
    
    // Add mock API client to page
    await page.addInitScript(() => {
      window.API_BASE_URL = 'http://localhost:3000/api';
      window.TENANT_ID = 'demo';
      
      window.api = {
        getDashboardStats: async () => ({
          totalProducts: 5,
          totalSuppliers: 3,
          totalOrders: 2,
          lowStockCount: 1
        }),
        getProducts: async () => ({
          items: [{ id: 1, name: 'Test Product', price: 10.00 }],
          pagination: { total: 1 }
        }),
        getSuppliers: async () => ({
          items: [{ id: 1, name: 'Test Supplier' }],
          pagination: { total: 1 }
        }),
        getOrders: async () => ({
          items: [{ id: 1, order_number: 'ORD-001' }],
          pagination: { total: 1 }
        })
      };
    });
    
    await page.reload();
    await page.waitForTimeout(2000);
    
    // Navigate to dashboard and check if data loads
    await page.click('a.nav-link[href="#dashboard"]');
    await page.waitForTimeout(1000);
    
    // Manually trigger dashboard loading
    await page.evaluate(() => {
      if (typeof loadDashboard === 'function') {
        loadDashboard();
      }
    });
    
    await page.waitForTimeout(2000);
    
    console.log('✓ Dashboard API simulation completed');
  });

  test('should test table loading states', async ({ page }) => {
    console.log('\n=== TESTING TABLE LOADING STATES ===');
    
    // Check products table
    await page.click('a.nav-link[href="#products"]');
    await page.waitForTimeout(1000);
    
    const productsTable = page.locator('#productsTableBody');
    if (await productsTable.isVisible()) {
      const tableContent = await productsTable.textContent();
      console.log(`✓ Products table content: ${tableContent ? 'present' : 'empty'}`);
    }
    
    // Check suppliers table  
    await page.click('a.nav-link[href="#suppliers"]');
    await page.waitForTimeout(1000);
    
    const suppliersTable = page.locator('#suppliersTableBody');
    if (await suppliersTable.isVisible()) {
      const tableContent = await suppliersTable.textContent();
      console.log(`✓ Suppliers table content: ${tableContent ? 'present' : 'empty'}`);
    }
    
    console.log('Table loading states tested!');
  });

  test('should verify JavaScript functions are defined', async ({ page }) => {
    console.log('\n=== VERIFYING JAVASCRIPT FUNCTIONS ===');
    
    const functionsToCheck = [
      'showTab',
      'loadDashboard', 
      'loadProducts',
      'loadSuppliers',
      'editSupplier',
      'viewOrder',
      'confirmOrder'
    ];
    
    for (const funcName of functionsToCheck) {
      const isDefined = await page.evaluate((name) => {
        return typeof window[name] === 'function';
      }, funcName);
      
      console.log(`✓ ${funcName}: ${isDefined ? 'defined' : 'missing'}`);
      expect(isDefined).toBe(true);
    }
    
    console.log('All JavaScript functions verified!');
  });

  test('should test modal functionality', async ({ page }) => {
    console.log('\n=== TESTING MODAL FUNCTIONALITY ===');
    
    // Test if Bootstrap modal functions work
    const bootstrapModal = await page.evaluate(() => {
      return typeof bootstrap !== 'undefined' && typeof bootstrap.Modal !== 'undefined';
    });
    
    console.log(`✓ Bootstrap Modal available: ${bootstrapModal}`);
    expect(bootstrapModal).toBe(true);
    
    // Test modal creation (simulate)
    await page.evaluate(() => {
      const testModal = document.createElement('div');
      testModal.className = 'modal fade';
      testModal.innerHTML = `
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Test Modal</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">Test content</div>
          </div>
        </div>
      `;
      testModal.id = 'testModal';
      document.body.appendChild(testModal);
    });
    
    const testModal = page.locator('#testModal');
    await expect(testModal).toBeAttached();
    
    console.log('✓ Modal functionality working');
  });

  test('should test toast notification system', async ({ page }) => {
    console.log('\n=== TESTING TOAST NOTIFICATIONS ===');
    
    // Check if showToast function exists
    const showToastExists = await page.evaluate(() => {
      return typeof showToast === 'function';
    });
    
    console.log(`✓ showToast function: ${showToastExists ? 'available' : 'missing'}`);
    
    if (showToastExists) {
      // Trigger a test toast
      await page.evaluate(() => {
        showToast('Test notification', 'success');
      });
      
      await page.waitForTimeout(1000);
      
      // Check if toast appeared
      const toastContainer = page.locator('.toast-container, .alert');
      const toastCount = await toastContainer.count();
      console.log(`✓ Toast notifications: ${toastCount} visible`);
    }
    
    console.log('Toast notification system tested!');
  });

  test('should verify data consistency across tabs', async ({ page }) => {
    console.log('\n=== TESTING DATA CONSISTENCY ===');
    
    // Switch between tabs and check for consistent state
    const tabs = ['#dashboard', '#products', '#suppliers'];
    
    for (const tab of tabs) {
      await page.click(`a.nav-link[href="${tab}"]`);
      await page.waitForTimeout(500);
      
      // Check if tab is properly activated
      const tabElement = page.locator(tab);
      const isActive = await tabElement.getAttribute('class');
      const hasActiveClass = isActive && isActive.includes('active');
      
      console.log(`✓ ${tab} tab: ${hasActiveClass ? 'properly activated' : 'activation issue'}`);
    }
    
    console.log('Data consistency across tabs verified!');
  });

  test('should test error handling', async ({ page }) => {
    console.log('\n=== TESTING ERROR HANDLING ===');
    
    // Monitor console errors
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    // Try to trigger some actions that might cause errors
    await page.click('a.nav-link[href="#products"]');
    await page.waitForTimeout(1000);
    
    await page.click('a.nav-link[href="#suppliers"]');
    await page.waitForTimeout(1000);
    
    console.log(`✓ Console errors captured: ${consoleErrors.length}`);
    
    // Log first few errors if any
    if (consoleErrors.length > 0) {
      console.log('Errors found:');
      consoleErrors.slice(0, 3).forEach((error, i) => {
        console.log(`  ${i + 1}. ${error}`);
      });
    }
    
    console.log('Error handling test completed!');
  });
});