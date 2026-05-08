require('dotenv').config();
const { getReviews, postReviewReply } = require('./google-play-reviews');

const PACKAGE_NAME = process.env.GOOGLE_PLAY_PACKAGE_NAME;

async function main() {
  console.log('Fetching reviews...\n');

  const result = await getReviews(PACKAGE_NAME);

  console.log(`Found ${result.reviews.length} reviews\n`);

  for (const review of result.reviews) {
    const r = review;
    console.log(`Review ID: ${r.reviewId}`);
    console.log(`  Author: ${r.authorName}`);
    console.log(`  Rating: ${r.stars} stars`);
    console.log(`  Comment: ${r.comments?.[0]?.userComment?.text || 'N/A'}`);
    console.log(`  Device: ${r.comments?.[0]?.userComment?.deviceMetadata?.productName || 'N/A'}`);
    console.log('');
  }

  if (result.reviews.length > 0) {
    const firstReview = result.reviews[0];
    if (firstReview.reviewId) {
      console.log(`Replying to first review (${firstReview.reviewId})...\n`);

      const replyResult = await postReviewReply(PACKAGE_NAME, firstReview.reviewId, 'Thank you for your feedback!');
      console.log('Reply sent successfully:', replyResult);
    }
  } else {
    console.log('No reviews found. Check if:\n');
    console.log('  1. Your app has reviews in the Play Store');
    console.log('  2. Your service account has "Reviewer" permission in Play Console > App > API access');
  }
}

main().catch(console.error);