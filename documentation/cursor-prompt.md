# Cursor Development Prompt for Fartree

## Project Setup & Context
Initialize **Fartree** - a Farcaster-native profile builder that auto-generates link-in-bio pages from user's FID activity. Think "Linktree for Web3" with automatic profile population.

## Tech Stack to Implement
```
Frontend: Next.js 15 + TypeScript + Tailwind CSS
Database: Neon (Serverless PostgreSQL)
Authentication: Neynar Sign-In-With-Neynar (SIWN)
API Integration: Neynar SDK for Farcaster data
Deployment: Vercel
Styling: Tailwind with dark theme, Farcaster purple (#8465CB) accents
```

## Project Structure
```
fartree/
├── src/
│   ├── app/                 # Next.js 15 app router
│   │   ├── page.tsx         # Landing page
│   │   ├── profile/         # Profile routes
│   │   ├── dashboard/       # User dashboard
│   │   └── api/             # API routes
│   ├── components/          # React components
│   ├── lib/                 # Utilities and configurations
│   ├── types/               # TypeScript definitions
│   └── styles/              # Global styles
├── public/                  # Static assets
└── sql/                     # Database schema files
```

## Initial Setup Tasks

### 1. Project Initialization
```bash
npx create-next-app@latest fartree --typescript --tailwind --app
cd fartree
npm install @neondatabase/serverless @neynar/nodejs-sdk uuid
npm install -D @types/uuid
```

### 2. Environment Configuration
Create `.env.local` with:
```env
# Database
DATABASE_URL="postgresql://..."

# Neynar API
NEYNAR_API_KEY="your_api_key"
NEYNAR_CLIENT_ID="your_client_id"

# App Configuration
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Database Schema Setup
Create and implement this Neon PostgreSQL schema:
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
  theme TEXT DEFAULT 'dark',
  custom_domain TEXT,
  is_verified BOOLEAN DEFAULT false,
  last_synced TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Profile links table
CREATE TABLE profile_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'other',
  position INTEGER DEFAULT 0,
  is_visible BOOLEAN DEFAULT true,
  is_auto_detected BOOLEAN DEFAULT false,
  click_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Click analytics
CREATE TABLE link_clicks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  link_id UUID REFERENCES profile_links(id) ON DELETE CASCADE,
  clicked_at TIMESTAMP DEFAULT NOW(),
  referrer TEXT,
  user_agent TEXT,
  country TEXT,
  ip_address INET
);

-- User sessions for auth
CREATE TABLE user_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  signer_uuid TEXT NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_profiles_fid ON profiles(fid);
CREATE INDEX idx_profiles_username ON profiles(username);
CREATE INDEX idx_profile_links_profile_id ON profile_links(profile_id);
CREATE INDEX idx_profile_links_position ON profile_links(profile_id, position);
CREATE INDEX idx_link_clicks_link_id ON link_clicks(link_id);
```

## Core Implementation Tasks

### 4. Database Connection (lib/db.ts)
```typescript
import { Pool } from '@neondatabase/serverless';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export { pool };
```

### 5. Neynar SDK Integration (lib/neynar.ts)
```typescript
import { NeynarAPIClient, Configuration } from '@neynar/nodejs-sdk';

const config = new Configuration({
  apiKey: process.env.NEYNAR_API_KEY!,
});

export const neynar = new NeynarAPIClient(config);
```

### 6. Core TypeScript Types (types/index.ts)
```typescript
export interface Profile {
  id: string;
  fid: number;
  username: string;
  displayName: string;
  bio: string;
  avatarUrl: string;
  theme: 'dark' | 'light';
  isVerified: boolean;
  links: ProfileLink[];
}

export interface ProfileLink {
  id: string;
  title: string;
  url: string;
  description?: string;
  category: 'social' | 'crypto' | 'content' | 'collab' | 'other';
  position: number;
  isVisible: boolean;
  isAutoDetected: boolean;
  clickCount: number;
}

export interface AutoDetectionResult {
  tokens: DetectedLink[];
  hypersubs: DetectedLink[];
  collaborations: DetectedLink[];
  content: DetectedLink[];
}
```

### 7. Key API Routes to Build

#### `/api/auth/signin.ts` - Neynar SIWN Integration
- Handle Farcaster authentication
- Create/update user session
- Redirect to dashboard

#### `/api/profile/scan/[fid].ts` - Auto-Detection Engine
- Scan user's Farcaster activity
- Detect tokens, hypersubs, collaborations
- Return structured link suggestions

#### `/api/profile/[username].ts` - Public Profile API
- Fetch complete profile with links
- Track view analytics
- Return optimized data for sharing

#### `/api/links/` - Link Management
- CRUD operations for profile links
- Reorder functionality
- Toggle visibility

### 8. Auto-Detection Logic (lib/scanner.ts)
Implement Farcaster activity scanning:
```typescript
export class FarcasterProfileScanner {
  async scanUserActivity(fid: number): Promise<AutoDetectionResult> {
    // Get user's recent casts
    const casts = await neynar.fetchUserCasts({ fid, limit: 100 });
    
    // Extract and categorize links
    const links = this.extractLinksFromCasts(casts);
    
    // Detect specific app types
    const tokens = await this.detectTokenActivity(fid);
    const hypersubs = await this.detectHypersubActivity(fid);
    const collabs = await this.detectCollaborations(fid);
    
    return { tokens, hypersubs, collaborations: collabs, content: links };
  }
}
```

### 9. Authentication Flow
- Implement Neynar SIWN on landing page
- Handle auth callback and session creation
- Protect dashboard routes with middleware
- Auto-redirect authenticated users

### 10. Core Page Components

#### Landing Page (`app/page.tsx`)
- Hero section with SIWN button
- Feature showcase
- Example profiles
- Clean, dark theme with purple accents

#### Dashboard (`app/dashboard/page.tsx`)
- Profile editor interface
- Link management with drag-and-drop
- Real-time preview
- Analytics overview

#### Public Profile (`app/[username]/page.tsx`)
- Clean profile display
- Mobile-optimized link grid
- Click tracking
- Social sharing meta tags

## Development Priorities

### Phase 1: Core Functionality (Week 1)
1. Project setup and database connection
2. Neynar authentication integration
3. Basic profile creation and display
4. Manual link addition/editing

### Phase 2: Auto-Detection (Week 2)
1. Farcaster activity scanning
2. Token/hypersub detection
3. Link categorization and suggestions
4. Profile auto-population

### Phase 3: Polish & Launch (Week 3)
1. Mobile optimization
2. Analytics implementation
3. Sharing and SEO optimization
4. Performance optimization

## Key Implementation Notes

### Database Best Practices
- Use connection pooling with Neon
- Implement proper error handling
- Add database migrations system
- Optimize queries with proper indexing

### Security Considerations
- Validate all Farcaster signatures
- Sanitize user inputs
- Implement rate limiting
- Secure session management

### Performance Requirements
- Fast profile loading (<2s)
- Efficient auto-scanning
- Optimized mobile experience
- CDN-ready static assets

### Error Handling
- Graceful fallbacks for API failures
- User-friendly error messages
- Comprehensive logging
- Retry mechanisms for external APIs

This structure provides a solid foundation for building Fartree efficiently while maintaining clean, scalable code architecture.