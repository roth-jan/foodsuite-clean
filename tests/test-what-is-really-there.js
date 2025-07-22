const { test, expect } = require('@playwright/test');

const BASE_URL = 'http://3.120.41.138:3000';

test('What is REALLY on the page?', async ({ page }) => {
    console.log('\n🔍 WHAT IS REALLY ON THE PAGE?');
    console.log('===============================\n');
    
    // Login
    await page.goto(BASE_URL);
    await page.fill('#username', 'admin');
    await page.fill('#password', 'Demo123!');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
    
    console.log('✅ Logged in');
    
    // Take full page screenshot
    await page.screenshot({ path: 'test-screenshots/full-page-after-login.png', fullPage: true });
    console.log('📸 Full page screenshot saved');
    
    // List ALL buttons and links
    console.log('\n📋 ALL BUTTONS ON PAGE:');
    const allButtons = await page.locator('button').all();
    for (let i = 0; i < allButtons.length; i++) {
        const text = await allButtons[i].textContent();
        const visible = await allButtons[i].isVisible();
        if (visible && text.trim()) {
            console.log(`  ${i+1}. "${text.trim()}"`);
        }
    }
    
    console.log('\n🔗 ALL LINKS ON PAGE:');
    const allLinks = await page.locator('a').all();
    for (let i = 0; i < allLinks.length; i++) {
        const text = await allLinks[i].textContent();
        const href = await allLinks[i].getAttribute('href');
        const visible = await allLinks[i].isVisible();
        if (visible && text.trim()) {
            console.log(`  ${i+1}. "${text.trim()}" (href: ${href})`);
        }
    }
    
    // Look for navigation tabs/sections
    console.log('\n📑 NAVIGATION/TAB ELEMENTS:');
    const navElements = await page.locator('nav, .nav, .tab, .menu, [data-tab]').all();
    for (let i = 0; i < navElements.length; i++) {
        const text = await navElements[i].textContent();
        const classes = await navElements[i].getAttribute('class');
        if (text.trim()) {
            console.log(`  ${i+1}. "${text.trim()}" (class: ${classes})`);
        }
    }
    
    // Look for any German words related to meal planning
    console.log('\n🍽️ MEAL PLANNING RELATED TEXT:');
    const bodyText = await page.textContent('body');
    const mealWords = ['speise', 'plan', 'meal', 'essen', 'menü', 'küche', 'rezept', 'kalender'];
    mealWords.forEach(word => {
        const found = bodyText.toLowerCase().includes(word.toLowerCase());
        console.log(`  ${word}: ${found}`);
    });
    
    // Check for any draggable elements anywhere
    console.log('\n🎯 DRAGGABLE ELEMENTS:');
    const draggables = await page.locator('[draggable="true"]').all();
    console.log(`Found ${draggables.length} draggable elements:`);
    for (let i = 0; i < draggables.length; i++) {
        const text = await draggables[i].textContent();
        const tag = await draggables[i].evaluate(el => el.tagName);
        console.log(`  ${i+1}. <${tag}> "${text.trim()}"`);
    }
    
    // Check page title and URL
    const title = await page.title();
    const url = page.url();
    console.log(`\n📄 Page title: "${title}"`);
    console.log(`🌐 Current URL: ${url}`);
    
    // Look for any calendar/date related elements
    console.log('\n📅 CALENDAR/DATE ELEMENTS:');
    const calendarElements = await page.locator('.calendar, .day, .week, [data-day], .date').all();
    console.log(`Found ${calendarElements.length} calendar-related elements`);
    
    // Check main sections/containers
    console.log('\n📦 MAIN SECTIONS:');
    const sections = await page.locator('section, .section, .container, .content, main').all();
    for (let i = 0; i < Math.min(sections.length, 5); i++) {
        const classes = await sections[i].getAttribute('class');
        const id = await sections[i].getAttribute('id');
        console.log(`  ${i+1}. class="${classes}", id="${id}"`);
    }
});