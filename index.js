const puppeteer = require('puppeteer');

const email = "samosa0510";       // Aternos login email
const password = "samosa@1005"; // Aternos password
const serverName = "Striker_Ot";  // Your server name (from URL)

async function startServer() {
    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
    const page = await browser.newPage();

    console.log("Logging into Aternos...");
    await page.goto('https://aternos.org/go/', { waitUntil: 'networkidle2' });

    // Login
    await page.click('#login');
    await page.waitForSelector('#user');
    await page.type('#user', email);
    await page.type('#password', password);
    await page.click('#login-button');

    // Open server page
    await page.waitForSelector(`a[href="/server/${serverName}"]`);
    await page.click(`a[href="/server/${serverName}"]`);

    console.log("Checking server status...");
    await page.waitForSelector('#start', { timeout: 5000 }).then(async () => {
        console.log("Server offline → starting...");
        await page.click('#start');
        console.log("Waiting in queue...");
        await page.waitForTimeout(300000); // Wait 5 min queue time
    }).catch(() => {
        console.log("Server already running ✅");
    });

    await browser.close();
}

async function loopForever() {
    while (true) {
        await startServer();
        console.log("✅ Checked — waiting 10 min before next check...");
        await new Promise(resolve => setTimeout(resolve, 600000)); // 10 min
    }
}

loopForever();
