import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import express, { Request, Response } from 'express';
import cors from 'cors';

// Initialize Firebase Admin SDK
admin.initializeApp();

// Create Express app
const app = express();
app.use(cors({ origin: true }));

/**
 * Link Preview Function
 *
 * This serves HTML with Open Graph meta tags for rich social media previews.
 * When someone shares /p/:pollId on WhatsApp/Discord/Slack, this function:
 * 1. Fetches poll data from Firestore
 * 2. Returns HTML with og:title, og:description, og:image tags
 * 3. Redirects human browsers to Angular app
 *
 * Social media crawlers see the meta tags, humans see the Angular app.
 */
app.get('/:pollId', async (req: Request, res: Response) => {
  const pollId = Array.isArray(req.params.pollId) ? req.params.pollId[0] : req.params.pollId;

  console.log(`Link preview requested for poll: ${pollId}`);

  try {
    // Fetch poll from Firestore
    const pollSnapshot = await admin
      .firestore()
      .collection('polls')
      .doc(pollId)
      .get();

    // If poll doesn't exist, redirect to homepage
    if (!pollSnapshot.exists) {
      console.log(`Poll ${pollId} not found`);
      const appUrl = getAppUrl(req);
      return res.redirect(302, appUrl);
    }

    const poll = pollSnapshot.data();

    // Extract poll data with fallbacks
    const title = poll?.title || 'QuickPoll';
    const options = poll?.options || [];
    const optionsCount = options.length;

    // Build description
    const description = optionsCount > 0
      ? `🗳️ ${optionsCount} options • Vote now!`
      : 'Cast your vote!';

    // Escape HTML to prevent XSS
    const safeTitle = escapeHtml(title);
    const safeDescription = escapeHtml(description);

    // Build URLs
    const appUrl = getAppUrl(req);
    const pollUrl = `${appUrl}/poll/${pollId}`;
    const ogImageUrl = `${appUrl}/assets/og-default.png`;

    // Serve HTML with Open Graph tags
    res.status(200).send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${safeTitle}</title>

  <!-- Primary Meta Tags -->
  <meta name="title" content="${safeTitle}">
  <meta name="description" content="${safeDescription}">

  <!-- Open Graph / Facebook / WhatsApp -->
  <meta property="og:type" content="website">
  <meta property="og:url" content="${pollUrl}">
  <meta property="og:title" content="${safeTitle}">
  <meta property="og:description" content="${safeDescription}">
  <meta property="og:image" content="${ogImageUrl}">

  <!-- Twitter -->
  <meta property="twitter:card" content="summary_large_image">
  <meta property="twitter:url" content="${pollUrl}">
  <meta property="twitter:title" content="${safeTitle}">
  <meta property="twitter:description" content="${safeDescription}">
  <meta property="twitter:image" content="${ogImageUrl}">

  <!-- Immediate redirect to Angular app -->
  <meta http-equiv="refresh" content="0;url=${pollUrl}">
  <script>window.location.replace('${pollUrl}');</script>

  <style>
    body {
      font-family: system-ui, -apple-system, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }
    .loader {
      text-align: center;
    }
    .spinner {
      border: 4px solid rgba(255,255,255,0.3);
      border-radius: 50%;
      border-top: 4px solid white;
      width: 40px;
      height: 40px;
      animation: spin 1s linear infinite;
      margin: 0 auto 20px;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  </style>
</head>
<body>
  <div class="loader">
    <div class="spinner"></div>
    <p>Loading poll...</p>
    <p><small>If not redirected, <a href="${pollUrl}" style="color: white;">click here</a></small></p>
  </div>
</body>
</html>
    `);

  } catch (error) {
    console.error('Error in link preview function:', error);
    const appUrl = getAppUrl(req);
    res.redirect(302, appUrl);
  }
});

/**
 * Get the app URL from request or use Firebase hosting URL
 */
function getAppUrl(req: Request): string {
  // In production, use your Firebase hosting URL
  // For local testing, use localhost
  const host = req.get('host') || '';

  if (host.includes('localhost')) {
    return 'http://localhost:4200';
  }

  // Replace with YOUR actual Firebase hosting URL after first deploy
  // You'll get this URL after running: firebase deploy --only hosting
  return `https://${req.get('host')}`;
}

/**
 * Escape HTML to prevent XSS attacks
 */
function escapeHtml(text: string): string {
  const map: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

// Export the Express app as a Cloud Function
export const linkPreview = functions.https.onRequest(app);
