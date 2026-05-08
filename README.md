# Google Play API Integration

This project provides simple functions to get reviews and post replies from the Google Play Store.

## Setup

### Prerequisites

1. Google Play Developer Account
2. Google Cloud Platform (GCP) project with billing enabled

### Step 1: Enable Google Play Developer API

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select or create a new project
3. Search for "Google Play Android Developer API" and enable it

### Step 2: Create Service Account

1. In Google Cloud Console, go to **IAM & Admin** > **Service Accounts**
2. Click **Create Service Account**
3. Fill in the details:
   - Name: `google-play-review-bot`
   - Role: **Viewer** (for reading reviews) or **Play Console Developer** (for full access)
4. Click **Create**
5. In the keys section, click **Add Key** > **Create new key**
6. Select **JSON** format and download the file
7. Save this file securely (e.g., `service-account.json`)

### Step 3: Grant Access in Google Play Console

1. Go to [Google Play Console](https://play.google.com/console/)
2. Select your app
3. Go to **Release** > **Setup** > **API access**
4. Click **Link a Google Cloud project** and select your GCP project
5. Under **Service accounts**, add your service account with "Reviewer" access

### Step 4: Get Package Name

Your package name is in `app/build.gradle` (Android) or your app's identifier in the Play Console. Example: `com.example.myapp`

### Step 5: Configure Environment

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env` with your details:

```env
GOOGLE_PLAY_SERVICE_ACCOUNT_PATH=./service-account.json
GOOGLE_PLAY_PACKAGE_NAME=com.example.myapp
```

## Usage

```javascript
const { getReviews, postReviewReply } = require('./google-play-reviews');

async function main() {
  const PACKAGE_NAME = process.env.GOOGLE_PLAY_PACKAGE_NAME;

  // Get reviews (paginated)
  const result = await getReviews(PACKAGE_NAME);
  console.log(result.reviews);

  // Reply to a review
  await postReviewReply(PACKAGE_NAME, 'review-id-123', 'Thank you for your feedback!');
}

main().catch(console.error);
```

## Run Example

```bash
npm run test
```

## API Reference

### getReviews(packageName, pageToken?)

Returns paginated reviews.

```javascript
const { reviews, nextPageToken } = await getReviews('com.example.app');
```

### postReviewReply(packageName, reviewId, text)

Reply to an existing review.

```javascript
await postReviewReply('com.example.app', 'review-id-123', 'Thanks!');
```

## Security Notes

- Never commit your service account JSON file to version control
- Add `service-account.json` and `.env` to `.gitignore`
- Rotate keys periodically