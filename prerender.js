#!/usr/bin/env node
require('dotenv').config();
const prerender = require('prerender');
const PuppeteerRenderer = require('@prerenderer/renderer-puppeteer');
const CHROME_PATH = process.env.CHROME_PATH;
const chromium = require('@sparticuz/chromium');

const server = prerender({
    port: process.env.PORT || 4000
});

const renderer = new PuppeteerRenderer({
    executablePath: CHROME_PATH || (async () => {
        // If CHROME_PATH is not set, use the path from @sparticuz/chromium
        // This ensures compatibility with environments where Chromium is not globally installed
        return await chromium.executablePath();
    })(),
    launchOptions: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    },
    maxConcurrentRoutes: 2,       // optional concurrency control
    renderAfterElementExists: '#app', // wait until this selector appears
    renderAfterTime: 5000,        // fallback wait
});

server.use(renderer);
server.use(require('prerender-redis-cache'));
// Your existing middleware (optional)
server.use(prerender.sendPrerenderHeader());
server.use(prerender.browserForceRestart());
server.use(prerender.addMetaTags());
server.use(prerender.removeScriptTags());
server.use(prerender.httpHeaders());

server.start();
