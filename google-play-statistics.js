require('dotenv').config();
const { Storage } = require('@google-cloud/storage');
const fs = require('fs');
const path = require('path');

const credentialsPath = process.env.GOOGLE_PLAY_SERVICE_ACCOUNT_PATH;
const BUCKET_NAME = process.env.GOOGLE_PLAY_BUCKET_NAME;

const STAT_TYPES = {
    installs: 'stats/installs',
    ratings: 'stats/ratings',
    store_performance: 'stats/store_performance'
};

async function downloadReport(prefix) {
    const storage = new Storage({ keyFilename: credentialsPath });

    const [files] = await storage.bucket(BUCKET_NAME).getFiles({ prefix: prefix + '/' });

    if (files.length === 0) {
        console.log(`No files found for ${prefix}`);
        return null;
    }

    files.sort((a, b) => a.name.localeCompare(b.name));
    const latestFile = files[files.length - 1];

    console.log(`Found: ${latestFile.name}`);

    const isGzipped = latestFile.name.endsWith('.gz');
    const baseName = path.basename(latestFile.name, isGzipped ? '.gz' : '');
    const destination = `./${baseName}${isGzipped ? '.gz' : ''}`;

    await latestFile.download({ destination });
    console.log(`Saved: ${destination}`);

    return destination;
}

async function downloadAllReports() {
    console.log('Config:', { BUCKET_NAME, credentialsPath });
    console.log('Downloading all reports...\n');

    const results = {};

    for (const [type, prefix] of Object.entries(STAT_TYPES)) {
        console.log(`\n=== ${type.toUpperCase()} ===`);
        try {
            const filePath = await downloadReport(prefix);
            results[type] = filePath;
        } catch (error) {
            console.error(`Error downloading ${type}:`, error.message);
            results[type] = null;
        }
    }

    console.log('\n=== SUMMARY ===');
    for (const [type, filePath] of Object.entries(results)) {
        console.log(`${type}: ${filePath || 'FAILED'}`);
    }

    return results;
}

async function downloadLatestReport(type = 'installs') {
    console.log(`Downloading latest ${type} report...\n`);

    const prefix = STAT_TYPES[type];
    if (!prefix) {
        console.error(`Invalid type: ${type}. Valid types: ${Object.keys(STAT_TYPES).join(', ')}`);
        return;
    }

    return downloadReport(prefix);
}

module.exports = { downloadLatestReport, downloadAllReports, STAT_TYPES };