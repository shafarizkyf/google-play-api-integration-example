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

### Run All Features

```bash
# Download latest install statistics
node -e "require('./google-play-statistics').downloadLatestReport()"

# Get reviews and reply
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

### getStats(packageName)

Returns install statistics (requires "View app information" permission in Play Console).

```javascript
const stats = await getStats('com.example.app');
// { dailyInstalls: [...], totalInstalls: 1000 }
```

---

## Google Play Statistics (GCS)

Download daily reports from Google Cloud Storage.

### Setup

1. Ensure your service account has access to the GCS bucket
2. Get your bucket name from Play Console: **Downloads** > **Statistics exports**
3. Bucket name format: `pubsite_prod_{DEVELOPER_ID}`

Add to `.env`:

```env
GOOGLE_PLAY_BUCKET_NAME=pubsite_prod_6229801975270715472
```

### Available Reports

| Type | Description | File |
|------|-------------|------|
| installs | Daily install/uninstall counts | `installs_*.csv` |
| ratings | User ratings breakdown | `ratings_*.csv` |
| store_performance | Traffic sources, installs, conversions | `total_store_performance_*.csv` |

### Usage

```javascript
const { downloadLatestReport, downloadAllReports } = require('./google-play-statistics');

async function main() {
  // Download all 3 report types
  const results = await downloadAllReports();

  // Or download specific type
  const filePath = await downloadLatestReport('installs');
  const ratingsPath = await downloadLatestReport('ratings');
  const storePath = await downloadLatestReport('store_performance');
}

main().catch(console.error);
```

### Run

```bash
# Download all reports
node -e "require('./google-play-statistics').downloadAllReports()"

# Download specific type
node -e "require('./google-play-statistics').downloadLatestReport('installs')"
node -e "require('./google-play-statistics').downloadLatestReport('ratings')"
node -e "require('./google-play-statistics').downloadLatestReport('store_performance')"
```

---

# Apple App Store API Integration

This project also provides functions to get reviews and post replies from the Apple App Store.

## Setup

### Prerequisites

1. Apple Developer Program membership
2. App Store Connect account

### Step 1: Create API Key

1. Go to [App Store Connect](https://appstoreconnect.apple.com/)
2. Go to **Users and Access** > **Keys**
3. Click **+** to create a new key
4. Fill in the details:
   - Name: `app-store-review-bot`
   - Access: **App Manager** (or **Developer** with review access)
5. Download the private key (`.p8` file) - **only available once!**
6. Note your:
   - **Key ID** (shown after creation)
   - **Issuer ID** (shown at top of the page)

### Step 2: Get Bundle ID

Your bundle ID is in Xcode (e.g., `com.example.myapp`) or in App Store Connect under your app's information.

### Step 3: Configure Environment

Add to your `.env` file:

```env
# Apple App Store
APPLE_KEY_ID=YourKeyID
APPLE_ISSUER_ID=YourIssuerID
APPLE_PRIVATE_KEYPath=./AuthKey_YourKeyID.p8
APPLE_BUNDLE_ID=com.example.myapp
```

## Usage

```javascript
const { getReviews, postReviewReply } = require('./app-store-reviews');

async function main() {
  const BUNDLE_ID = process.env.APPLE_BUNDLE_ID;

  // Get reviews
  const result = await getReviews(BUNDLE_ID);
  console.log(result.reviews);

  // Reply to a review
  await postReviewReply(BUNDLE_ID, 'review-id-123', 'Thank you for your feedback!');
}

main().catch(console.error);
```

## API Reference

### getReviews(bundleId)

Returns reviews for the app.

```javascript
const { reviews, cursor } = await getReviews('com.example.app');
```

### postReviewReply(bundleId, reviewId, text)

Reply to an existing review.

```javascript
await postReviewReply('com.example.app', 'review-id-123', 'Thanks!');
```

---

## Security Notes

- Never commit your private key to version control
- Add `*.p8` and `.env` to `.gitignore`
- Rotate keys periodically