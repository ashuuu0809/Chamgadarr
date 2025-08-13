const puppeteer = require('puppeteer');

(async () => {
  try {
    // Launch Puppeteer with Render-safe settings
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--single-process'
      ]
    });

    const page = await browser.newPage();

    // Go to Aternos server page
    await page.goto('https://aternos.org/server/Striker_Ot', {
      waitUntil: 'networkidle2'
    });

    // Login (replace with your credentials)
    await page.type('#user', 'YOUR_USERNAME', { delay: 50 });
    await page.type('#password', 'YOUR_PASSWORD', { delay: 50 });
    await page.click('#login-button');

    // Wait for dashboard to load
    await page.waitForNavigation({ waitUntil: 'networkidle2' });

    // Click start server button
    await page.click('.server-start');

    console.log('Server start command sent ✅');
    await browser.close();
  } catch (err) {
    console.error('Error starting server:', err);
  }
})();
