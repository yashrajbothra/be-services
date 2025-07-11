const axios = require('axios');
const { parseStringPromise } = require('xml2js');

const SITEMAP_URL = "http://localhost:5173/sitemap.xml"; // Replace with your sitemap URL
const PRERENDER_SERVER = 'http://localhost:3000';

if (!SITEMAP_URL) {
    console.error('Please provide a sitemap URL as an argument.');
    process.exit(1);
}

async function main() {
    try {
        console.log(`Fetching sitemap from ${SITEMAP_URL}`);
        const { data: sitemapXml } = await axios.get(SITEMAP_URL);

        console.log('Parsing sitemap...');
        const result = await parseStringPromise(sitemapXml);
        const urls = result.urlset.url.map(urlEntry => urlEntry.loc[0]);

        console.log(`Found ${urls.length} URLs to prerender.`);

        for (const url of urls) {
            try {
                console.log(`Prerendering ${url}`);
                await axios.get(`${PRERENDER_SERVER}/render?url=${url}`);
                console.log(`Successfully prerendered ${url}`);
            } catch (error) {
                console.error(`Error prerendering ${url}:`, error.message);
            }
        }

        console.log('Finished prerendering all URLs in the sitemap.');

    } catch (error) {
        console.error('An error occurred:', error.message);
        process.exit(1);
    }
}

main();
