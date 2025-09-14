# Production Data Replacements

## 🚨 Test Data That Must Be Replaced for Production

### 1. **JWT Authentication (CRITICAL)**
**File:** `src/app/api/auth/me/route.ts`
**Lines:** 100-105

```typescript
// CURRENT (TEST):
// TODO: In production, implement proper session-based auth for non-miniapp users
// For now, use test FID for development
fid = 6841; // Test FID for development

// PRODUCTION NEEDED:
// Implement proper JWT verification and session-based auth
const payload = jwt.verify(token, process.env.JWT_SECRET);
return payload.fid; // Real FID from JWT
```

### 🎯 **FIXED: Desktop UX Issue**
**Status:** ✅ **RESOLVED**
- **Problem:** Desktop users were blocked with "Not running in Mini App environment" error
- **Solution:** Implemented graceful fallback authentication
- **Result:** Seamless experience across all platforms (desktop, mobile, web)

### 2. **Test JWT Token in Scripts**
**File:** `scripts/test-auto-populate.js`
**Line:** 20

```javascript
// CURRENT (TEST):
'Authorization': 'Bearer test-jwt-token', // This will use our test FID

// PRODUCTION NEEDED:
// Real JWT from Quick Auth SDK
```

### 3. **Documentation Examples**
**File:** `documentation/farcaster-docs.md`
**Multiple locations using FID:** 6841

**File:** `documentation/fartree-concept.md` 
**Line:** 208
```markdown
- [ ] Set up Neynar API integration and test FID data fetching
```

## ✅ **Production Implementation Steps:**

1. **Implement Real JWT Verification:**
   - Install JWT library: `npm install jsonwebtoken @types/jsonwebtoken`
   - Add JWT secret to environment variables
   - Replace `extractFidFromJWT` function with real verification

2. **Update Test Scripts:**
   - Use real Quick Auth tokens for testing
   - Create separate dev/prod test configurations

3. **Environment Variables Needed:**
   - `JWT_SECRET` - for verifying Quick Auth JWTs
   - `NEYNAR_API_KEY` - already configured
   - `DATABASE_URL` - already configured

## 🔄 **Auto-Detection Status:**
- ✅ Profile data (username, bio, avatar)
- ✅ X (Twitter) accounts
- ✅ ETH/SOL addresses
- 🚧 Miniapps (see research below)
- 🚧 Tokens launched (see research below)

## 🎯 **Advanced Auto-Detection Capabilities with Neynar:**

### **1. Miniapp Activity Detection:**
- **User Feed Analysis** - `client.fetchFeed({ fid })` - Get user's cast history
- **Frame Interactions** - `client.fetchUserInteractions()` - Track miniapp usage
- **Relevant Miniapps** - `client.fetchFrameRelevant()` - Find miniapps user might like
- **Notification Tokens** - Track which miniapps user has added

### **2. Token & NFT Holdings:**
- **Token Balances** - `client.fetchUserBalance({ fid, networks: ['base'] })`
  - ERC20 token holdings
  - Native token balances
  - Currently supports Base network
- **NFT Mints** - `client.fetchRelevantMints()` - Track NFT minting activity
- **Token Creation** - Detect if user has deployed tokens via Neynar's deploy API

### **3. Financial Activity Detection:**
- **Wallet Addresses** - Already implemented (ETH/SOL from verified_addresses)
- **Transaction History** - Through wallet address analysis
- **DeFi Participation** - Token holdings indicate protocol usage
- **NFT Collections** - Holdings and minting activity

### **4. Social Graph Analysis:**
- **Best Friends** - `client.fetchBestFriends()` - Close connections
- **Mutual Follows** - Social network analysis
- **Cast Engagement** - Reactions, recasts, replies
- **Channel Participation** - FIP-2 channel activity

## 🚀 **Next-Level Auto-Detection Ideas:**

### **Phase 2 - Web3 Activity Scanner:**
```typescript
// Detect token holdings and create links
const userBalance = await client.fetchUserBalance({ fid, networks: ['base'] });
// Auto-create links to:
// - Top token holdings on Dexscreener
// - NFT collections on OpenSea
// - DeFi protocols they use

// Detect miniapp usage from cast history
const userFeed = await client.fetchFeed({ fid, limit: 100 });
// Parse casts for frame interactions
// Auto-create links to frequently used miniapps

// Detect social influence
const userStats = await client.fetchBulkUsers({ fids: [fid] });
// Create achievement badges for:
// - Follower milestones
// - Power badge status
// - Verification status
```

### **Phase 3 - Digital Empire Builder:**
```typescript
// Detect creator activities
const deployedTokens = await detectDeployedTokens(userAddresses);
const nftCollections = await detectNFTCollections(userAddresses);
const socialMetrics = await analyzeSocialImpact(fid);

// Auto-generate "Digital Empire" stats:
// - Tokens launched
// - NFT collections created
// - Social influence score
// - Community building metrics
```

## 📊 **Implementation Priority:**
1. **Token Holdings** (High impact, easy to implement)
2. **Miniapp Usage** (Core to Farcaster ecosystem)
3. **NFT Activity** (Visual appeal for profiles)
4. **Social Metrics** (Engagement and influence)
5. **Creator Economy** (Advanced detection for power users)
