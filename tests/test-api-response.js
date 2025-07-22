const { test } = require('@playwright/test');

test('test AI API response directly', async ({ page, request }) => {
  // First, test the API directly
  const apiResponse = await request.post('http://localhost:3000/api/ai/suggest-meals', {
    headers: {
      'Content-Type': 'application/json',
      'x-tenant-id': 'demo'
    },
    data: {
      mode: 'variety',
      weekNumber: 1,
      currentPlan: {}
    }
  });
  
  console.log('API Response Status:', apiResponse.status());
  const responseData = await apiResponse.json();
  console.log('API Response:', JSON.stringify(responseData, null, 2));
  
  // Now test through the UI
  await page.goto('http://localhost:3000');
  await page.waitForTimeout(2000);
  
  // Intercept the API request
  let apiRequestMade = false;
  let apiRequestData = null;
  
  page.on('request', request => {
    if (request.url().includes('/api/ai/suggest-meals')) {
      apiRequestMade = true;
      apiRequestData = request.postData();
      console.log('Frontend API Request:', apiRequestData);
    }
  });
  
  page.on('response', response => {
    if (response.url().includes('/api/ai/suggest-meals')) {
      response.json().then(data => {
        console.log('Frontend API Response:', JSON.stringify(data, null, 2));
      }).catch(err => {
        console.log('Failed to parse response:', err);
      });
    }
  });
  
  // Click meal planning
  await page.click('a:has-text("KI-Speiseplanung")');
  await page.waitForSelector('.ai-assistant-panel', { state: 'visible' });
  
  // Click generate
  await page.click('button:has-text("KI-Plan erstellen")');
  await page.waitForTimeout(3000);
  
  console.log('API Request Made:', apiRequestMade);
  
  // Check the calendar
  const mealPlanData = await page.evaluate(() => {
    return window.AppData ? window.AppData.mealPlan : null;
  });
  
  console.log('Meal Plan Data:', JSON.stringify(mealPlanData, null, 2));
});