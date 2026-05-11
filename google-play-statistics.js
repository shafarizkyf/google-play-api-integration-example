require('dotenv').config();
const { Storage } = require('@google-cloud/storage');
const fs = require('fs');

const credentialsPath = process.env.GOOGLE_PLAY_SERVICE_ACCOUNT_PATH;
const BUCKET_NAME = process.env.GOOGLE_PLAY_BUCKET_NAME;
const PREFIX = (process.env.GOOGLE_PLAY_STAT_PREFIX || 'stats/installs') + '/';

async function downloadLatestReport() {
    console.log('Config:', { BUCKET_NAME, PREFIX, credentialsPath });

    if (!BUCKET_NAME) {
        console.error('GOOGLE_PLAY_BUCKET_NAME is not set');
        return;
    }

    const storage = new Storage({ keyFilename: credentialsPath });

    try {
        const bucket = storage.bucket(BUCKET_NAME);
        const [files] = await bucket.getFiles({ prefix: PREFIX });

        if (files.length === 0) {
            console.log('No files found in the specified path.');
            return;
        }

        files.sort((a, b) => a.name.localeCompare(b.name));
        const latestFile = files[files.length - 1];

        console.log(`Found latest report: ${latestFile.name}`);

        const isGzipped = latestFile.name.endsWith('.gz');
        const destination = isGzipped ? './latest_installs.csv.gz' : './latest_installs.csv';
        await latestFile.download({ destination });

        console.log(`Successfully downloaded to ${destination}`);

        if (isGzipped) {
            console.log('File is gzipped. Use: gunzip latest_installs.csv.gz to extract');
        }
        return destination;
    } catch (error) {
        console.error('Error accessing GCS:', error.message);
    }
}


module.exports = { downloadLatestReport };