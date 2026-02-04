# QuickPoll

Fast group decision polling app with real-time results and social media link previews.

## 🚀 Quick Links

- **[📖 Product Vision](docs/PRODUCT.md)** - Strategy, features & distribution plan
- **[✅ Progress Tracker](docs/steps.md)** - Phase 0 complete checklist
- **[🛠️ Technical Roadmap](docs/ROADMAP.md)** - Full implementation guide
- **[🔗 Live Cloud Function](https://us-central1-quickpoll-app-f3fed.cloudfunctions.net/linkPreview/test123)** - Test link preview

## 📦 Tech Stack

- **Frontend:** Angular 21.1 + Material Design
- **Backend:** Firebase (Firestore, Cloud Functions, Hosting)
- **Real-time:** Firestore subscriptions
- **PWA:** Service Worker enabled
- **Link Previews:** Express Cloud Function with Open Graph

## 🎯 Current Status

**Phase 0: Infrastructure Setup** ✅ **COMPLETE & DEPLOYED**
- ✅ Firebase configured and deployed
- ✅ Angular app deployed to hosting
- ✅ Link preview function with bot detection
- ✅ Open Graph meta tags working (verified on Facebook)
- ✅ PWA support enabled
- ✅ OG image accessible

**Phase 1-4: App Development** 🔜 **NEXT**
- See [ROADMAP.md](docs/ROADMAP.md) for detailed plan

## 🔧 Development

```bash
# Install dependencies
npm install

# Run dev server
ng serve

# Build for production
ng build

# Deploy to Firebase
firebase deploy
```

## 📁 Project Structure

```
quickpoll/
├── src/
│   ├── app/              # Angular application
│   ├── assets/           # Static assets (OG image)
│   └── environments/     # Firebase config
├── functions/            # Cloud Functions
│   └── src/
│       └── index.ts      # Link preview function
├── docs/                 # Documentation
│   ├── steps.md         # Progress tracker
│   └── ROADMAP.md       # Full development guide
├── firebase.json         # Firebase configuration
└── package.json
```

## 📖 Documentation

All documentation is in the [`docs/`](docs/) folder:

- **[PRODUCT.md](docs/PRODUCT.md)** - Product vision, strategy & distribution
- **[steps.md](docs/steps.md)** - Quick progress tracker (Phase 0 ✅)
- **[ROADMAP.md](docs/ROADMAP.md)** - Technical implementation guide
- **[docs/README.md](docs/README.md)** - Documentation index

**New to the project?** Start with [PRODUCT.md](docs/PRODUCT.md) to understand the vision.

## 🔗 Key URLs

- **Live App:** https://quickpoll-app-f3fed.web.app
- **Repository:** https://github.com/ioanaugustin/quickpoll
- **Firebase Project:** quickpoll-app-f3fed
- **Cloud Function:** https://us-central1-quickpoll-app-f3fed.cloudfunctions.net/linkPreview

## 📝 License

Private project
