#!/usr/bin/env node

// Load environment variables from .env file
require('dotenv').config();

// Import the prerender server and the Puppeteer renderer
const prerender = require('prerender');
const PuppeteerRenderer = require('@prerenderer/renderer-puppeteer');

// Import @sparticuz/chromium for pre-built Chromium binaries compatible with AWS environments
const chromium = require('@sparticuz/chromium');

// Define the port for the prerender server, defaulting to 4000
const port = process.env.PORT || 4000;

// We need an async function to correctly await chromium.executablePath()
async function startPrerenderServer() {
    let chromeExecutablePath;

    // Always use the path provided by @sparticuz/chromium
    try {
        chromeExecutablePath = await chromium.executablePath();
    } catch (error) {
        console.error('Error getting Chromium executable path from @sparticuz/chromium:', error);
        console.error('Please ensure @sparticuz/chromium is correctly installed and compatible with your environment.');
        process.exit(1); // Exit if we can't get the executable path
    }

    // Initialize the prerender server
    const server = prerender({
        port: port
    });

    // Configure the Puppeteer renderer to use the resolved Chromium executable path
    const renderer = new PuppeteerRenderer({
        executablePath: chromeExecutablePath, // Now this is a direct string path
        launchOptions: {
            headless: chromium.headless, // Use chromium.headless for consistency
            args: chromium.args,        // Use chromium.args for recommended flags
        },
        maxConcurrentRoutes: 2,       // Optional: control concurrency of rendering
        renderAfterElementExists: '#app', // Optional: wait until this selector appears
        renderAfterTime: 5000,        // Optional: fallback wait time in milliseconds
    });

    // Use the configured renderer with the prerender server
    server.use(renderer);

    // Add Redis caching middleware (ensure you have Redis configured and running)
    server.use(require('prerender-redis-cache'));

    // Your existing middleware (optional)
    server.use(prerender.sendPrerenderHeader());
    server.use(prerender.browserForceRestart());
    server.use(prerender.addMetaTags());
    server.use(prerender.removeScriptTags());
    server.use(prerender.httpHeaders());

    // Start the prerender server
    server.start();

    console.log(`Prerender server started on port ${port}`);
    console.log(`Using Chromium from: ${chromeExecutablePath}`); // Now logs the actual path
}

// Call the async function to start the server
startPrerenderServer().catch(error => {
    console.error('Failed to start prerender server:', error);
    process.exit(1);
});
