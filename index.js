// index.js — Aternos Auto Starter (Free with UptimeRobot + Render)

// ===== EXPRESS SERVER =====
const express = require('express');
const app = express();
const puppeteer = require('puppeteer');

app.get('/', (req, res) => {
  res.send('Aternos Auto Starter is running');
});

// Endpoint UptimeRobot will hit every 10 minutes
app.get('/start-server', async (req, res) => {
  try {
    res.send('Starting Aternos server...');
    await startAternos();
  } catch (err) {
    console.error(err);
  }
});

app.listen(3000, () => console.log('Web server running on port 3000'));

// ===== PUPPETEER SCRIPT =====
async function startAternos() {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  // === LOGIN ===
  console.log('Logging into Aternos...');
  await page.goto('https://aternos.org/go/', { waitUntil: 'networkidle2' });
  await page.type('#user', 'samosa0510', { delay: 50 });
  await page.type('#password', 'samosa@1005', { delay: 50 });
  await page.click('#login');

  await page.waitForNavigation({ waitUntil: 'networkidle2' });

  // === CLICK SERVER ===
  console.log('Opening server page...');
  await page.goto('https://aternos.org/servers/Striker_Ot', { waitUntil: 'networkidle2' });

  // === START BUTTON ===
  console.log('Clicking start...');
  await page.click('.server-status.start');

  // Optional: wait some seconds so it processes
  await page.waitForTimeout(5000);

  console.log('Server start triggered.');
  await browser.close();
}
