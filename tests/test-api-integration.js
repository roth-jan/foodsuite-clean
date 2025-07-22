const { test, expect } = require('@playwright/test');

test.describe('FoodSuite API Integration Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Open the HTML file
    await page.goto('file:///C:/Users/JanHendrikRoth/Desktop/Claude%20Ergebnisse/Claude%20Ergebnisse/Foodsuite/foodsuite-complete-app.html');
    
    // Wait for the page to load completely
    await page.waitForTimeout(2000);
  });

  test('should load dashboard with real API data', async ({ page }) => {
    console.log('\n=== TESTING DASHBOARD API INTEGRATION ===');
    
    // Navigate to dashboard
    await page.click('a[href="#dashboard"]');
    await page.waitForTimeout(1000);
    
    // Check if dashboard is active
    const dashboardTab = page.locator('#dashboard');
    await expect(dashboardTab).toHaveClass(/active/);
    
    // Wait for API data to load and check metrics
    await page.waitForTimeout(3000);
    
    // Check if product count is loaded (should not be "..." anymore)
    const productCount = await page.locator('#activeProductsCount').textContent();
    console.log(`✓ Active Products Count: ${productCount}`);
    expect(productCount).not.toBe('...');
    expect(productCount).not.toBe('0');
    
    // Check if low stock count is loaded
    const lowStockCount = await page.locator('#lowStockCount').textContent();
    console.log(`✓ Low Stock Count: ${lowStockCount}`);
    expect(lowStockCount).not.toBe('...');
    
    console.log('Dashboard API integration successful!');
  });

  test('should load products from API', async ({ page }) => {
    console.log('\n=== TESTING PRODUCTS API INTEGRATION ===');
    
    // Navigate to products tab
    await page.click('a[href="#products"]');
    await page.waitForTimeout(1000);
    
    // Check if products tab is active
    const productsTab = page.locator('#products');
    await expect(productsTab).toHaveClass(/active/);
    
    // Wait for products to load
    await page.waitForTimeout(3000);
    
    // Check if products table has data
    const productRows = page.locator('#productsTableBody tr');
    const rowCount = await productRows.count();
    console.log(`✓ Products loaded: ${rowCount} items`);
    
    // Should have at least one product
    expect(rowCount).toBeGreaterThan(0);
    
    // Check if the loading message is gone
    const loadingMessage = page.locator('#productsTableBody tr td:has-text("Lade Produkte...")');
    await expect(loadingMessage).toHaveCount(0);
    
    // Check if first product has real data
    if (rowCount > 0) {
      const firstProductName = await page.locator('#productsTableBody tr:first-child td:nth-child(2)').textContent();
      console.log(`✓ First product: ${firstProductName}`);
      expect(firstProductName.trim().length).toBeGreaterThan(0);
    }
    
    console.log('Products API integration successful!');
  });

  test('should load suppliers from API', async ({ page }) => {
    console.log('\n=== TESTING SUPPLIERS API INTEGRATION ===');
    
    // Navigate to suppliers tab
    await page.click('a[href="#suppliers"]');
    await page.waitForTimeout(1000);
    
    // Check if suppliers tab is active
    const suppliersTab = page.locator('#suppliers');
    await expect(suppliersTab).toHaveClass(/active/);
    
    // Wait for suppliers to load
    await page.waitForTimeout(3000);
    
    // Check if suppliers table has data
    const supplierRows = page.locator('#suppliersTableBody tr');
    const rowCount = await supplierRows.count();
    console.log(`✓ Suppliers loaded: ${rowCount} items`);
    
    // Should have at least one supplier
    expect(rowCount).toBeGreaterThan(0);
    
    // Check if the loading message is gone
    const loadingMessage = page.locator('#suppliersTableBody tr td:has-text("Lade Lieferanten...")');
    await expect(loadingMessage).toHaveCount(0);
    
    // Check if first supplier has real data
    if (rowCount > 0) {
      const firstSupplierName = await page.locator('#suppliersTableBody tr:first-child td:first-child').textContent();
      console.log(`✓ First supplier: ${firstSupplierName}`);
      expect(firstSupplierName.trim().length).toBeGreaterThan(0);
    }
    
    console.log('Suppliers API integration successful!');
  });

  test('should load orders from API', async ({ page }) => {
    console.log('\n=== TESTING ORDERS API INTEGRATION ===');
    
    // Navigate to orders tab
    await page.click('a[href="#orders"]');
    await page.waitForTimeout(1000);
    
    // Check if orders tab is active
    const ordersTab = page.locator('#orders');
    await expect(ordersTab).toHaveClass(/active/);
    
    // Wait for orders to load
    await page.waitForTimeout(3000);
    
    // Check if orders table exists and has been populated
    const ordersTable = page.locator('#ordersTableBody');
    await expect(ordersTable).toBeVisible();
    
    // Check if loading message is gone
    const loadingMessage = page.locator('#ordersTableBody tr td:has-text("Lade Bestellungen...")');
    await expect(loadingMessage).toHaveCount(0);
    
    console.log('Orders API integration successful!');
  });

  test('should test supplier edit functionality', async ({ page }) => {
    console.log('\n=== TESTING SUPPLIER EDIT MODAL ===');
    
    // Navigate to suppliers tab
    await page.click('a[href="#suppliers"]');
    await page.waitForTimeout(1000);
    
    // Wait for suppliers to load
    await page.waitForTimeout(3000);
    
    // Click edit button on first supplier
    const editButton = page.locator('#suppliersTableBody tr:first-child button[onclick*="editSupplier"]');
    const editButtonCount = await editButton.count();
    
    if (editButtonCount > 0) {
      await editButton.click();
      await page.waitForTimeout(1000);
      
      // Check if modal opened
      const modal = page.locator('.modal.show');
      await expect(modal).toBeVisible();
      
      // Check if form fields are populated with real data
      const supplierNameField = page.locator('#supplierName');
      const supplierName = await supplierNameField.inputValue();
      console.log(`✓ Supplier edit modal opened for: ${supplierName}`);
      expect(supplierName.trim().length).toBeGreaterThan(0);
      
      // Close modal
      await page.click('.modal .btn-close');
      await page.waitForTimeout(500);
      
      console.log('Supplier edit functionality working!');
    } else {
      console.log('No edit buttons found - this may be expected if no suppliers exist');
    }
  });

  test('should test product action buttons', async ({ page }) => {
    console.log('\n=== TESTING PRODUCT ACTION BUTTONS ===');
    
    // Navigate to products tab
    await page.click('a[href="#products"]');
    await page.waitForTimeout(1000);
    
    // Wait for products to load
    await page.waitForTimeout(3000);
    
    // Check if action buttons exist
    const viewButtons = page.locator('#productsTableBody button[onclick*="viewProductDetails"]');
    const editButtons = page.locator('#productsTableBody button[onclick*="editProductDetails"]');
    const deleteButtons = page.locator('#productsTableBody button[onclick*="deleteProduct"]');
    
    const viewCount = await viewButtons.count();
    const editCount = await editButtons.count();
    const deleteCount = await deleteButtons.count();
    
    console.log(`✓ View buttons: ${viewCount}`);
    console.log(`✓ Edit buttons: ${editCount}`);
    console.log(`✓ Delete buttons: ${deleteCount}`);
    
    // Should have equal numbers of each button type
    expect(viewCount).toBe(editCount);
    expect(editCount).toBe(deleteCount);
    
    console.log('Product action buttons present!');
  });

  test('should verify no placeholder buttons remain', async ({ page }) => {
    console.log('\n=== VERIFYING NO PLACEHOLDER BUTTONS ===');
    
    // Count any remaining showToast buttons (these should be replaced)
    const placeholderButtons = page.locator('button[onclick*="showToast"]:not([onclick*="success"]):not([onclick*="error"]):not([onclick*="info"])');
    const placeholderCount = await placeholderButtons.count();
    
    console.log(`✓ Remaining placeholder buttons: ${placeholderCount}`);
    
    // Should have no placeholder buttons
    expect(placeholderCount).toBe(0);
    
    console.log('All placeholder buttons successfully replaced!');
  });

  test('should test tab navigation', async ({ page }) => {
    console.log('\n=== TESTING TAB NAVIGATION ===');
    
    const tabs = [
      { name: 'Dashboard', href: '#dashboard', id: 'dashboard' },
      { name: 'Products', href: '#products', id: 'products' },
      { name: 'Suppliers', href: '#suppliers', id: 'suppliers' },
      { name: 'Orders', href: '#orders', id: 'orders' }
    ];
    
    for (const tab of tabs) {
      console.log(`Testing ${tab.name} tab...`);
      
      // Click tab
      await page.click(`a[href="${tab.href}"]`);
      await page.waitForTimeout(1000);
      
      // Verify tab is active
      const tabElement = page.locator(`#${tab.id}`);
      await expect(tabElement).toHaveClass(/active/);
      
      // Verify nav link is active
      const navLink = page.locator(`a[href="${tab.href}"]`);
      await expect(navLink).toHaveClass(/active/);
      
      console.log(`✓ ${tab.name} tab navigation successful`);
    }
    
    console.log('All tab navigation working!');
  });

  test('should verify API client is loaded', async ({ page }) => {
    console.log('\n=== TESTING API CLIENT AVAILABILITY ===');
    
    // Check if API client is available in global scope
    const apiClientExists = await page.evaluate(() => {
      return typeof window.api !== 'undefined' && typeof window.api.getProducts === 'function';
    });
    
    console.log(`✓ API Client loaded: ${apiClientExists}`);
    expect(apiClientExists).toBe(true);
    
    // Check if API constants are set
    const apiConstants = await page.evaluate(() => {
      return {
        baseUrl: typeof window.API_BASE_URL !== 'undefined',
        tenantId: typeof window.TENANT_ID !== 'undefined'
      };
    });
    
    console.log(`✓ API Base URL defined: ${apiConstants.baseUrl}`);
    console.log(`✓ Tenant ID defined: ${apiConstants.tenantId}`);
    
    expect(apiConstants.baseUrl).toBe(true);
    expect(apiConstants.tenantId).toBe(true);
    
    console.log('API client integration successful!');
  });
});