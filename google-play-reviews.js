const { androidpublisher } = require('@googleapis/androidpublisher');
const { GoogleAuth } = require('google-auth-library');

let publisher = null;

function getPublisher() {
  if (publisher) return publisher;

  const credentialsPath = process.env.GOOGLE_PLAY_SERVICE_ACCOUNT_PATH;

  if (!credentialsPath) {
    throw new Error('GOOGLE_PLAY_SERVICE_ACCOUNT_PATH is not set in .env');
  }

  const auth = new GoogleAuth({
    keyFilename: credentialsPath,
    scopes: ['https://www.googleapis.com/auth/androidpublisher']
  });

  publisher = androidpublisher({ version: 'v3', auth });
  return publisher;
}

async function getReviews(packageName) {
  const response = await getPublisher().reviews.list({
    packageName
  });

  return {
    reviews: response.data.reviews || []
  };
}

async function postReviewReply(packageName, reviewId, text) {
  const response = await getPublisher().reviews.reply({
    packageName,
    reviewId,
    requestBody: { replyText: text }
  });

  return response.data;
}

module.exports = { getReviews, postReviewReply };