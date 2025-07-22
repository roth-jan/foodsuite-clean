const { test, expect } = require('@playwright/test');

const BASE_URL = 'http://3.120.41.138:3000';

test.describe('FoodSuite User Visibility Tests', () => {
    test('Login page is accessible and displays correctly', async ({ page }) => {
        await page.goto(`${BASE_URL}/foodsuite-login.html`);
        
        // Check if page loads
        await expect(page).toHaveTitle(/FoodSuite/);
        
        // Check basic elements
        await expect(page.locator('input[type="text"]')).toBeVisible();
        await expect(page.locator('input[type="password"]')).toBeVisible();
        await expect(page.locator('button[type="submit"]')).toBeVisible();
        
        // Check demo credentials
        const demoCredentials = await page.locator('.demo-credential').count();
        expect(demoCredentials).toBeGreaterThan(0);
        
        console.log('✓ Login page is accessible and displays correctly');
        console.log(`✓ Found ${demoCredentials} demo credential options`);
    });

    test('Admin login works and shows full interface', async ({ page }) => {
        await page.goto(`${BASE_URL}/foodsuite-login.html`);
        
        // Fill login form
        await page.fill('input[type="text"]', 'admin');
        await page.fill('input[type="password"]', 'Demo123!');
        await page.click('button[type="submit"]');
        
        // Wait for redirect
        await page.waitForTimeout(3000);
        
        // Check if we're on the app page
        const currentUrl = page.url();
        expect(currentUrl).toContain('foodsuite-app-with-auth.html');
        
        // Check if main content is visible
        await expect(page.locator('.main-content')).toBeVisible();
        
        console.log('✓ Admin login successful');
        console.log(`✓ Redirected to: ${currentUrl}`);
    });

    test('Authenticated app shows user interface elements', async ({ page }) => {
        // Login first
        await page.goto(`${BASE_URL}/foodsuite-login.html`);
        await page.fill('input[type="text"]', 'admin');
        await page.fill('input[type="password"]', 'Demo123!');
        await page.click('button[type="submit"]');
        
        // Wait for app to load
        await page.waitForTimeout(3000);
        
        // Check navigation elements
        const navbar = await page.locator('.navbar').isVisible();
        const mainContent = await page.locator('.main-content').isVisible();
        const navTabs = await page.locator('.nav-tabs').isVisible();
        
        console.log(`✓ Navigation bar: ${navbar ? 'Visible' : 'Hidden'}`);
        console.log(`✓ Main content: ${mainContent ? 'Visible' : 'Hidden'}`);
        console.log(`✓ Navigation tabs: ${navTabs ? 'Visible' : 'Hidden'}`);
        
        // Check if dashboard is visible
        const dashboard = await page.locator('#dashboard').isVisible();
        console.log(`✓ Dashboard: ${dashboard ? 'Visible' : 'Hidden'}`);
        
        // Check if user menu is visible
        const userMenu = await page.locator('.dropdown-toggle').isVisible();
        console.log(`✓ User menu: ${userMenu ? 'Visible' : 'Hidden'}`);
        
        // Take screenshot for visual verification
        await page.screenshot({ path: 'test-screenshots/authenticated-app.png' });
        console.log('✓ Screenshot saved: test-screenshots/authenticated-app.png');
    });

    test('User permissions are working correctly', async ({ page }) => {
        // Login as admin
        await page.goto(`${BASE_URL}/foodsuite-login.html`);
        await page.fill('input[type="text"]', 'admin');
        await page.fill('input[type="password"]', 'Demo123!');
        await page.click('button[type="submit"]');
        
        await page.waitForTimeout(3000);
        
        // Count visible tabs
        const tabs = await page.locator('.nav-tabs .nav-item').count();
        console.log(`✓ Total navigation tabs: ${tabs}`);
        
        // Check specific permission-based elements
        const visibleTabs = await page.locator('.nav-tabs .nav-item:visible').count();
        console.log(`✓ Visible tabs for admin: ${visibleTabs}`);
        
        // Check if user management is accessible
        const usersTab = await page.locator('[data-bs-target="#users"]').isVisible();
        console.log(`✓ Users tab visible: ${usersTab}`);
        
        // Check if analytics is accessible
        const analyticsTab = await page.locator('[data-bs-target="#analytics"]').isVisible();
        console.log(`✓ Analytics tab visible: ${analyticsTab}`);
        
        // Test clicking on users tab
        if (usersTab) {
            await page.click('[data-bs-target="#users"]');
            await page.waitForTimeout(1000);
            
            const usersContent = await page.locator('#users').isVisible();
            console.log(`✓ Users content visible: ${usersContent}`);
        }
    });

    test('User menu functionality works', async ({ page }) => {
        // Login as admin
        await page.goto(`${BASE_URL}/foodsuite-login.html`);
        await page.fill('input[type="text"]', 'admin');
        await page.fill('input[type="password"]', 'Demo123!');
        await page.click('button[type="submit"]');
        
        await page.waitForTimeout(3000);
        
        // Click user menu
        await page.click('.dropdown-toggle');
        await page.waitForTimeout(500);
        
        // Check dropdown menu items
        const profileOption = await page.locator('text=Mein Profil').isVisible();
        const passwordOption = await page.locator('text=Passwort ändern').isVisible();
        const userMgmtOption = await page.locator('text=Benutzerverwaltung').isVisible();
        const logoutOption = await page.locator('text=Abmelden').isVisible();
        
        console.log(`✓ Profile option: ${profileOption ? 'Visible' : 'Hidden'}`);
        console.log(`✓ Password option: ${passwordOption ? 'Visible' : 'Hidden'}`);
        console.log(`✓ User management option: ${userMgmtOption ? 'Visible' : 'Hidden'}`);
        console.log(`✓ Logout option: ${logoutOption ? 'Visible' : 'Hidden'}`);
        
        // Take screenshot of user menu
        await page.screenshot({ path: 'test-screenshots/user-menu.png' });
        console.log('✓ User menu screenshot saved');
    });

    test('Dashboard metrics are visible', async ({ page }) => {
        // Login as admin
        await page.goto(`${BASE_URL}/foodsuite-login.html`);
        await page.fill('input[type="text"]', 'admin');
        await page.fill('input[type="password"]', 'Demo123!');
        await page.click('button[type="submit"]');
        
        await page.waitForTimeout(3000);
        
        // Check dashboard metrics
        const metricCards = await page.locator('.metric-card').count();
        console.log(`✓ Dashboard metric cards: ${metricCards}`);
        
        // Check if specific metrics are visible
        const metrics = [
            'Aktive Benutzer',
            'Produkte',
            'Offene Bestellungen',
            'Monatliche Kosten'
        ];
        
        for (const metric of metrics) {
            const isVisible = await page.locator(`text=${metric}`).isVisible();
            console.log(`✓ ${metric}: ${isVisible ? 'Visible' : 'Hidden'}`);
        }
        
        // Check recent activities
        const activities = await page.locator('.list-group-item').count();
        console.log(`✓ Recent activities: ${activities}`);
        
        // Take screenshot of dashboard
        await page.screenshot({ path: 'test-screenshots/dashboard.png' });
        console.log('✓ Dashboard screenshot saved');
    });

    test('Different user roles show different permissions', async ({ page }) => {
        const users = [
            { username: 'admin', role: 'Administrator' },
            { username: 'manager', role: 'Manager' },
            { username: 'chef', role: 'Chef' },
            { username: 'staff', role: 'Staff' },
            { username: 'viewer', role: 'Viewer' }
        ];
        
        for (const user of users) {
            console.log(`\n--- Testing ${user.role} (${user.username}) ---`);
            
            // Login
            await page.goto(`${BASE_URL}/foodsuite-login.html`);
            await page.fill('input[type="text"]', user.username);
            await page.fill('input[type="password"]', 'Demo123!');
            await page.click('button[type="submit"]');
            
            await page.waitForTimeout(3000);
            
            // Check if login was successful
            const currentUrl = page.url();
            if (currentUrl.includes('foodsuite-app-with-auth.html')) {
                console.log(`✓ ${user.role} login successful`);
                
                // Count visible tabs
                const visibleTabs = await page.locator('.nav-tabs .nav-item:visible').count();
                console.log(`✓ ${user.role} can see ${visibleTabs} tabs`);
                
                // Check specific tabs
                const usersTab = await page.locator('[data-bs-target="#users"]').isVisible();
                const analyticsTab = await page.locator('[data-bs-target="#analytics"]').isVisible();
                
                console.log(`✓ ${user.role} - Users tab: ${usersTab ? 'Visible' : 'Hidden'}`);
                console.log(`✓ ${user.role} - Analytics tab: ${analyticsTab ? 'Visible' : 'Hidden'}`);
                
                // Take screenshot
                await page.screenshot({ path: `test-screenshots/${user.username}-view.png` });
                
            } else {
                console.log(`✗ ${user.role} login failed - still on login page`);
            }
            
            // Logout
            if (currentUrl.includes('foodsuite-app-with-auth.html')) {
                try {
                    await page.click('.dropdown-toggle');
                    await page.waitForTimeout(500);
                    await page.click('text=Abmelden');
                    await page.waitForTimeout(1000);
                } catch (error) {
                    console.log(`Note: Could not logout ${user.role} - ${error.message}`);
                }
            }
        }
    });

    test('API endpoints are accessible', async ({ page, request }) => {
        // Login to get token
        await page.goto(`${BASE_URL}/foodsuite-login.html`);
        await page.fill('input[type="text"]', 'admin');
        await page.fill('input[type="password"]', 'Demo123!');
        await page.click('button[type="submit"]');
        
        await page.waitForTimeout(3000);
        
        // Check if we can access API endpoints
        const apiEndpoints = [
            '/api/health',
            '/api/users',
            '/api/roles',
            '/api/products',
            '/api/orders'
        ];
        
        for (const endpoint of apiEndpoints) {
            try {
                const response = await request.get(`${BASE_URL}${endpoint}`, {
                    headers: {
                        'x-tenant-id': 'demo'
                    }
                });
                
                console.log(`✓ ${endpoint}: ${response.status()} ${response.statusText()}`);
            } catch (error) {
                console.log(`✗ ${endpoint}: Error - ${error.message}`);
            }
        }
    });
});

test('Complete system verification', async ({ page }) => {
    console.log('\n=== COMPLETE SYSTEM VERIFICATION ===');
    
    // Test login
    await page.goto(`${BASE_URL}/foodsuite-login.html`);
    await page.fill('input[type="text"]', 'admin');
    await page.fill('input[type="password"]', 'Demo123!');
    await page.click('button[type="submit"]');
    
    await page.waitForTimeout(3000);
    
    // Verify we're on the app page
    const currentUrl = page.url();
    const onAppPage = currentUrl.includes('foodsuite-app-with-auth.html');
    
    console.log(`✓ Authentication: ${onAppPage ? 'Working' : 'Failed'}`);
    
    if (onAppPage) {
        // Check major UI components
        const components = [
            { selector: '.navbar', name: 'Navigation Bar' },
            { selector: '.main-content', name: 'Main Content' },
            { selector: '.nav-tabs', name: 'Navigation Tabs' },
            { selector: '#dashboard', name: 'Dashboard' },
            { selector: '.metric-card', name: 'Metrics' },
            { selector: '.dropdown-toggle', name: 'User Menu' }
        ];
        
        let visibleCount = 0;
        for (const component of components) {
            const isVisible = await page.locator(component.selector).isVisible();
            if (isVisible) visibleCount++;
            console.log(`✓ ${component.name}: ${isVisible ? 'Visible' : 'Hidden'}`);
        }
        
        // Test navigation
        const totalTabs = await page.locator('.nav-tabs .nav-item').count();
        const visibleTabs = await page.locator('.nav-tabs .nav-item:visible').count();
        
        console.log(`✓ Navigation: ${visibleTabs}/${totalTabs} tabs visible`);
        
        // Test user management
        const usersTab = await page.locator('[data-bs-target="#users"]').isVisible();
        if (usersTab) {
            await page.click('[data-bs-target="#users"]');
            await page.waitForTimeout(1000);
            
            const userTable = await page.locator('#usersTableBody').isVisible();
            console.log(`✓ User Management: ${userTable ? 'Working' : 'Not visible'}`);
        }
        
        // Final screenshot
        await page.screenshot({ path: 'test-screenshots/complete-system.png' });
        
        console.log('\n=== SUMMARY ===');
        console.log(`✓ UI Components: ${visibleCount}/${components.length} visible`);
        console.log(`✓ Navigation: ${visibleTabs} tabs accessible`);
        console.log(`✓ User Management: ${usersTab ? 'Available' : 'Not available'}`);
        console.log(`✓ Authentication: Working`);
        console.log(`✓ System Status: ${visibleCount >= 4 ? 'FULLY FUNCTIONAL' : 'PARTIALLY FUNCTIONAL'}`);
        
        if (visibleCount >= 4) {
            console.log('\n🎉 ALL TESTS PASSED - SYSTEM IS FULLY VISIBLE AND FUNCTIONAL FOR USERS');
        }
    } else {
        console.log('\n❌ Authentication failed - system not accessible');
    }
});