const { AppStoreConnect } = require('appstore-connect-sdk');
const fs = require('fs');

let client = null;

function getClient() {
  if (client) return client;

  const keyId = process.env.APPLE_KEY_ID;
  const issuerId = process.env.APPLE_ISSUER_ID;
  const privateKeyPath = process.env.APPLE_PRIVATE_KEY_PATH;

  if (!keyId || !issuerId || !privateKeyPath) {
    throw new Error('Apple API credentials are not set in .env');
  }

  const privateKey = fs.readFileSync(privateKeyPath, 'utf8');

  client = new AppStoreConnect({
    keyId,
    issuerId,
    privateKey
  });

  return client;
}

async function getReviews(bundleId) {
  const api = getClient();

  const response = await api.reviews.list({ filter: { bundleId } });

  const reviews = response.data.map(review => ({
    id: review.id,
    rating: review.attributes.rating,
    title: review.attributes.title,
    body: review.attributes.body,
    created: review.attributes.created,
    reviewerNickname: review.attributes.reviewerNickname
  }));

  return { reviews };
}

async function postReviewReply(bundleId, reviewId, text) {
  const api = getClient();

  const response = await api.reviewResponses.create({
    data: {
      attributes: {
        responseBody: text
      },
      relationships: {
        review: {
          data: { id: reviewId, type: 'reviews' }
        }
      }
    }
  });

  return response.data;
}

module.exports = { getReviews, postReviewReply };