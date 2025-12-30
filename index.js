const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

const path = require('path');
const { generateQuery } = require('./words');

// Config
const USER_DATA_DIR = path.join(__dirname, 'user_data');
const POINTS_BREAKDOWN_URL = 'https://rewards.bing.com/pointsbreakdown';
const BING_SEARCH_URL = 'https://www.bing.com/search?q=';
const MIN_DELAY = 10000; // 10 seconds
const MAX_DELAY = 20000; // 20 seconds (Increased for safety)

// Helper: Random Delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const randomDelay = async () => {
    const time = Math.floor(Math.random() * (MAX_DELAY - MIN_DELAY + 1) + MIN_DELAY);
    console.log(`Waiting for ${(time / 1000).toFixed(1)} seconds...`);
    await delay(time);
};

const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const askQuestion = (query) => new Promise(resolve => rl.question(query, resolve));

async function main() {
    console.log('Starting Microsoft Rewards Bot (Stealth Mode)...');
    console.log('User Data Dir:', USER_DATA_DIR);

    const browser = await puppeteer.launch({
        headless: false,
        userDataDir: USER_DATA_DIR,
        protocolTimeout: 60000, // Increase timeout
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--window-size=1280,800',
            '--disable-blink-features=AutomationControlled'
        ]
    });

    try {
        let page = await browser.newPage();
        await page.setViewport({ width: 1280, height: 800 });

        console.log('Navigating to Points Breakdown...');
        await page.goto(POINTS_BREAKDOWN_URL, { waitUntil: 'networkidle2' });

        // PAUSE FOR MANUAL LOGIN
        console.log('\n==================================================');
        console.log('ACTION REQUIRED:');
        console.log('1. Please Login in the browser window if asked.');
        console.log('2. Ensure you are on the "Points Breakdown" page showing your PC/Mobile search counts.');
        console.log('3. If the page is blank or loading, hit refresh in the browser.');
        console.log('==================================================');
        await askQuestion('Press ENTER in this terminal once you are ready to start automation...');

        console.log('Reading stats...');
        try {
            await page.reload({ waitUntil: 'networkidle2' });
            await page.waitForSelector('body', { timeout: 30000 });
        } catch (e) {
            console.log("Reload timed out, continuing...");
        }

        const stats = await getPointsStats(page);
        console.log('Current Stats:', stats);

        if (stats.pc.max === 0 && stats.mobile.max === 0) {
             console.error('ERROR: Could not read points. Are you on the right page?');
             await askQuestion('Press ENTER to try reading stats again...');
             const retryStats = await getPointsStats(page);
             Object.assign(stats, retryStats);
        }

        // 2. Perform PC Searches
        if (stats.pc.current < stats.pc.max) {
            let searchesNeeded = Math.ceil((stats.pc.max - stats.pc.current) / 3);
            console.log(`Need ${searchesNeeded} PC searches.`);
            
            // Ensure PC context
            await page.setViewport({ width: 1280, height: 800 });
            // Note: UA is default or set only if needed.
            
            await performSearches(page, searchesNeeded, false);
        } else {
            console.log('PC searches already completed.');
        }

        // Close PC page to free resources and ensure clean state for Mobile
        await page.close();

        // 3. Perform Mobile Searches
        if (stats.mobile.current < stats.mobile.max) {
            let searchesNeeded = Math.ceil((stats.mobile.max - stats.mobile.current) / 3);
            console.log(`Need ${searchesNeeded} Mobile searches.`);
            
            console.log('Switching to Mobile Mode (New Tab)...');
            page = await browser.newPage();
            
            // Set Mobile UA and Viewport BEFORE navigating
            await page.setUserAgent('Mozilla/5.0 (Linux; Android 11; Pixel 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.91 Mobile Safari/537.36');
            await page.setViewport({ width: 393, height: 851, isMobile: true });
            
            await performSearches(page, searchesNeeded, true);
        } else {
            console.log('Mobile searches already completed.');
        }

        console.log('All tasks completed!');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        console.log('Browser closing in 5 seconds...');
        await delay(5000);
        await browser.close();
        rl.close();
    }
}

async function getPointsStats(page) {
    // Parse text content to find status
    // Expected format in text: "PC search 10 / 90" or "PC search 10/90"
    // Also "Mobile search 0 / 60"
    const content = await page.evaluate(() => document.body.innerText);
    
    // Regex to match "PC search" followed by numbers
    const pcMatch = content.match(/PC search\s*[\r\n]*(\d+)\s*\/\s*(\d+)/i);
    const mobileMatch = content.match(/Mobile search\s*[\r\n]*(\d+)\s*\/\s*(\d+)/i);

    return {
        pc: {
            current: pcMatch ? parseInt(pcMatch[1]) : 0,
            max: pcMatch ? parseInt(pcMatch[2]) : 0
        },
        mobile: {
            current: mobileMatch ? parseInt(mobileMatch[1]) : 0,
            max: mobileMatch ? parseInt(mobileMatch[2]) : 0
        }
    };
}

async function performSearches(page, count, isMobile) {
    if (isMobile) {
        console.log('Switching to Mobile Mode...');
        // Pixel 5 User Agent
        await page.setUserAgent('Mozilla/5.0 (Linux; Android 11; Pixel 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.91 Mobile Safari/537.36');
        await page.setViewport({ width: 393, height: 851, isMobile: true });
    } else {
        console.log('Switching to Desktop Mode...');
        await page.setViewport({ width: 1280, height: 800 });
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'); 
    }

    // Go to Bing Home first
    console.log('Navigating to Bing Home...');
    await page.goto('https://www.bing.com/', { waitUntil: 'networkidle2' });
    await delay(2000);

    for (let i = 0; i < count; i++) {
        const query = generateQuery(); 
        console.log(`[${i + 1}/${count}] Typing search: "${query}"`);
        
        try {
            // Select search bar - mobile and desktop usually have different IDs or same, often #sb_form_q
            // Try common selectors
            const searchInput = await page.$('#sb_form_q') || await page.$('input[name="q"]');
            
            if (searchInput) {
                // Clear existing value if any
                await page.evaluate(el => el.value = '', searchInput);
                
                // Type slowly like a human
                await searchInput.type(query, { delay: 100 }); // 100ms delay between keystrokes
                await delay(500);
                
                // Press Enter
                await page.keyboard.press('Enter');
                
                // Wait for navigation
                await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 }).catch(e => console.log('Navigation timeout, continuing...'));
                
                // Scroll a bit to simulate reading
                await page.evaluate(() => {
                    window.scrollBy(0, Math.floor(Math.random() * 300) + 100);
                });
                
                await randomDelay();
            } else {
                console.error("Could not find search bar!");
                // Fallback to direct navigation if element not found, but this shouldn't happen on normal Bing
                await page.goto(`${BING_SEARCH_URL}${encodeURIComponent(query)}`, { waitUntil: 'domcontentloaded' });
                await randomDelay();
            }

        } catch (e) {
            console.error(`Failed specific search: ${query}`, e);
            // Try to recover by going back to home
            try { await page.goto('https://www.bing.com/', { waitUntil: 'networkidle2' }); } catch (err) {}
        }
    }
}

main();
