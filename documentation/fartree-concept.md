# Fartree: Product Concept Document
*"The Linktree for Farcaster - auto-generates your Web3 profile from your FID, connecting all your mini-apps, tokens, and collabs in one shareable link."*

---

## 🎯 The Problem

**Farcaster creators are scattered across the ecosystem with no unified identity hub.**

- Creators use 10+ different mini-apps (Hypersub, token launchers, galleries, DAOs)
- No easy way to showcase everything they've built in one place
- Manual link management is tedious and gets outdated quickly
- Discovery of creator's full activity requires hunting across multiple platforms
- Web2 solutions (Linktree, Carrd) don't understand Web3/Farcaster context

## 💡 The Solution

**Fartree**: An auto-generating profile builder that uses your Farcaster ID (FID) as the backbone to create a comprehensive, always-updated hub of your Web3 activity.

### Core Magic
1. **Connect once** → Auto-scans your Farcaster activity
2. **Instant profile** → Pre-populated with your tokens, hypersubs, collaborations
3. **Always fresh** → Updates automatically as you use new mini-apps
4. **One shareable link** → `fartree.xyz/yourname`

---

## 🎨 Product Vision

### MVP User Journey
```
1. "Sign in with Farcaster" → 2. Profile auto-generates → 
3. Customize/organize → 4. Share everywhere → 5. Track engagement →
6. Discover friends' Fartrees
```

### What Gets Auto-Detected
- **Profile basics**: Avatar, bio, username from Farcaster
- **Token activity**: Clanker launches, meme coins, trading activity
- **Subscriptions**: Hypersub memberships and subscriptions you've created
- **Content**: Most popular casts, Frame interactions
- **Collaborations**: @splits partnerships, co-created content
- **Apps used**: Any mini-app you've interacted with
- **Social proof**: Follower count, engagement metrics

### Customization Options
- **Drag & drop** link reordering ✅ *Implemented*
- **Categories**: Social, Crypto, Content, Collabs
- **Themes**: Nouns-inspired minimal (dark theme with purple accents) ✅ *Implemented*
- **Visibility controls**: Hide/show specific links
- **Custom sections**: Add manual links for anything we missed ✅ *Implemented*
- **Edit/Delete**: Polished modal UI with custom confirmation ✅ *Implemented*

### Social Discovery Features ✨ *NEW*
- **Friends Discovery**: Browse best friends who have Fartrees (ranked by mutual affinity)
- **Profile Cards**: See friend avatars, link counts, and power badges
- **Invite Flow**: Encourage friends to create their Fartrees
- **In-App Navigation**: Seamless browsing within miniapp with back button support

---

## 🚀 Go-to-Market Strategy

### Target Users

**Primary**: Active Farcaster creators (1,000-10,000 followers)
- Content creators building personal brands
- Token launchers and DeFi builders  
- Artists and NFT creators
- Community builders and DAO operators

**Secondary**: Casual Farcaster users wanting professional presence
**Tertiary**: Web3 projects wanting team member profiles

### Launch Plan

**Week 1-2**: Build core MVP
**Week 3**: Private beta with 50 power users
**Week 4**: Public launch via coordinated cast storm
**Month 2+**: Iterate based on feedback, add premium features

### Distribution Strategy
- **Viral mechanics**: Every profile promotes Farcaster ecosystem
- **Influencer onboarding**: Get top creators using it first
- **Frame integration**: Easy sharing frames
- **Channel partnerships**: Partner with major Farcaster channels

---

## 🛠 Technical Approach

### Tech Stack
- **Frontend**: Next.js 15 + TypeScript + Tailwind
- **Database**: Neon (Serverless PostgreSQL)  
- **Auth**: Neynar Sign-In-With-Neynar (SIWN)
- **Farcaster Data**: Neynar SDK
- **Deployment**: Vercel

### Key Technical Features
- **FID-native**: Your Farcaster ID is your universal key
- **Real-time sync**: Profiles update as you use new apps
- **Fast loading**: Optimized for mobile sharing
- **Analytics**: Track clicks and engagement
- **URL structure**: `fartree.xyz/username` or custom domains

---

## 💰 Business Model

### Revenue Streams (Future)
1. **Premium themes** and customization options
2. **Custom domains** for creators wanting branded URLs
3. **Advanced analytics** and audience insights
4. **Creator tools**: Collaboration marketplace, revenue splitting
5. **Enterprise**: White-label solutions for projects

### Monetization Timeline
- **Months 1-3**: Free to build user base
- **Month 4+**: Introduce premium features
- **Month 6+**: Creator economy tools (revenue sharing)

---

## 📊 Success Metrics

### MVP Validation (Month 1)
- [ ] 1,000+ profiles created
- [ ] 10,000+ profile views  
- [ ] 5,000+ external link clicks
- [ ] 50+ power users actively updating profiles

### Growth Targets (Month 3)
- [ ] 10,000+ profiles
- [ ] 100,000+ monthly profile views
- [ ] Integration with 10+ major Farcaster mini-apps
- [ ] 1,000+ daily active users

### Long-term Vision (Year 1)
- [ ] 50,000+ profiles (15% of active Farcaster users)
- [ ] Default profile solution for Farcaster creators
- [ ] Revenue-positive with premium features
- [ ] Creator collaboration marketplace launched

---

## 🎪 Unique Value Propositions

### For Creators
- **Zero setup time**: Profile auto-generates from existing activity
- **Always current**: Never outdated because it syncs automatically  
- **Discovery engine**: Showcases full scope of Web3 activity
- **Analytics**: See what content/projects resonate most
- **Monetization ready**: Built-in tools for creator economy

### For Audiences  
- **One-stop discovery**: Find everything a creator has built
- **Trust signals**: Verified Farcaster identity + activity proof
- **Easy exploration**: Clean, mobile-optimized experience
- **Web3 native**: Understand tokens, NFTs, and collabs in context

### For Ecosystem
- **Growth driver**: Every profile promotes Farcaster mini-apps
- **Data insights**: Aggregated view of ecosystem usage patterns
- **Creator retention**: Easier for creators to showcase and monetize
- **Onboarding tool**: New users see what's possible on Farcaster

---

## 🚧 Potential Challenges & Solutions

### Technical Challenges
**Challenge**: Keeping profiles synced with rapidly changing mini-app ecosystem
**Solution**: Modular detection system, community-driven app integration

**Challenge**: Handling diverse data formats from different mini-apps  
**Solution**: Standardized link categories, manual override options

### Market Challenges  
**Challenge**: User adoption in crowded creator tool space
**Solution**: Unique FID-native auto-generation, no existing competitor

**Challenge**: Monetization without hurting growth
**Solution**: Generous free tier, premium features that enhance rather than gate

### Ecosystem Challenges
**Challenge**: Mini-app developers may want direct traffic
**Solution**: Revenue sharing model, attribution tracking

---

## 🎯 Competitive Analysis

### Direct Competitors
**None** - No FID-native, auto-generating profile builders exist

### Indirect Competitors
- **Linktree**: Manual setup, Web2-focused, no crypto context
- **Carrd**: Static sites, no auto-updating, design-heavy
- **Bio.link**: Similar to Linktree, no Web3 integration
- **Beacons**: Creator-focused but Web2, manual management

### Competitive Advantages
1. **Auto-generation**: No manual setup required
2. **Farcaster-native**: Understands the ecosystem deeply  
3. **Real-time updates**: Always current without user effort
4. **Web3 context**: Shows tokens, collabs, and crypto activity properly
5. **Network effects**: Every profile drives ecosystem growth

---

## 🏁 Next Steps

### Immediate (This Week)
- [ ] Finalize tech stack and set up development environment
- [ ] Create wireframes and basic design system
- [ ] Set up Neynar API integration and test FID data fetching
- [ ] Build authentication flow with SIWN

### Short-term (Next 2 Weeks)  
- [ ] MVP profile generation and display
- [ ] Basic auto-detection for major mini-apps
- [ ] Simple customization interface
- [ ] Deploy beta version

### Medium-term (Month 1)
- [ ] Public launch and user acquisition
- [ ] Analytics dashboard
- [ ] Enhanced auto-detection
- [ ] Mobile optimization

**Ready to build the identity layer for the Farcaster ecosystem.**