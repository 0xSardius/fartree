# Fartree: Farcaster Linktree Implementation Plan

## 🎯 Executive Summary

**Vision**: Create the "Linktree for Farcaster" - a dead-simple profile page builder that auto-populates with user's Farcaster activity and connects all their Web3 apps in one place.

**Core Value Proposition**: 
- FID-as-backbone identity system
- Auto-discovery of connected apps/activity
- One-click profile creation for 300k+ Farcaster users
- Native integration with Farcaster ecosystem

---

## 📊 Market Analysis & Opportunity

### Why This Could Be Huge

1. **Timing is Perfect**: Farcaster has 300k+ active users but lacks a unified profile solution
2. **Natural Network Effects**: Every Fartree page promotes other Farcaster mini-apps
3. **Creator Economy Gap**: No easy way for Farcaster creators to monetize/showcase everything
4. **Web3 Native**: Built for the decentralized social future, not retrofitted

### Competitive Advantages

- **FID Integration**: Automatically pulls user's Farcaster data
- **Mini-app Discovery**: Native integration with Farcaster ecosystem
- **Zero Setup**: Profile auto-generates from existing activity
- **Creator Tools**: Built-in splits, collaboration features
- **Viral Mechanics**: Every page drives Farcaster adoption

---

## 🏗️ Technical Architecture

### Core Tech Stack

```
Frontend: Next.js 15 + TypeScript + Tailwind CSS
Database: Neon (Serverless PostgreSQL)
Authentication: Neynar SIWN (Sign In with Neynar)
Farcaster Integration: Neynar SDK
Deployment: Vercel
File Storage: Vercel Blob (for profile assets)
```

### Data Flow Architecture

```
1. User connects with FID → Neynar SDK fetches profile data
2. Auto-scan for connected mini-apps → Populate profile
3. User customizes layout/theme → Save to Supabase
4. Generate shareable URL → fartree.xyz/username
5. Analytics tracking → Engagement metrics
```

---

## 🚀 MVP Development Plan

### Phase 1: Core Profile Builder (Week 1-2)
**Goal**: Basic functional profile pages

#### Features
- [ ] Farcaster authentication (Neynar SIWN)
- [ ] Auto-populate basic profile (avatar, bio, username)
- [ ] Manual link addition (title + URL)
- [ ] Simple black/white theme (Nouns-inspired)
- [ ] Shareable URLs (fartree.xyz/username)

#### Technical Implementation
```typescript
// Core data structure
interface FartreeProfile {
  fid: number;
  username: string;
  displayName: string;
  bio: string;
  avatar: string;
  links: ProfileLink[];
  theme: 'light' | 'dark';
  customizations: ThemeCustomizations;
}

interface ProfileLink {
  id: string;
  title: string;
  url: string;
  type: 'manual' | 'auto-detected';
  category: 'social' | 'crypto' | 'content' | 'other';
  isVisible: boolean;
}
```

### Phase 2: Auto-Discovery Magic (Week 3-4)
**Goal**: Automatically detect user's Farcaster activity and connected apps

#### Features
- [ ] Auto-detect user's casts and engagement
- [ ] Scan for mentioned URLs/apps in user's casts
- [ ] Integration with major Farcaster mini-apps:
  - [ ] Hypersub subscriptions
  - [ ] Token launches (clanker, etc.)
  - [ ] NFT collections
  - [ ] Frame interactions
- [ ] Smart categorization of links

#### Auto-Discovery Implementation
```typescript
// Neynar SDK integration for auto-discovery
class FarcasterProfileScanner {
  async scanUserActivity(fid: number): Promise<AutoDiscoveredLinks[]> {
    // Get user's recent casts
    const casts = await neynar.fetchUserCasts({ fid, limit: 100 });
    
    // Extract URLs and analyze
    const links = this.extractLinksFromCasts(casts);
    
    // Categorize and enrich
    return this.categorizeLinks(links);
  }

  async detectConnectedApps(fid: number): Promise<ConnectedApp[]> {
    // Check for frame interactions
    // Look for token deployments
    // Scan for hypersub activity
    // etc.
  }
}
```

### Phase 3: Customization & Polish (Week 5-6)
**Goal**: Make profiles beautiful and customizable

#### Features
- [ ] Theme customization (colors, fonts, layouts)
- [ ] Drag-and-drop link reordering
- [ ] Custom backgrounds/branding
- [ ] Analytics dashboard
- [ ] Profile verification badges

---

## 🎨 UI/UX Design Strategy

### Design Principles
1. **Simplicity First**: Nouns-inspired minimalism
2. **Mobile-Optimized**: Most Farcaster users are mobile
3. **Fast Loading**: Optimized for quick sharing
4. **Accessible**: WCAG compliant

### User Journey
```
1. Connect Farcaster → 2. Review auto-generated profile → 
3. Customize/add links → 4. Share profile → 5. Track engagement
```

### Key Screens
- Landing page with SIWN
- Profile editor (drag-and-drop)
- Public profile view
- Analytics dashboard
- Settings/customization

---

## 💻 Development Workflow

### V0 (UI Development)
Use V0 for rapid prototyping of:
- Landing page design
- Profile editor interface
- Public profile layouts
- Mobile-responsive components

### Cursor (Full Development)
Transfer V0 components to full Next.js app with:
- Neynar SDK integration
- Supabase backend setup
- Authentication flow
- Data persistence

---

## 🔧 Technical Implementation Details

### 1. Neynar SDK Integration

```typescript
// Initialize Neynar client
import { NeynarAPIClient, Configuration } from '@neynar/nodejs-sdk';

const config = new Configuration({
  apiKey: process.env.NEYNAR_API_KEY,
});

const neynar = new NeynarAPIClient(config);

// Auto-populate profile
async function createProfileFromFID(fid: number) {
  const user = await neynar.fetchBulkUsers({ fids: [fid] });
  const casts = await neynar.fetchUserCasts({ fid, limit: 50 });
  
  return {
    username: user.users[0].username,
    displayName: user.users[0].display_name,
    bio: user.users[0].profile.bio.text,
    avatar: user.users[0].pfp_url,
    autoLinks: await scanCastsForLinks(casts),
  };
}
```

### 2. Database Schema (Neon PostgreSQL)

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  fid BIGINT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  theme TEXT DEFAULT 'light',
  custom_domain TEXT,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index for fast FID lookups
CREATE INDEX idx_profiles_fid ON profiles(fid);
CREATE INDEX idx_profiles_username ON profiles(username);

-- Links table
CREATE TABLE profile_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  category TEXT,
  position INTEGER DEFAULT 0,
  is_visible BOOLEAN DEFAULT true,
  click_count INTEGER DEFAULT 0,
  auto_detected BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_profile_links_profile_id ON profile_links(profile_id);
CREATE INDEX idx_profile_links_position ON profile_links(profile_id, position);

-- Analytics table for click tracking
CREATE TABLE link_clicks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  link_id UUID REFERENCES profile_links(id) ON DELETE CASCADE,
  clicked_at TIMESTAMP DEFAULT NOW(),
  referrer TEXT,
  user_agent TEXT,
  ip_address INET
);

-- Session table for auth
CREATE TABLE user_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  fid BIGINT REFERENCES profiles(fid),
  signer_uuid TEXT NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Neon-specific optimizations
CREATE INDEX idx_link_clicks_link_id_time ON link_clicks(link_id, clicked_at DESC);
CREATE INDEX idx_sessions_fid ON user_sessions(fid);
```

### 3. API Routes Structure with Neon

```typescript
// lib/db.ts - Neon connection
import { Pool } from '@neondatabase/serverless';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export { pool };

// /api/profile/[username].ts - Get public profile
import { pool } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { username } = req.query;
  
  const client = await pool.connect();
  try {
    const result = await client.query(`
      SELECT p.*, array_agg(
        json_build_object(
          'id', pl.id,
          'title', pl.title,
          'url', pl.url,
          'category', pl.category,
          'click_count', pl.click_count
        ) ORDER BY pl.position
      ) as links
      FROM profiles p
      LEFT JOIN profile_links pl ON p.id = pl.profile_id AND pl.is_visible = true
      WHERE p.username = $1
      GROUP BY p.id
    `, [username]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    
    res.json(result.rows[0]);
  } finally {
    client.release();
  }
}

// /api/profile/update.ts - Update profile
// /api/links/add.ts - Add new link  
// /api/links/reorder.ts - Reorder links
// /api/analytics/[profileId].ts - Get analytics
// /api/scan/[fid].ts - Auto-scan user activity
```

---

## 🚦 Go-to-Market Strategy

### Launch Sequence
1. **Week 1-2**: Build MVP, test with close circle
2. **Week 3**: Soft launch to Farcaster power users
3. **Week 4**: Public launch with cast campaign
4. **Week 5+**: Feature iterations based on feedback

### Growth Tactics
- **Cast Storm**: Coordinate launch announcement
- **Influencer Onboarding**: Get top Farcaster creators on board
- **Frame Integration**: Create frames for easy sharing
- **Channel Partnerships**: Partner with major channels

### Monetization (Future)
- Premium themes and customizations
- Custom domains
- Advanced analytics
- Creator collaboration tools
- Revenue sharing from referred mini-apps

---

## 🎯 Success Metrics

### Week 1 Targets
- [ ] 50 early beta users
- [ ] Core profile creation working
- [ ] Basic auto-discovery functional

### Month 1 Targets
- [ ] 1,000+ profiles created
- [ ] 10,000+ profile views
- [ ] 5,000+ external clicks generated

### Month 3 Targets
- [ ] 10,000+ profiles
- [ ] Integration with 10+ major Farcaster apps
- [ ] Revenue-generating features launched

---

## 🔮 Future Roadmap

### Phase 4: Creator Economy (Month 2-3)
- Built-in @splits integration
- Collaboration marketplace
- Revenue sharing tools
- Creator verification program

### Phase 5: Advanced Features (Month 4-6)
- Custom domains
- A/B testing for profiles
- Advanced analytics
- API for third-party integrations

### Phase 6: Platform Evolution (Month 6+)
- Fartree mini-app ecosystem
- White-label solutions
- Enterprise features
- Cross-platform expansion

---

## 🚨 Risks & Mitigation

### Technical Risks
- **Neynar API limits**: Implement caching and rate limiting
- **Scalability**: Design for horizontal scaling from day 1
- **Data accuracy**: Regular sync with Farcaster hubs

### Market Risks
- **Competition**: Focus on unique FID-native features
- **User adoption**: Strong onboarding and value proposition
- **Platform changes**: Stay close to Farcaster development

### Business Risks
- **Monetization**: Multiple revenue streams planned
- **Sustainability**: Low operational costs with Supabase
- **Team scaling**: Clear technical architecture for growth

---

## 💡 Unique Value Propositions

### For Creators
- **Zero Setup Time**: Profile auto-generates from existing activity
- **All-in-One Hub**: Every Farcaster app in one place
- **Monetization Ready**: Built-in tools for revenue generation
- **Analytics**: Track what resonates with audience

### For Users
- **Discovery**: Find new creators and apps easily
- **Trust**: Verified Farcaster identity
- **Convenience**: One link for everything
- **Mobile Optimized**: Fast, clean experience

### For Ecosystem
- **Growth Driver**: Every profile promotes Farcaster
- **App Discovery**: Increases usage of mini-apps
- **Network Effects**: Strengthens overall ecosystem
- **Data Insights**: Aggregated usage patterns

---

## 🏁 Next Steps

### Immediate Actions (This Week)
1. [ ] Set up development environment
2. [ ] Get Neynar API key and test basic integration
3. [ ] Create wireframes in V0
4. [ ] Set up Supabase project
5. [ ] Build basic authentication flow

### Week 1 Priorities
1. [ ] Implement Neynar SIWN
2. [ ] Build profile creation flow
3. [ ] Create basic profile display
4. [ ] Set up database schema
5. [ ] Deploy MVP to Vercel

### Ready to Build?
This plan provides a clear roadmap from concept to launch. The combination of Farcaster's growing ecosystem, the natural need for creator profile tools, and the technical feasibility makes this a compelling opportunity.

**The key insight**: We're not just building another linktree clone - we're building the identity layer for the Farcaster ecosystem.**