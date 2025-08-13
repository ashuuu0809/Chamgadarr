// index.js — Aternos Auto Starter + Keep Alive Web Server

const express = require('express');
const puppeteer = require('puppeteer');

const USERNAME = 'samosa0510';
const PASSWORD = 'samosa@1005';
const SERVER_SLUG = 'Striker_Ot'; // The part after /server/ in your URL

const app = express();
app.get('/', (req, res) => res.send('Aternos Auto Starter Running'));
app.listen(3000, () => console.log('Web server running on port 3000'));

// Function to start the server
async function startServer() {
  console.log(`[${new Date().toLocaleTimeString()}] Checking server status...`);

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();

  try {
    // Login
    await page.goto('https://aternos.org/go/', { waitUntil: 'networkidle2' });
    await page.type('#user', USERNAME, { delay: 100 });
    await page.type('#password', PASSWORD, { delay: 100 });
    await page.click('#login');
    await page.waitForNavigation({ waitUntil: 'networkidle2' });

    // Go to server page
    await page.goto(`https://aternos.org/server/${SERVER_SLUG}`, { waitUntil: 'networkidle2' });

    // Check if "Start" button exists
    const startBtn = await page.$('button.start');
    if (startBtn) {
      console.log('Server is offline. Starting now...');
      await startBtn.click();
      await page.waitForTimeout(3000);
      console.log('Start command sent.');
    } else {
      console.log('Server is already running.');
    }

  } catch (err) {
    console.error('Error starting server:', err);
  }

  await browser.close();
}

// Run immediately on start
startServer();

// Repeat every 10 minutes
setInterval(startServer, 10 * 60 * 1000);
