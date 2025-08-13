const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const AdblockerPlugin = require('puppeteer-extra-plugin-adblocker');

puppeteer.use(StealthPlugin());
puppeteer.use(AdblockerPlugin({ blockTrackers: true }));

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();

  try {
    // Login
    await page.goto('https://aternos.org/go', { waitUntil: 'networkidle2' });
    await page.type('input[name="samosa0510"]', process.env.ATERNOS_USER, { delay: 50 });
    await page.type('input[name="samosa@1005"]', process.env.ATERNOS_PASS, { delay: 50 });
    await page.click('button[type="submit"]');
    await page.waitForNavigation({ waitUntil: 'networkidle2' });

    // Go to server page
    await page.goto(`https://aternos.org/server/${process.env.ATERNOS_SERVER}`, { waitUntil: 'networkidle2' });

    // Check if "Start" button exists
    const startBtn = await page.$('button.start');
    if (startBtn) {
      console.log("⚡ Server is offline — starting now...");
      await startBtn.click();

      // Confirm if needed
      try {
        await page.waitForSelector('.confirm', { timeout: 10000 });
        await page.click('.confirm');
        console.log("✅ Start confirmed.");
      } catch {
        console.log("ℹ No confirmation prompt.");
      }

      // Wait until server is online
      console.log("⌛ Waiting for server to come online...");
      await page.waitForFunction(
        () => document.body.innerText.includes("Online"),
        { timeout: 0 }
      );
      console.log("✅ Server is online!");
    } else {
      console.log("✅ Server already online!");
    }
  } catch (err) {
    console.error("❌ Error:", err.message);
  }

  await browser.close();
}

// Run every 10 minutes
startAternosServer();
setInterval(startAternosServer, 10 * 60 * 1000);
