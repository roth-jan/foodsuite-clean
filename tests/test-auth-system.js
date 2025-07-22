// Comprehensive test for authentication and user management system
const { test, expect } = require('@playwright/test');

const BASE_URL = 'http://3.120.41.138';
const API_URL = `${BASE_URL}/api`;

// Test credentials
const testUsers = {
    admin: { username: 'admin', password: 'Demo123!', role: 'Administrator' },
    chef: { username: 'chef', password: 'Demo123!', role: 'Koch' },
    viewer: { username: 'viewer', password: 'Demo123!', role: 'Betrachter' }
};

test.describe('FoodSuite Authentication System', () => {
    test.beforeEach(async ({ page }) => {
        // Clear any existing session
        await page.goto(`${BASE_URL}/foodsuite-login.html`);
        await page.evaluate(() => {
            localStorage.clear();
            sessionStorage.clear();
        });
    });

    test('Login page is accessible and properly styled', async ({ page }) => {
        await page.goto(`${BASE_URL}/foodsuite-login.html`);
        
        // Check page title
        await expect(page).toHaveTitle('FoodSuite Pro - Login');
        
        // Check main elements are visible
        await expect(page.locator('h1:has-text("Willkommen zurück!")')).toBeVisible();
        await expect(page.locator('#username')).toBeVisible();
        await expect(page.locator('#password')).toBeVisible();
        await expect(page.locator('button[type="submit"]')).toBeVisible();
        
        // Check demo credentials section
        await expect(page.locator('.demo-info')).toBeVisible();
        await expect(page.locator('text=Administrator: admin / Demo123!')).toBeVisible();
        await expect(page.locator('text=Koch: chef / Demo123!')).toBeVisible();
        await expect(page.locator('text=Betrachter: viewer / Demo123!')).toBeVisible();
        
        // Take screenshot of login page
        await page.screenshot({ 
            path: 'test-screenshots/login-page.png',
            fullPage: true 
        });
    });

    test('Demo credential auto-fill works', async ({ page }) => {
        await page.goto(`${BASE_URL}/foodsuite-login.html`);
        
        // Click on admin demo credential
        await page.click('text=Administrator: admin / Demo123!');
        
        // Check if fields are filled
        await expect(page.locator('#username')).toHaveValue('admin');
        await expect(page.locator('#password')).toHaveValue('Demo123!');
    });

    test('Login with invalid credentials shows error', async ({ page }) => {
        await page.goto(`${BASE_URL}/foodsuite-login.html`);
        
        // Try to login with wrong credentials
        await page.fill('#username', 'wronguser');
        await page.fill('#password', 'wrongpass');
        await page.click('button[type="submit"]');
        
        // Check for error message
        await expect(page.locator('#loginAlert')).toBeVisible();
        await expect(page.locator('#loginAlertText')).toContainText('Ungültige Anmeldedaten');
    });

    test('Successful login redirects to main app', async ({ page }) => {
        await page.goto(`${BASE_URL}/foodsuite-login.html`);
        
        // Login as admin
        await page.fill('#username', testUsers.admin.username);
        await page.fill('#password', testUsers.admin.password);
        await page.click('button[type="submit"]');
        
        // Wait for success message
        await expect(page.locator('text=Anmeldung erfolgreich')).toBeVisible();
        
        // Wait for redirect (or check if redirected)
        await page.waitForTimeout(2000);
        
        // Check if we have auth tokens
        const tokens = await page.evaluate(() => ({
            accessToken: localStorage.getItem('access_token'),
            refreshToken: localStorage.getItem('refresh_token'),
            user: localStorage.getItem('user')
        }));
        
        expect(tokens.accessToken).toBeTruthy();
        expect(tokens.refreshToken).toBeTruthy();
        expect(tokens.user).toBeTruthy();
    });

    test('API authentication works correctly', async ({ request }) => {
        // Test login endpoint
        const loginResponse = await request.post(`${API_URL}/auth/login`, {
            headers: { 'x-tenant-id': 'demo' },
            data: {
                username: testUsers.admin.username,
                password: testUsers.admin.password
            }
        });
        
        expect(loginResponse.ok()).toBeTruthy();
        const loginData = await loginResponse.json();
        
        expect(loginData).toHaveProperty('access_token');
        expect(loginData).toHaveProperty('refresh_token');
        expect(loginData.user.username).toBe('admin');
        expect(loginData.user.role.name).toBe('Administrator');
        
        // Test protected endpoint with token
        const usersResponse = await request.get(`${API_URL}/users`, {
            headers: {
                'Authorization': `Bearer ${loginData.access_token}`,
                'x-tenant-id': 'demo'
            }
        });
        
        expect(usersResponse.ok()).toBeTruthy();
        const usersData = await usersResponse.json();
        expect(usersData.users).toBeInstanceOf(Array);
    });

    test('Different roles have different permissions', async ({ page, request }) => {
        const results = [];
        
        for (const [key, user] of Object.entries(testUsers)) {
            // Login via API
            const loginResponse = await request.post(`${API_URL}/auth/login`, {
                headers: { 'x-tenant-id': 'demo' },
                data: {
                    username: user.username,
                    password: user.password
                }
            });
            
            const loginData = await loginResponse.json();
            const token = loginData.access_token;
            
            // Test various endpoints
            const endpoints = [
                { path: '/users', method: 'GET', description: 'View users' },
                { path: '/users', method: 'POST', description: 'Create user', data: { username: 'test', email: 'test@test.com' } },
                { path: '/roles', method: 'GET', description: 'View roles' },
                { path: '/products', method: 'GET', description: 'View products' },
                { path: '/orders', method: 'POST', description: 'Create order', data: {} }
            ];
            
            const userResults = {
                user: user.username,
                role: user.role,
                permissions: loginData.user.permissions.length,
                endpointAccess: []
            };
            
            for (const endpoint of endpoints) {
                let response;
                if (endpoint.method === 'GET') {
                    response = await request.get(`${API_URL}${endpoint.path}`, {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'x-tenant-id': 'demo'
                        }
                    });
                } else {
                    response = await request.post(`${API_URL}${endpoint.path}`, {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'x-tenant-id': 'demo'
                        },
                        data: endpoint.data
                    });
                }
                
                userResults.endpointAccess.push({
                    endpoint: `${endpoint.method} ${endpoint.path}`,
                    description: endpoint.description,
                    allowed: response.ok() || response.status() !== 403
                });
            }
            
            results.push(userResults);
        }
        
        // Log results for review
        console.log('Permission Test Results:', JSON.stringify(results, null, 2));
        
        // Verify admin has most permissions
        const adminResults = results.find(r => r.user === 'admin');
        const viewerResults = results.find(r => r.user === 'viewer');
        
        expect(adminResults.permissions).toBeGreaterThan(viewerResults.permissions);
    });

    test('Main application UI shows correct elements based on role', async ({ page }) => {
        // We'll test if the main app has authentication checks
        // Try to access main app without login
        await page.goto(`${BASE_URL}/foodsuite-complete-app.html`);
        
        // Check if there's any authentication check or if we need to add it
        const hasAuthCheck = await page.evaluate(() => {
            return typeof window.authManager !== 'undefined';
        });
        
        console.log('Main app has authManager:', hasAuthCheck);
        
        // Take screenshot of main app
        await page.screenshot({ 
            path: 'test-screenshots/main-app-no-auth.png',
            fullPage: true 
        });
    });

    test('User management UI elements', async ({ page }) => {
        await page.goto(`${BASE_URL}/foodsuite-login.html`);
        
        // Login as admin
        await page.fill('#username', testUsers.admin.username);
        await page.fill('#password', testUsers.admin.password);
        await page.click('button[type="submit"]');
        
        // Wait for potential redirect
        await page.waitForTimeout(2000);
        
        // Check if user management HTML exists
        const response = await page.goto(`${BASE_URL}/user-management-ui.html`);
        expect(response.status()).toBe(200);
        
        // Take screenshot
        await page.screenshot({ 
            path: 'test-screenshots/user-management-ui.png',
            fullPage: true 
        });
    });

    test('Password requirements are enforced', async ({ request }) => {
        // First login as admin
        const loginResponse = await request.post(`${API_URL}/auth/login`, {
            headers: { 'x-tenant-id': 'demo' },
            data: {
                username: testUsers.admin.username,
                password: testUsers.admin.password
            }
        });
        
        const { access_token } = await loginResponse.json();
        
        // Try to create user with weak password
        const weakPasswordResponse = await request.post(`${API_URL}/users`, {
            headers: {
                'Authorization': `Bearer ${access_token}`,
                'x-tenant-id': 'demo'
            },
            data: {
                username: 'testuser',
                email: 'test@example.com',
                password: 'weak',
                first_name: 'Test',
                last_name: 'User',
                role_id: 105
            }
        });
        
        // Should fail due to password requirements
        expect(weakPasswordResponse.ok()).toBeFalsy();
        const errorData = await weakPasswordResponse.json();
        expect(errorData.error).toContain('password');
    });

    test('Session management and token refresh', async ({ request }) => {
        // Login
        const loginResponse = await request.post(`${API_URL}/auth/login`, {
            headers: { 'x-tenant-id': 'demo' },
            data: {
                username: testUsers.admin.username,
                password: testUsers.admin.password
            }
        });
        
        const { access_token, refresh_token } = await loginResponse.json();
        
        // Verify session
        const verifyResponse = await request.get(`${API_URL}/auth/verify`, {
            headers: {
                'Authorization': `Bearer ${access_token}`,
                'x-tenant-id': 'demo'
            }
        });
        
        expect(verifyResponse.ok()).toBeTruthy();
        
        // Test token refresh
        const refreshResponse = await request.post(`${API_URL}/auth/refresh`, {
            headers: { 'x-tenant-id': 'demo' },
            data: { refresh_token }
        });
        
        expect(refreshResponse.ok()).toBeTruthy();
        const refreshData = await refreshResponse.json();
        expect(refreshData).toHaveProperty('access_token');
    });

    test('Logout functionality', async ({ request }) => {
        // Login first
        const loginResponse = await request.post(`${API_URL}/auth/login`, {
            headers: { 'x-tenant-id': 'demo' },
            data: {
                username: testUsers.admin.username,
                password: testUsers.admin.password
            }
        });
        
        const { access_token } = await loginResponse.json();
        
        // Logout
        const logoutResponse = await request.post(`${API_URL}/auth/logout`, {
            headers: {
                'Authorization': `Bearer ${access_token}`,
                'x-tenant-id': 'demo'
            }
        });
        
        expect(logoutResponse.ok()).toBeTruthy();
        
        // Try to use token after logout (should fail)
        const afterLogoutResponse = await request.get(`${API_URL}/users`, {
            headers: {
                'Authorization': `Bearer ${access_token}`,
                'x-tenant-id': 'demo'
            }
        });
        
        // Token should be invalid after logout
        expect(afterLogoutResponse.ok()).toBeFalsy();
    });

    test('Complete user journey with screenshots', async ({ page }) => {
        // 1. Login page
        await page.goto(`${BASE_URL}/foodsuite-login.html`);
        await page.screenshot({ 
            path: 'test-screenshots/01-login-page-empty.png',
            fullPage: true 
        });
        
        // 2. Fill credentials
        await page.fill('#username', testUsers.admin.username);
        await page.fill('#password', testUsers.admin.password);
        await page.screenshot({ 
            path: 'test-screenshots/02-login-page-filled.png',
            fullPage: true 
        });
        
        // 3. Submit login
        await page.click('button[type="submit"]');
        await page.waitForTimeout(1000);
        await page.screenshot({ 
            path: 'test-screenshots/03-login-success.png',
            fullPage: true 
        });
        
        // 4. Check main app or wherever it redirects
        await page.waitForTimeout(2000);
        await page.screenshot({ 
            path: 'test-screenshots/04-after-login.png',
            fullPage: true 
        });
    });
});

// Run the tests
test.describe.configure({ mode: 'serial' });