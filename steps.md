Phase 0 Complete Setup Guide - Steps 3-11
You've successfully installed Angular Fire and Firebase. Here's the complete remaining setup.

## 📋 Quick Progress Tracker
- [x] Step 3: Configure Firebase in Angular
  - [x] 3.1: Get Firebase Config
  - [x] 3.2: Create Environment Files
  - [x] 3.3: Add Firebase Config to Environment Files
  - [x] **🎯 CHECKPOINT: Push to GitHub** ✅
  - [x] 3.4: Configure App to Use Firebase ✅
- [x] Step 4: Add PWA Support ✅
- [x] Step 5: Install Additional Libraries ✅
- [x] Step 6: UI Framework (Using Angular Material instead) ✅
- [x] Step 7: Test Angular App ✅
- [x] Step 8: Initialize Firebase CLI ✅
- [x] Step 9: Link Project to Firebase ✅
- [x] Step 10: Install Express in Functions ✅
- [x] Step 11: Write Link Preview Function ✅
- [x] Step 12: Configure Firebase Hosting ✅
- [x] Step 13: Create Default OG Image ✅
- [x] Step 14: Build and Deploy Functions ✅
- [ ] **Step 15: Create Test Poll** ⬅️ MANUAL ACTION REQUIRED
- [ ] Step 16: Test Cloud Function
- [ ] Step 17: Update Firestore Rules

---

Step 3: Configure Firebase in Angular ✅
Step 3.1: Get Your Firebase Config ✅

Go to Firebase Console: https://console.firebase.google.com/
Select your quickpoll project
Click ⚙️ (gear icon) → Project settings
Scroll down to "Your apps" section
Click the Web icon (</>) if you haven't added a web app yet

App nickname: QuickPoll Web
Check "Also set up Firebase Hosting"
Click Register app


Copy the firebaseConfig object

It looks like this:
javascriptconst firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "quickpoll-xxxxx.firebaseapp.com",
  projectId: "quickpoll-xxxxx",
  storageBucket: "quickpoll-xxxxx.firebasestorage.app",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456"
};

Step 3.2: Create Environment Files ✅
powershell# Create environments folder
mkdir src\environments

# Create development environment file
New-Item -Path "src\environments\environment.ts" -ItemType File

# Create production environment file
New-Item -Path "src\environments\environment.prod.ts" -ItemType File

Step 3.3: Add Firebase Config to Environment Files ✅
Open src/environments/environment.ts and paste:
typescriptexport const environment = {
  production: false,
  firebase: {
    apiKey: "YOUR_API_KEY",
    authDomain: "quickpoll-xxxxx.firebaseapp.com",
    projectId: "quickpoll-xxxxx",
    storageBucket: "quickpoll-xxxxx.firebasestorage.app",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:abcdef123456"
  }
};
Replace the firebase object with YOUR actual config from Firebase Console.

Open src/environments/environment.prod.ts and paste the same:
typescriptexport const environment = {
  production: true,
  firebase: {
    apiKey: "YOUR_API_KEY",
    authDomain: "quickpoll-xxxxx.firebaseapp.com",
    projectId: "quickpoll-xxxxx",
    storageBucket: "quickpoll-xxxxx.firebasestorage.app",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:abcdef123456"
  }
};

---

## 🎯 CHECKPOINT: Push to GitHub ✅
This is a good point to save your work to GitHub before continuing.

### Step 3.3.1: Create GitHub Repository ✅

1. Go to https://github.com/new
2. Repository name: `quickpoll`
3. Description: `QuickPoll - Fast group decision polling app with Firebase`
4. Keep it **Public** (Firebase API keys are safe in public repos)
5. **DO NOT** check "Initialize with README" (you already have files)
6. Click **Create repository**

### Step 3.3.2: Push to GitHub ✅

```powershell
# Check current status
git status

# Add all files (including environment files - they're safe)
git add .

# Create initial commit
git commit -m "Initial Angular setup with Firebase configuration

- Set up Angular project with AngularFire
- Configured Firebase environment files (dev & prod)
- Added project dependencies and structure
- Completed Phase 0 Steps 3.1-3.3"

# Add GitHub remote (replace YOUR_USERNAME with your actual GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/quickpoll.git

# Rename branch to main (if needed)
git branch -M main

# Push to GitHub
git push -u origin main
```

### Expected Output:
```
Enumerating objects: XX, done.
Counting objects: 100% (XX/XX), done.
Writing objects: 100% (XX/XX), XXX KiB | XXX MiB/s, done.
Total XX (delta X), reused X (delta X)
To https://github.com/YOUR_USERNAME/quickpoll.git
 * [new branch]      main -> main
```

✅ Your code is now backed up on GitHub!

**Note:** Firebase API keys in environment files are safe to commit. They're protected by Firebase Security Rules on the backend.

---

Step 3.4: Configure App to Use Firebase ✅
Open src/app/app.config.ts and replace entire content with:
typescriptimport { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { environment } from '../environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
  ]
};

Step 4: Add PWA Support ✅
powershellng add @angular/pwa --skip-confirmation
This adds:

Service worker for offline functionality
Web manifest for "install app" prompt
App icons in various sizes


Step 5: Install Additional Libraries ✅
powershell# Chart library for results visualization
npm install chart.js --legacy-peer-deps

# QR code generation
npm install qrcode --legacy-peer-deps
npm install --save-dev @types/qrcode

# HTML to image (for shareable results)
npm install html2canvas --legacy-peer-deps
npm install --save-dev @types/html2canvas

Step 6: UI Framework - Angular Material ✅
(Original guide suggested Tailwind CSS, but we're using Angular Material instead)

powershell# Install Angular Material
npm install @angular/material @angular/cdk @angular/animations --legacy-peer-deps

Configuration applied:
✅ Added animations provider to app.config.ts
✅ Added Material theme (Indigo/Pink) to styles.scss
✅ Added Roboto font and Material Icons to index.html

Angular Material provides:
- Pre-built Material Design components
- Theming system with primary (Indigo) and accent (Pink) colors
- Built-in accessibility
- Responsive layouts

Step 7: Test Angular App Works ✅
powershellng serve
Wait for compilation (~20 seconds), then open browser to: http://localhost:4200
You should see the default Angular welcome page.
Press Ctrl+C to stop the server.

Step 8: Initialize Firebase CLI ✅
powershell# Install Firebase CLI globally
npm install -g firebase-tools

# Login to Firebase
firebase login
Browser will open - authenticate with your Google account.

Step 9: Link Project to Firebase
powershell# Initialize Firebase in your project
firebase init
```

### You'll be asked questions:

**Question 1: Which Firebase features?**
```
? Which Firebase features do you want to set up for this directory?
  ◯ Realtime Database
  ◯ Firestore
  ◉ Functions
  ◉ Hosting
  ◯ Storage
```

**Use spacebar to select:**
- ☑ Functions
- ☑ Hosting

**Press Enter**

---

**Question 2: Use an existing project?**
```
? Please select an option:
❯ Use an existing project
  Create a new project
```

**Select:** `Use an existing project`  
**Press Enter**

---

**Question 3: Select your project**
```
? Select a default Firebase project:
❯ quickpoll-xxxxx (QuickPoll)
```

**Select your project**  
**Press Enter**

---

**Question 4: What language for Functions?**
```
? What language would you like to use to write Cloud Functions?
❯ TypeScript
  JavaScript
```

**Select:** `TypeScript`  
**Press Enter**

---

**Question 5: Use ESLint?**
```
? Do you want to use ESLint to catch probable bugs and enforce style?
```

**Type:** `Y` and press Enter

---

**Question 6: Install dependencies?**
```
? Do you want to install dependencies with npm now?
```

**Type:** `Y` and press Enter

Wait for installation (~30 seconds)

---

**Question 7: What do you want to use as your public directory?**
```
? What do you want to use as your public directory?
```

**Type:** `dist/quickpoll/browser` and press Enter

**IMPORTANT:** This must match Angular's build output directory.

---

**Question 8: Configure as single-page app?**
```
? Configure as a single-page app (rewrite all urls to /index.html)?
```

**Type:** `y` and press Enter

---

**Question 9: Set up automatic builds?**
```
? Set up automatic builds and deploys with GitHub?
```

**Type:** `N` and press Enter (we'll deploy manually)

---

**Question 10: Overwrite index.html?**
```
? File dist/quickpoll/browser/index.html already exists. Overwrite?
Type: N and press Enter (keep Angular's index.html)

Step 10: Install Express in Functions
powershell# Navigate to functions directory
cd functions

# Install Express and CORS
npm install express cors
npm install --save-dev @types/express @types/cors

# Go back to project root
cd ..

Step 11: Write the Link Preview Cloud Function
Open functions/src/index.ts and DELETE EVERYTHING, then paste this:
typescriptimport * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as express from 'express';
import * as cors from 'cors';

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
app.get('/:pollId', async (req, res) => {
  const pollId = req.params.pollId;
  
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
function getAppUrl(req: express.Request): string {
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

Step 12: Configure Firebase Hosting Rewrites
Open firebase.json in project root and replace entire content with:
json{
  "hosting": {
    "public": "dist/quickpoll/browser",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "/p/:pollId",
        "function": "linkPreview"
      },
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**/*.@(jpg|jpeg|gif|png|svg|webp|ico)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "public, max-age=604800"
          }
        ]
      },
      {
        "source": "**/*.@(js|css)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "public, max-age=86400"
          }
        ]
      }
    ]
  },
  "functions": {
    "source": "functions",
    "runtime": "nodejs20"
  }
}
What this does:

/p/:pollId → Runs Cloud Function for link previews
Everything else → Serves Angular app
Sets cache headers for performance


Step 13: Create Default OG Image
You need a default image for social media previews.
Option 1: Download a Template

Go to https://www.canva.com
Create 1200x630px image
Add text: "QuickPoll - Fast Group Decisions"
Download as PNG
Save to src/assets/og-default.png

Option 2: Use Placeholder
Create src/assets/og-default.png with any 1200x630px image for now.

Step 14: Build and Deploy Functions
powershell# Build the functions
cd functions
npm run build
cd ..

# Deploy only functions (first time)
firebase deploy --only functions
```

Wait 1-2 minutes. You'll see:
```
✔  functions[linkPreview(us-central1)] Successful create operation.
Function URL: https://us-central1-quickpoll-xxxxx.cloudfunctions.net/linkPreview
```

**Copy that URL** - you'll use it for testing.

---

## Step 15: Create Test Poll in Firestore

1. Go to **Firebase Console** → **Firestore Database**
2. Click **Start collection**
3. Collection ID: `polls`
4. Click **Next**
5. Document ID: `test123`
6. Add these fields:
   - `title` (string): `Where should we eat?`
   - `options` (array): 
     - Item 0: `Pizza`
     - Item 1: `Sushi`  
     - Item 2: `Burgers`
   - `createdAt` (timestamp): Click "Set to current time"
   - `createdBy` (string): `test-user`
7. Click **Save**

---

## Step 16: Test the Cloud Function

Open browser to:
```
https://us-central1-quickpoll-xxxxx.cloudfunctions.net/linkPreview/test123
Replace quickpoll-xxxxx with your project ID
You should see:

Loading spinner
Redirects to Angular app (will show 404 for now - that's normal)
View page source - you'll see Open Graph meta tags


Step 17: Update Firestore Security Rules

Go to Firebase Console → Firestore Database
Click Rules tab
Replace with:

javascriptrules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Temporary dev rules - will improve in Phase 1
    match /polls/{pollId} {
      allow read: if true;
      allow create: if request.auth != null;
    }
    
    match /votes/{pollId}/votes/{voteId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    match /results/{pollId} {
      allow read: if true;
      allow write: if false; // Only Cloud Functions write here
    }
  }
}

Click Publish


✅ Phase 0 Complete Checklist
Verify you have:

✅ Angular project created
✅ Firebase and AngularFire installed
✅ Environment files configured with Firebase config
✅ PWA support added
✅ Chart.js, QRCode, html2canvas installed
✅ Firebase CLI installed and logged in
✅ Cloud Functions initialized and deployed
✅ Link preview function working
✅ Firebase hosting configured
✅ Test poll created in Firestore
✅ Security rules configured

Total setup time: 2-3 hours

What's Next: Phase 1
Phase 1 will build:

Complete data models (TypeScript interfaces)
Poll creation service
Voting logic with duplicate prevention
Real-time results with Chart.js
Proper security rules