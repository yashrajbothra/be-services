const { exec } = require('child_process');
const cron = require('node-cron');
const { createClient } = require('redis');

const SITEMAP_URL = "https://boostexpo.com/sitemap.xml"; // Replace with your sitemap URL
const REDIS_PORT = process.env.REDIS_PORT || 6881;

if (!SITEMAP_URL) {
    console.error('Please provide a sitemap URL as an argument.');
    process.exit(1);
}


// 1. Start the Prerender server
const serverProcess = exec(`node server.js --redis-url=redis://localhost:${REDIS_PORT}`);
serverProcess.stdout.on('data', (data) => console.log(`server: ${data}`));
serverProcess.stderr.on('data', (data) => console.error(`server-error: ${data}`));

// 2. Connect to Redis and flush the DB
const redisClient = createClient({ url: `redis://localhost:${REDIS_PORT}` });
redisClient.on('error', (err) => console.log('Redis Client Error', err));

async function flushRedis() {
    await redisClient.connect();
    console.log('Flushing Redis DB...');
    await redisClient.flushDb();
    console.log('Redis DB flushed.');
    await redisClient.quit();
}

flushRedis();

// 3. Schedule the sitemap rendering to run every Sunday at 3 AM IST
cron.schedule('0 3 * * 0', () => {
    console.log('Running scheduled sitemap render (3:00 AM IST)...');
    const renderProcess = exec(`node render-sitemap.js ${SITEMAP_URL}`);
    renderProcess.stdout.on('data', (data) => console.log(`render: ${data}`));
    renderProcess.stderr.on('data', (data) => console.error(`render-error: ${data}`));
}, {
    scheduled: true,
    timezone: "Asia/Kolkata"
});

console.log('Scheduled rendering script started. Waiting for the next scheduled run on Sunday.');
