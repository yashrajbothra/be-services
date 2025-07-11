#!/usr/bin/env node
const prerender = require('prerender');
const PuppeteerRenderer = require('@prerenderer/renderer-puppeteer');
const CHROME_PATH = process.env.CHROME_PATH;

const server = prerender();

const renderer = new PuppeteerRenderer({
    executablePath: CHROME_PATH,
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
