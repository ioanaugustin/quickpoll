# QuickPoll Development Roadmap

**Technical implementation guide based on expert assessment + real implementation.**

> 📖 **See also:** [PRODUCT.md](PRODUCT.md) for product vision & strategy

---

## ✅ Phase 0: Critical Setup (COMPLETE - Day 1)

### Firebase Project Setup ✅
- [x] Firebase project created: `quickpoll-app-f3fed`
- [x] Firestore enabled (EU region)
- [x] Authentication configured (Anonymous ready)
- [x] Firebase Hosting enabled
- [x] Cloud Functions deployed
- [x] Analytics ready

### Angular Setup ✅
```bash
✅ ng new quickpoll --standalone --routing --style=scss
✅ ng add @angular/pwa
✅ ng add @angular/fire
✅ npm install chart.js qrcode html2canvas
✅ npm install -D @types/qrcode @types/html2canvas
```

**Tech Stack:**
- Angular 21.1 (standalone components)
- Angular Material (Indigo/Pink theme)
- Zone.js for change detection
- Service Worker for PWA

### ✅ Critical Missing Piece: Link Previews (COMPLETE!)

**Status:** ✅ **FULLY IMPLEMENTED**

**Deployed Function:**
`https://us-central1-quickpoll-app-f3fed.cloudfunctions.net/linkPreview`

**Implementation:** `functions/src/index.ts`
- Express server with CORS
- Dynamic Open Graph meta tags
- Firestore poll data fetching
- XSS protection (HTML escaping)
- Automatic redirect to Angular app
- Error handling and fallbacks

**Firebase Hosting Rewrites:** ✅ Configured in `firebase.json`
```json
{
  "source": "/p/:pollId",
  "function": "linkPreview"
}
```

**Testing:**
```bash
✅ Function deploys successfully
✅ Fetches test poll from Firestore
✅ Generates proper meta tags
✅ Returns HTML with og:title, og:description, og:image
```

**OG Image:** ✅ Created at `src/assets/og-default.png` (1200x630px)

---

## ✅ Phase 1: Data Model & Security (COMPLETE - Feb 4, 2026)

### Firestore Structure
**Target data model:**

```typescript
// polls/{pollId}
interface Poll {
  id: string;
  title: string;
  options: string[];
  createdAt: Timestamp;
  createdBy: string; // anon UID
  expiresAt?: Timestamp;
  mode: 'anonymous' | 'named';
  totalVotes: number;
  settings: {
    multipleChoice: boolean;
    showResults: 'after_vote' | 'live';
  }
}

// votes/{pollId}/votes/{voteId}
interface Vote {
  pollId: string;
  optionIndex: number;
  voterId: string;
  voterName?: string;
  timestamp: Timestamp;
  deviceFingerprint: string;
}

// results/{pollId} (pre-aggregated)
interface Results {
  pollId: string;
  counts: { [optionIndex: number]: number };
  lastUpdated: Timestamp;
}
```

**Status:**
- [x] Test poll created in Firestore (`test123`)
- [x] Basic security rules applied
- [x] ✅ Vote counting Cloud Function (`aggregateVotes`)
- [x] ✅ TypeScript interfaces in Angular (`src/app/core/models/`)
- [x] ✅ Production security rules with vote deduplication

### Security Rules ✅ Production Rules Deployed

**Production rules implemented in `firestore.rules`:**
```javascript
// Polls: immutable after creation
match /polls/{pollId} {
  allow read: if true;
  allow create: if request.auth != null
                && request.resource.data.createdBy == request.auth.uid;
  allow update: if false;
}

// Votes: one vote per user per poll
match /votes/{pollId}/votes/{voteId} {
  allow read: if resource.data.pollId == pollId;
  allow create: if request.auth != null
                && !exists(/databases/$(database)/documents/votes/$(pollId)/votes/$(request.auth.uid))
                && request.resource.data.voterId == request.auth.uid;
}

// Results: Cloud Function only
match /results/{pollId} {
  allow read: if true;
  allow write: if false;
}
```

### ✅ Vote Counting Cloud Function (COMPLETE!)

**Implementation:** `functions/src/triggers/votes.ts`

The `aggregateVotes` function is now deployed and handles:
- Automatic vote counting via Firestore triggers
- Transaction-based updates to prevent race conditions
- Pre-aggregated results in `results/{pollId}` collection
- Updates `totalVotes` counter on poll documents
- Deployed as Firebase v2 Cloud Function

**Key Features:**
- Triggers on: `votes/{pollId}/votes/{voteId}` creation
- Uses Firestore transactions for atomic updates
- Error handling with graceful degradation
- Deployed to us-central1 region

### ✅ TypeScript Models (COMPLETE!)

**Location:** `src/app/core/models/`

Created comprehensive TypeScript interfaces:
- **poll.model.ts** - `Poll`, `PollSettings`, `CreatePollDto`
- **vote.model.ts** - `Vote` interface
- **results.model.ts** - `Results` interface
- **index.ts** - Barrel export for easy imports

All models match the Firestore data structure and include proper typing for Angular Fire.

### ✅ Cloud Functions Refactoring (BONUS!)

**New structure for scalability:**

```
functions/src/
├── index.ts              # Barrel exports (26 lines)
├── https/
│   └── linkPreview.ts   # Link preview HTTP function
├── triggers/
│   └── votes.ts         # Vote aggregation trigger
├── lib/
│   └── helpers.ts       # Shared utilities
└── types/
    └── index.ts         # Type definitions
```

**Benefits:**
- Clean separation of concerns
- Reusable helper functions
- Easy to add new functions in Phase 3-4
- Better code organization (248 lines → 5 focused files)

---

## ❌ Phase 2: Core Angular App (NOT STARTED - Day 2-4)

### Service Architecture

**TODO:** Create `src/app/core/services/poll.service.ts`

```typescript
@Injectable({ providedIn: 'root' })
export class PollService {
  private firestore = inject(Firestore);
  private auth = inject(Auth);

  async createPoll(data: CreatePollDto): Promise<string> {
    if (!this.auth.currentUser) {
      await signInAnonymously(this.auth);
    }

    const pollRef = doc(collection(this.firestore, 'polls'));
    const pollId = pollRef.id;

    await setDoc(pollRef, {
      ...data,
      id: pollId,
      createdBy: this.auth.currentUser!.uid,
      createdAt: serverTimestamp(),
      totalVotes: 0
    });

    return pollId;
  }

  getPollStream(pollId: string): Observable<Poll | null> {
    const pollDoc = doc(this.firestore, `polls/${pollId}`);
    return docData(pollDoc) as Observable<Poll | null>;
  }

  getResultsStream(pollId: string): Observable<Results | null> {
    const resultsDoc = doc(this.firestore, `results/${pollId}`);
    return docData(resultsDoc) as Observable<Results | null>;
  }

  async vote(pollId: string, optionIndex: number): Promise<void> {
    if (!this.auth.currentUser) {
      await signInAnonymously(this.auth);
    }

    const voteRef = doc(
      this.firestore,
      `votes/${pollId}/votes/${this.auth.currentUser!.uid}`
    );

    await setDoc(voteRef, {
      pollId,
      optionIndex,
      voterId: this.auth.currentUser!.uid,
      timestamp: serverTimestamp(),
      deviceFingerprint: this.getDeviceFingerprint()
    });
  }

  private getDeviceFingerprint(): string {
    return btoa(navigator.userAgent + screen.width + screen.height);
  }
}
```

### Component Structure

**TODO:** Create feature modules

```
src/app/
├── features/
│   ├── create/
│   │   ├── create-poll.component.ts
│   │   ├── create-poll.component.html
│   │   ├── create-poll.component.scss
│   │   └── templates.ts
│   ├── vote/
│   │   ├── vote.component.ts
│   │   ├── vote.component.html
│   │   ├── vote.component.scss
│   │   └── option-card.component.ts
│   └── results/
│       ├── results.component.ts
│       ├── results.component.html
│       ├── results.component.scss
│       └── results-chart.component.ts
├── shared/
│   ├── components/
│   │   ├── qr-code.component.ts
│   │   ├── share-button.component.ts
│   │   └── emoji-picker.component.ts
│   └── services/
│       ├── poll.service.ts
│       └── share.service.ts
└── core/
    ├── models/
    │   ├── poll.model.ts
    │   ├── vote.model.ts
    │   └── results.model.ts
    └── guards/
        └── poll-exists.guard.ts
```

### ❌ Share Service (CRITICAL!)

**TODO:** Create `src/app/shared/services/share.service.ts`

```typescript
@Injectable({ providedIn: 'root' })
export class ShareService {
  getShareUrl(pollId: string): string {
    return `${window.location.origin}/p/${pollId}`;
  }

  async shareToWhatsApp(pollId: string, pollTitle: string): Promise<void> {
    const url = this.getShareUrl(pollId);
    const text = encodeURIComponent(`Vote on: ${pollTitle}`);
    window.open(`https://wa.me/?text=${text}%20${url}`, '_blank');
  }

  async shareNative(pollId: string, pollTitle: string): Promise<void> {
    if (navigator.share) {
      await navigator.share({
        title: pollTitle,
        url: this.getShareUrl(pollId)
      });
    }
  }

  copyLink(pollId: string): void {
    navigator.clipboard.writeText(this.getShareUrl(pollId));
  }

  generateQRCode(pollId: string): string {
    // Use qrcode library
    return QRCode.toDataURL(this.getShareUrl(pollId));
  }
}
```

---

## ❌ Phase 3: The Hard Parts (NOT STARTED - Day 4-5)

### 1. Real-Time Chart That Doesn't Lag

**TODO:** Implement `results-chart.component.ts`

```typescript
export class ResultsChartComponent implements OnInit, OnDestroy {
  @Input() pollId!: string;

  private chart?: Chart;
  private destroy$ = new Subject<void>();

  ngOnInit() {
    this.pollService.getResultsStream(this.pollId)
      .pipe(
        takeUntil(this.destroy$),
        debounceTime(300) // Prevent chart thrashing
      )
      .subscribe(results => {
        this.updateChart(results);
      });
  }

  private updateChart(results: Results) {
    if (!this.chart) {
      this.initChart(results);
    } else {
      // Update without recreating
      this.chart.data.datasets[0].data = Object.values(results.counts);
      this.chart.update('none'); // No animation for real-time
    }
  }
}
```

### 2. Image Export (Viral Feature!)

**TODO:** Export results as shareable image

```typescript
async exportResultsAsImage(): Promise<void> {
  const element = document.getElementById('results-card');
  if (!element) return;

  const canvas = await html2canvas(element, {
    backgroundColor: '#ffffff',
    scale: 2 // Retina quality
  });

  canvas.toBlob((blob) => {
    if (blob) {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `poll-results-${Date.now()}.png`;
      a.click();
      URL.revokeObjectURL(url);
    }
  });
}
```

### 3. PWA Install Prompt

**TODO:** Add to `app.component.ts`

```typescript
private deferredPrompt: any;
showInstallPrompt = false;

ngOnInit() {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    this.deferredPrompt = e;

    const hasCreatedPoll = localStorage.getItem('hasCreatedPoll');
    if (hasCreatedPoll) {
      this.showInstallPrompt = true;
    }
  });
}

async installApp() {
  if (this.deferredPrompt) {
    this.deferredPrompt.prompt();
    const { outcome } = await this.deferredPrompt.userChoice;
    this.deferredPrompt = null;
    this.showInstallPrompt = false;
  }
}
```

---

## ❌ Phase 4: Performance & Polish (NOT STARTED - Day 6-7)

### Critical Optimizations

**1. Lazy Load Everything**
```typescript
export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/create/create-poll.component')
  },
  {
    path: 'p/:pollId',
    loadComponent: () => import('./features/vote/vote.component')
  },
  {
    path: 'results/:pollId',
    loadComponent: () => import('./features/results/results.component')
  }
];
```

**2. Firestore Query Optimization**
```typescript
// Only recent polls
const sevenDaysAgo = new Date();
sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

const q = query(
  collection(this.firestore, 'polls'),
  where('createdAt', '>', sevenDaysAgo),
  orderBy('createdAt', 'desc'),
  limit(20)
);
```

**3. Loading States**
- Skeleton screens for poll loading
- Spinner for vote submission
- Progress bar for chart updates

---

## 🚀 Deployment Checklist

### Pre-Deploy
- [ ] Build Angular app: `ng build --configuration production`
- [ ] Test functions locally: `firebase emulators:start`
- [ ] Verify all routes work
- [ ] Test on mobile devices (iOS Safari, Chrome Android)

### Deploy
```bash
# Deploy functions first
cd functions
npm run build
firebase deploy --only functions

# Then hosting
firebase deploy --only hosting

# Or deploy both
firebase deploy
```

### Post-Deploy
- [ ] Test link preview on WhatsApp
- [ ] Verify real-time updates work
- [ ] Check PWA install prompt
- [ ] Test QR code generation
- [ ] Verify image export

---

## 📊 Current Status Summary

### ✅ Completed (Phase 0 + Phase 1)
- Firebase project fully configured
- Angular app scaffolded with Material Design
- PWA support enabled
- Cloud Functions deployed with link preview
- Firebase Hosting configured with rewrites
- **Production security rules deployed** ✅
- Test poll created and verified
- **TypeScript models in Angular** ✅
- **Vote aggregation Cloud Function** ✅
- **Functions refactored for scalability** ✅

### ❌ Not Started (Phases 2-4)
- Angular services (poll, share)
- UI components (create, vote, results)
- Real-time chart implementation
- Image export feature
- PWA install prompt
- Performance optimizations

---

## ⏱️ Actual Timeline (Revised)

**Day 1 (Feb 4):** ✅ COMPLETE - Firebase setup, Phase 0
**Day 2 (Feb 4):** ✅ COMPLETE - Phase 1 (data model, security, functions)
**Days 3-4:** 🔜 NEXT - Phase 2: Core Angular app (create, vote, results)
**Day 5:** Phase 3: Sharing & PWA features
**Day 6:** Phase 3: Real-time optimizations, image export
**Day 7:** Phase 4: Mobile testing, polish, deploy
**Days 8-10:** Bug fixes from real user testing
**Day 11+:** Marketing begins

---

## 🎯 Immediate Next Steps

1. **✅ Phase 1 Complete!**
   - [x] Vote counting Cloud Function
   - [x] TypeScript interfaces
   - [x] Production security rules
   - [x] Functions refactored for scale

2. **🔜 Phase 2: Core Angular App**
   - [ ] Create PollService (`src/app/shared/services/poll.service.ts`)
   - [ ] Create ShareService (`src/app/shared/services/share.service.ts`)
   - [ ] Build CreatePollComponent (`src/app/features/create/`)
   - [ ] Build VoteComponent (`src/app/features/vote/`)
   - [ ] Build ResultsComponent (`src/app/features/results/`)

3. **Deploy first working version:**
   - [ ] `ng build && firebase deploy`
   - [ ] Test end-to-end flow: Create → Vote → View Results
   - [ ] Share with friends for feedback

---

## 💡 Key Insights from Expert Guide

1. **Link previews are non-negotiable** - ✅ We did this right!
2. **Real-time is our moat** - Built-in WhatsApp polls can't do this
3. **Distribution > Code quality** - Get it shipped ASAP
4. **The first 100 users are your friends** - Send to every group chat
5. **Test on actual phones** - Desktop ≠ Mobile Safari
6. **Launch in 10 days or don't launch** - Stop tweaking, start shipping

---

## 📝 Notes

### Progress Update (Feb 4, 2026)
- ✅ **Phase 0 & 1 complete in Day 1!** Ahead of schedule!
- ✅ Backend infrastructure is solid and production-ready
- ✅ Link preview function deployed and tested
- ✅ Vote aggregation function with real-time counting
- ✅ Production security rules preventing vote manipulation
- ✅ Cloud Functions refactored for scalability
- 🔜 **Next:** Build Angular UI (Phase 2)
- Consider buying a domain for better link previews

**Key Achievement:** All backend work done. Now focus 100% on Angular UI.

**Remember:** The app is 20% of success. Distribution is 80%.
