# Fartree Post-MVP Feature Roadmap

*Strategic plan based on power user feedback - October 30, 2025*

---

## 🎯 **Vision: Fartree as the Profile Layer for Farcaster**

**Core Value Proposition:**
> "The universal profile hub that connects all your Farcaster miniapps, tokens, and Web3 activity in one beautiful, shareable page."

**Business Model:** B2B Integration as a Service
- Miniapps pay for deep Fartree integration
- Payment: wETH → $FARTR token presale access
- Revenue timeline: Weeks/months post-MVP

---

## 📅 **Phase 1: MVP Completion** (Week 1-2)

### Current Sprint - Critical Fixes
- [x] Fix discovery bigint type mismatch
- [ ] Polish discovery UX (scrolling, loading states)
- [ ] Optimize links display for mobile
- [ ] Build Fartree Home page

### Home Page Feature Breakdown

**Route:** `/home` (or update `/`)

**Sections:**
1. **Hero Explainer** (Above the fold)
   - Headline: "Your Web3 Identity, Automatically"
   - Subhead: "Connect all your Farcaster miniapps, tokens, and links in one profile"
   - CTA: "Create Your Fartree" → Onboarding

2. **How It Works** (Step-by-step guide)
   - Step 1: Sign in with Farcaster
   - Step 2: We auto-populate your profile
   - Step 3: Add your links & customize
   - Step 4: Share your Fartree everywhere

3. **Featured Casts** (Social proof)
   - Pinned community highlights
   - User testimonials in cast format
   - "Powered by Fartree" showcase
   - Implementation: Neynar Cast Embed API

4. **Features Showcase** (Interactive demos)
   - Auto-detection preview
   - Link analytics demo
   - Discovery feature highlight
   - Beautiful visual examples

5. **Stats Dashboard** (Growth metrics)
   - Total profiles created
   - Total links shared
   - Total clicks tracked
   - "Join X creators" social proof

6. **Roadmap Teaser** (Coming soon)
   - Clanker integration preview
   - Token empire tracking
   - Vibe Market showcase
   - "More integrations coming"

**Technical Requirements:**
- Cast embedding (Neynar API)
- Stats API endpoint (`/api/stats/global`)
- Admin dashboard for pinning casts (Phase 2)
- Responsive design matching current aesthetic

**Success Metrics:**
- Conversion rate: Visitor → Sign up
- Time on page (engagement)
- Click-through to onboarding
- Social shares of featured casts

---

## 💰 **Phase 2: Miniapp Integrations** (Month 1-3)

### Integration Framework

**Standard Integration Package:**
1. Auto-detection API endpoint
2. Profile widget/section
3. Deep links to miniapp
4. Analytics tracking
5. Featured placement option

**Pricing Model:**
- **Basic Integration:** 0.5 ETH + $FARTR allocation
- **Featured Integration:** 1 ETH + larger $FARTR allocation
- **Enterprise:** Custom pricing for exclusive features

---

### 🏆 **Priority 1: Clanker Integration**

**Launch Target:** Month 1

**Features:**
- Auto-detect all tokens user created via Clanker
- Display token performance (price, volume, holders)
- "Your Empire" section with token grid
- Deep link to Clanker for new launches
- Badge: "Token Creator" (if > 1 token)

**Technical Requirements:**
- Clanker API integration
- Token price feeds (Dexscreener or similar)
- Contract event tracking for new launches
- Real-time updates (webhooks or polling)

**Revenue Opportunity:**
- Clanker pays for featured integration
- User acquisition channel for Clanker
- Cross-promotion opportunities

**Implementation Time:** 2-3 sessions

---

### 🎨 **Priority 2: Vibe Market Integration**

**Launch Target:** Month 2

**Features:**
- Auto-detect Vibe Market collections owned/created
- Display top vibes with metadata & thumbnails
- "Your Vibes" section
- Buy/sell links to Vibe Market
- Badge: "Vibe Collector" (if > 5 vibes)

**Technical Requirements:**
- Vibe Market API integration
- NFT metadata fetching
- Image optimization for thumbnails
- Marketplace links with affiliate tracking

**Revenue Opportunity:**
- Vibe Market partnership deal
- Affiliate revenue on sales
- Featured artist spotlights

**Implementation Time:** 2-3 sessions

---

### 🏥 **Priority 3: Cura Integration**

**Launch Target:** Month 3

**Features:**
- TBD based on Cura's capabilities
- Health/wellness data (if applicable)
- Profile enhancements
- Cross-promotion

**Technical Requirements:**
- Cura API integration
- Privacy/permissions handling
- Custom UI components

**Revenue Opportunity:**
- Integration fee
- Co-marketing campaign

**Implementation Time:** 1-2 sessions (pending Cura API docs)

---

### 🌐 **Priority 4: Open Integration Marketplace**

**Launch Target:** Month 3+

**Concept:**
- Standardized API for miniapp integrations
- Self-service integration portal
- Documentation & SDKs
- Revenue-sharing model

**Features:**
- Developer portal for integration requests
- API key management
- Usage analytics
- Billing dashboard

**Business Model:**
- Application fee: 0.1 ETH
- Integration fee: 0.5-1 ETH depending on tier
- Recurring revenue for featured placements

**Technical Requirements:**
- Developer documentation site
- API authentication system
- Integration testing framework
- Partner dashboard

**Revenue Opportunity:**
- Recurring revenue from multiple miniapps
- Platform play (become infrastructure layer)
- $FARTR token utility (pay with token = discount)

**Implementation Time:** 1-2 weeks

---

## 🎨 **Phase 3: v2.0 Features** (Month 3-6)

### Enhanced Auto-Detection

**Hypersub Integration**
- Detect subscriptions owned/created
- Display subscriber counts
- Revenue tracking
- Deep links to manage subs

**Paragraph Integration**
- Detect published articles
- Show read counts & engagement
- Content showcase section
- Writer badge

**Frame Interactions**
- Track most-used Frames
- Display Frame activity
- Creator analytics

**NFT Holdings (Zora, Base)**
- Display NFT collections
- Gallery view
- Marketplace links
- Collector badges

### Theme & Customization

**Color Schemes**
- Light mode toggle
- Custom brand colors
- Preset themes
- Background patterns

**Layout Options**
- Grid view vs. list view
- Compact vs. spacious
- Section order customization
- Hide/show sections

### Social Features

**Profile Frames**
- Shareable Frame for profiles
- Interactive preview
- Cast composition integration

**Collaboration Tools**
- Partnership requests
- Co-branded profiles
- Shared link sections

**Analytics Dashboard**
- Detailed click analytics
- Traffic sources
- Peak times
- Geographic data (if available)

---

## 💎 **$FARTR Token Utility**

**Use Cases:**
1. **Integration Payments** - Pay with $FARTR for discounts
2. **Premium Features** - Unlock advanced customization
3. **Featured Placement** - Boost profile visibility
4. **Analytics Access** - Advanced analytics dashboard
5. **Early Access** - New features for token holders

**Distribution Strategy:**
- Presale to integration partners (wETH → $FARTR)
- Rewards for early users
- Community treasury
- Team allocation

---

## 📊 **Success Metrics**

### MVP Phase
- [ ] 100+ profiles created
- [ ] 500+ links added
- [ ] 10,000+ total clicks
- [ ] 5+ featured casts
- [ ] 50% user retention (7-day)

### Integration Phase
- [ ] 3+ miniapp integrations live
- [ ] 10+ ETH revenue from partnerships
- [ ] 500+ active users
- [ ] 5,000+ unique visitors/month

### Scale Phase
- [ ] 10+ miniapp integrations
- [ ] 50+ ETH revenue
- [ ] 5,000+ profiles
- [ ] 100,000+ visitors/month

---

## 🎯 **Competitive Positioning**

**vs. Linktree:**
- ✅ Web3-native (Farcaster integration)
- ✅ Auto-detection (less manual work)
- ✅ Miniapp ecosystem integration
- ✅ Token/crypto display

**vs. Other Farcaster profiles:**
- ✅ Dedicated profile page (not just bio)
- ✅ Analytics & click tracking
- ✅ Link management interface
- ✅ Discovery features

**Unique Value:**
> "The only profile solution that connects your entire Farcaster ecosystem automatically"

---

## 🚀 **Launch Strategy**

### Week 1-2: MVP Polish
- Fix discovery navigation
- Build Home page
- Final testing

### Week 3: Soft Launch
- Share with early adopters
- Gather feedback
- Iterate quickly

### Week 4: Public Launch
- Cast announcement
- Community showcase
- Partnership announcements

### Month 2+: Integration Blitz
- Launch Clanker integration
- Announce partnership deals
- $FARTR presale announcement

---

## 💡 **Quick Wins for Next Session**

1. **Deploy bigint fix** - Unlock 44 profiles in discovery
2. **Home page v1** - Simple explainer + 3 featured casts (hardcoded)
3. **Share button** - One-click copy profile link
4. **Stats widget** - Show "Join X creators" on landing page

**These can ship in 1-2 sessions and validate the strategy!**

---

*This roadmap is a living document. Update based on user feedback, technical constraints, and market opportunities.*

