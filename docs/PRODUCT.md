# Product Documentation: QuickPoll

**Ultra-Simple Group Decision PWA**

- **Author:** Augustin Ioan Lates
- **Date:** January 29, 2026
- **Version:** 1.1 (Global MVP)
- **Product Owner:** Augustin Ioan Lates (@AugustinLatesI)

---

## 1. Product Overview

QuickPoll is a lightweight Progressive Web App (PWA) designed for fast, fun group decisions on everyday questions like "Where should we eat?", "What movie tonight?", or "Who pays the tab?".

Users create a poll in under 5 seconds, share a link or QR code via WhatsApp, group chat, or social media, and watch votes update in real-time with a clean chart. Results can be exported as an image for easy sharing.

### The Problem We Solve

Universal frustration: endless "idk" replies in group chats when trying to make simple decisions.

### Target Scenarios

- Friend groups deciding where to eat
- Families choosing movies
- Couples settling arguments
- Coworkers picking lunch spots
- Roommates resolving who does chores

---

## Why This Has Potential in 2026

Many tools exist for polls (Slido, Mentimeter, Poll Everywhere for live events; Doodle for scheduling; StrawPoll for quick disposables; built-in WhatsApp/Telegram polls), but **few nail the exact sweet spot:**

✅ **Instant casual group chaos resolver**
✅ **Real-time sync**
✅ **Optional timers/reminders**
✅ **No heavy sign-up or ads overload**

### Our Differentiation

- **Speed:** Poll created in <5 seconds
- **Humor:** Fun UI with playful copy
- **Seamless messaging integration:** One-click WhatsApp/social sharing
- **Real-time magic:** Live vote updates that built-in polls can't match

---

## Target Audience

**Primary:** Global users 18-45, messaging-app heavy (WhatsApp dominant in many regions)

**MVP Language:** English UI (easy to add multi-language support later)

### MVP Objectives

1. Quick validation via organic shares (meme posts on TikTok/X/Reddit)
2. Aim for small recurring revenue through simple paths
3. Low-risk build: ship fast, iterate or pivot based on real usage

---

## 2. Key Features (MVP Scope)

Prioritized for speed-to-launch while covering the core loop.

| Category | Feature | Description | Priority |
|----------|---------|-------------|----------|
| **Core** | Instant Poll Creation | Title + add options (chips/Enter) + emojis + optional timer (1h/24h/custom). Auto short link/QR. | **High** |
| **Core** | Real-Time Voting | Votes sync instantly; anonymous default, optional named (via anon auth). Block duplicates per device/user. | **High** |
| **Core** | Live Results View | Auto-updating pie/bar chart (Chart.js); one-tap export to PNG. | **High** |
| **Core** | Preset Templates | Quick-start options like "Where to eat?", "Beach or mountains?", "Who takes out the trash?" (expandable). | **Medium** |
| **Extra** | Push Reminders | "Vote closes soon!" notifications via PWA/FCM. | **Medium** |
| **Extra** | Easy Sharing | One-click WhatsApp/FB/Messenger links; QR code display. | **Medium** |
| **Extra** | Mode Toggle | Anonymous vs named at creation. | **Low** |
| **Future** | Custom Themes / No-Ads | Premium unlocks. | Later |

### Design Vibe

**Mobile-first, clean, playful**

- Bright colors, large touch targets
- Light humor in placeholders (e.g., "Add something tempting... 🍔")
- Responsive across all devices
- PWA installable for app-like feel

---

## 3. Monetization Paths

**Keep it non-intrusive at launch to drive adoption.**

### Revenue Streams

1. **Freemium Model**
   - **Free:** Unlimited simple polls
   - **Premium:** $5-10/month for advanced features, custom themes, ad removal

2. **Contextual Partner Links**
   - "Results point to pizza? Check deals nearby" (non-annoying, opt-in style)

3. **Sponsored Polls/Templates**
   - Small brands pay to feature options (food chains, delivery services)

**Goal:** Focus growth first; revenue ramps with scale.

---

## 4. Tech Stack

Optimized for fast solo development with Angular experience.

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Angular 21+ | Standalone components, routing, PWA |
| **Backend** | Firebase | Firestore, Auth, Cloud Functions, Hosting |
| **Real-time** | Firestore Subscriptions | Live vote updates |
| **Visuals** | Chart.js | Results visualization |
| **Utilities** | emoji-mart, qrcode, html2canvas | Emojis, QR codes, image export |
| **Styling** | Angular Material / Tailwind CSS | UI components & rapid styling |

### Rationale

- ✅ Serverless (zero infra management)
- ✅ Real-time native
- ✅ Global edge caching
- ✅ Perfect for quick iterations
- ✅ Free tier covers MVP traffic

---

## 5. Development Roadmap

**Realistic timeline: 5–10 days solo (4–6h/day sessions)**

### Day 0: Setup (30–60 min)
- [x] New Firebase project
- [x] Enable Firestore, Auth (anonymous), FCM
- [x] `ng new quickpoll --standalone --routing --style=scss`
- [x] `ng add @angular/pwa` + `ng add @angular/fire`
- [x] Install libs: chart.js, emoji-mart, qrcode, html2canvas

### Day 1: Core Structure & Creation
- [ ] Define Poll interface/model
- [ ] Routes: `/` (create), `/:pollId` (vote + results)
- [ ] Build poll-create: form, chips for options, emoji picker, timer select, presets
- [ ] Save to Firestore → return short ID

### Day 2: Real-Time Engine
- [ ] `poll.service.ts`: create, get (observable), vote
- [ ] Use AngularFire for live subscription
- [ ] Anonymous authentication integration

### Day 3: Voting & Results UI
- [ ] Vote view: list options, click handler
- [ ] Disable after vote (localStorage + UID check)
- [ ] Results: Chart.js pie/bar bound to live data
- [ ] Export button with html2canvas

### Day 4: Sharing & Polish Extras
- [ ] QR + link generation
- [ ] WhatsApp share URL
- [ ] FCM push setup (permissions + reminder trigger)
- [ ] Anon/named toggle logic

### Day 5: Final Touches, Testing, Deploy
- [ ] Mobile/responsive fixes
- [ ] Custom install prompt banner
- [ ] Firestore security rules
- [ ] Full end-to-end test: create → share → vote → results
- [ ] `ng build --prod` → `firebase deploy`

### Post-Launch Steps
- [ ] Integrate Firebase Analytics
- [ ] Launch marketing: meme examples on X/TikTok/Reddit
- [ ] Gather feedback → quick iterations
- [ ] Consider Capacitor wrap for app stores

---

## 6. Distribution Strategy

### The Core Challenge

**You're not competing with other poll apps.**
**You're competing with doing nothing or the built-in WhatsApp/Telegram poll button.**

The sharing experience must be the hook.

### Five Key Strategies

#### 1. **The result is the ad**
Make the shareable result image fun enough to post (bold typography, funny taglines, subtle branding). If people share results as content, you get free distribution.

#### 2. **Niche beats broad**
"Poll app for everyone" is invisible. Pick a specific wedge:
- Pregame decisions
- Couples' arguments
- Roommate chores

Dominate it, then expand.

#### 3. **Create the content yourself**
Post entertaining polls to Reddit, TikTok, X **before** hoping for organic spread. You're not promoting an app—you're posting content that happens to come from your app.

#### 4. **Optimize the group chat infiltration loop**
One person creates → shares → everyone sees QuickPoll. Make:
- Link preview appealing
- Voting frictionless
- "Make your own" CTA clear

#### 5. **Micro-influencer seeding**
Find small creators doing "this or that" content. Offer nothing—just make the tool useful enough that some try it.

### Skip for Now

❌ Paid ads
❌ Product Hunt
❌ Press outreach

Wrong audiences or premature at this stage.

### The Real Test

**Get 100 strangers to use it without spending money.**

- ❌ If you can't → product or positioning needs work
- ✅ If you can → double down on whatever channel worked

---

## 7. Success Metrics (MVP Phase)

| Metric | Target | Why It Matters |
|--------|--------|----------------|
| Polls created | 500+ in first month | Validates creation flow |
| Votes per poll | 3+ average | Confirms sharing loop works |
| Return creators | 10%+ | Shows stickiness |
| Organic shares | 20% of polls | Distribution momentum |
| Install rate (PWA) | 5%+ | App-like engagement signal |

---

## 8. Risk Mitigation

### Technical Risks
- **Firestore costs spike:** Set budget alerts, optimize queries
- **Real-time lag:** Use Firestore subscriptions with debouncing

### Product Risks
- **No viral growth:** Pivot to specific niche (e.g., "Couples Poll")
- **WhatsApp blocks links:** Use domain rotation, link shorteners

### Market Risks
- **Built-in polls improve:** Double down on real-time + export features
- **Low retention:** Add gamification (poll streaks, badges)

---

## 9. Competitive Analysis

| Competitor | Strength | Weakness | How We Win |
|------------|----------|----------|------------|
| WhatsApp Polls | Built-in, zero friction | No real-time results, no export | Live updates + shareable images |
| StrawPoll | Simple, fast | Ugly UI, no mobile focus | Beautiful design + PWA |
| Slido | Enterprise features | Too complex, paid | Free + instant casual use |
| Doodle | Scheduling niche | Not for quick decisions | Speed + fun factor |

---

## 10. Long-Term Vision (Post-MVP)

### Phase 2 Features (Months 2-3)
- Multiple choice voting
- Weighted voting (rank options)
- Poll templates marketplace
- Analytics for poll creators
- Custom branding for premium

### Phase 3 Growth (Months 4-6)
- Native iOS/Android apps (Capacitor)
- Team/workspace features
- API for integrations
- White-label for brands
- Multi-language support

### Potential Pivots
- **B2B:** "Instant audience polls for streamers/creators"
- **Events:** "Real-time conference Q&A alternative"
- **Education:** "Quick classroom feedback tool"

---

## Appendix: Design Guidelines

### Color Palette
- **Primary:** Vibrant blue (#3B82F6)
- **Accent:** Fun orange (#F97316)
- **Success:** Green (#10B981)
- **Background:** Clean white/light gray

### Typography
- **Headings:** Bold, playful (Poppins/Inter)
- **Body:** Clean, readable (Inter/System)

### Voice & Tone
- **Casual:** "Let's settle this! 🍕"
- **Helpful:** "Share with your crew in 1 tap"
- **Light humor:** "Finally, a way to avoid 'idk' texts"

---

**Last Updated:** February 4, 2026
**Status:** Phase 0 Complete ✅ | Starting Phase 1
