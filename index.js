const puppeteer = require('puppeteer');

(async () => {
  try {
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

    console.log("🌐 Opening Aternos...");
    await page.goto('https://aternos.org/go/', { waitUntil: 'networkidle2' });

    // Login
    console.log("🔑 Logging in...");
    await page.type('#user', 'YOUR_USERNAME', { delay: 50 });
    await page.type('#password', 'YOUR_PASSWORD', { delay: 50 });
    await page.click('#login');

    await page.waitForNavigation({ waitUntil: 'networkidle2' });

    // Go to server page
    console.log("🖥️ Navigating to server...");
    await page.goto('https://aternos.org/server/', { waitUntil: 'networkidle2' });

    // Check if server is offline
    const status = await page.$eval('.statuslabel-label', el => el.innerText.trim());
    console.log(`📡 Current server status: ${status}`);

    if (status.toLowerCase() === 'offline') {
      console.log("🚀 Starting server...");
      await page.click('.server-start');

      // If queue appears
      try {
        await page.waitForSelector('.queue-position', { timeout: 5000 });
        console.log("⏳ Waiting in queue...");

        await page.waitForFunction(
          () => document.querySelector('.queue-position')?.innerText.trim() === '0',
          { timeout: 0 }
        );
        console.log("✅ Queue finished, server starting...");
      } catch {
        console.log("⚡ No queue detected, starting instantly...");
      }
    } else {
      console.log("✅ Server already online.");
    }

    await browser.close();
    console.log("🎯 Task complete!");
  } catch (err) {
    console.error("❌ Error:", err);
  }
})();
