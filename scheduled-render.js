require('dotenv').config();
const { exec } = require('child_process');
const cron = require('node-cron');
const { createClient } = require('redis');

const SITEMAP_URL = "https://boostexpo.com/sitemap.xml"; // Replace with your sitemap URL

if (!SITEMAP_URL) {
    console.error('Please provide a sitemap URL as an argument.');
    process.exit(1);
}


// 1. Start the Prerender server
const serverProcess = exec(`node lib/server.js --redis-url=${process.env.REDIS_URL}`);
serverProcess.stdout.on('data', (data) => console.log(`server: ${data}`));
serverProcess.stderr.on('data', (data) => console.error(`server-error: ${data}`));

// 2. Connect to Redis and flush the DB
const redisClient = createClient(process.env.REDIS_URL);
redisClient.on('error', (err) => console.log('Redis Client Error', err));

redisClient.on('ready', () => {
    console.log('Redis client ready.');
    console.log('Flushing Redis DB...');
    redisClient.flushdb((err, succeeded) => {
        if (err) {
            console.error('Error flushing Redis DB:', err);
        } else {
            console.log('Redis DB flushed:', succeeded);
            const renderProcess = exec(`node render-sitemap.js`);
            renderProcess.stdout.on('data', (data) => console.log(`render: ${data}`));
            renderProcess.stderr.on('data', (data) => console.error(`render-error: ${data}`));
        }
        redisClient.quit();
    });
});

// 3. Schedule the sitemap rendering to run every Sunday at 3 AM IST
cron.schedule('0 3 * * 0', () => {
    console.log('Running scheduled sitemap render (3:00 AM IST)...');
    const renderProcess = exec(`node render-sitemap.js`);
    renderProcess.stdout.on('data', (data) => console.log(`render: ${data}`));
    renderProcess.stderr.on('data', (data) => console.error(`render-error: ${data}`));
}, {
    scheduled: true,
    timezone: "Asia/Kolkata"
});

console.log('Scheduled rendering script started. Waiting for the next scheduled run on Sunday.');
