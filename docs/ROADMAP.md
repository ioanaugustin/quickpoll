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

## 🟡 Phase 1: Data Model & Security (PARTIAL - Day 1-2)

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
- [ ] **TODO:** Vote counting Cloud Function
- [ ] **TODO:** TypeScript interfaces in Angular
- [ ] **TODO:** Enhanced security rules with vote deduplication

### Security Rules ✅ Applied (Temporary Dev Rules)

**Current rules:**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

**TODO: Production rules needed:**
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

### ❌ Vote Counting Cloud Function (NOT DONE)

**Critical for scale!** Client-side counting doesn't work.

**TODO:** Add to `functions/src/index.ts`:

```typescript
export const aggregateVotes = functions.firestore
  .document('votes/{pollId}/votes/{voteId}')
  .onCreate(async (snap, context) => {
    const vote = snap.data();
    const pollId = context.params.pollId;

    const resultRef = admin.firestore().collection('results').doc(pollId);

    return admin.firestore().runTransaction(async (transaction) => {
      const resultDoc = await transaction.get(resultRef);

      let counts = resultDoc.exists ? resultDoc.data()!.counts : {};
      counts[vote.optionIndex] = (counts[vote.optionIndex] || 0) + 1;

      transaction.set(resultRef, {
        pollId,
        counts,
        lastUpdated: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
    });
  });
```

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

### ✅ Completed (Phase 0)
- Firebase project fully configured
- Angular app scaffolded with Material Design
- PWA support enabled
- Cloud Functions deployed with link preview
- Firebase Hosting configured with rewrites
- Security rules applied (basic)
- Test poll created and verified

### 🟡 Partial (Phase 1)
- Data model design complete
- Basic security rules (need enhancement)
- Missing: Vote aggregation function

### ❌ Not Started (Phases 2-4)
- Angular services (poll, share)
- UI components (create, vote, results)
- Real-time chart implementation
- Image export feature
- PWA install prompt
- Performance optimizations

---

## ⏱️ Actual Timeline (Revised)

**Days 1-2:** ✅ DONE - Firebase setup, data model, Cloud Functions
**Days 3-4:** 🔜 NEXT - Core Angular app (create, vote, results)
**Day 5:** Sharing & PWA features
**Day 6:** Real-time optimizations, image export
**Day 7:** Mobile testing, polish, deploy
**Days 8-10:** Bug fixes from real user testing
**Day 11+:** Marketing begins

---

## 🎯 Immediate Next Steps

1. **Complete Phase 1:**
   - [ ] Add vote counting Cloud Function
   - [ ] Create TypeScript interfaces
   - [ ] Update security rules

2. **Start Phase 2:**
   - [ ] Create PollService
   - [ ] Build CreatePollComponent
   - [ ] Build VoteComponent
   - [ ] Build ResultsComponent

3. **Deploy first working version:**
   - [ ] `ng build && firebase deploy`
   - [ ] Test end-to-end flow
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

- We're ahead of schedule on Phase 0 infrastructure
- Link preview function is production-ready
- Need to build the actual UI now (Phases 2-4)
- Firebase setup is solid, focus on Angular components next
- Consider buying a domain for better link previews

**Remember:** The app is 20% of success. Distribution is 80%.
