# Fartree MVP Testing Checklist

## 🧪 Pre-Deployment Testing

### ✅ **1. Authentication Flow**
- [ ] Landing page loads without errors
- [ ] "Sign in with Farcaster" button works
- [ ] Quick Auth redirects properly in Farcaster client
- [ ] User profile auto-populates with correct data
- [ ] Test FID fallback works in development (localhost/ngrok)
- [ ] Real FID extraction works in production

### ✅ **2. Onboarding Flow**
- [ ] New user sees onboarding animation
- [ ] Animation steps match actual auto-detection (profile, social, crypto)
- [ ] "Go to Editor" button navigates correctly
- [ ] Profile data is visible in review step
- [ ] Auto-detected links show 🤖 indicator

### ✅ **3. Profile Editor**
- [ ] Editor loads with user's profile data
- [ ] Avatar, username, bio display correctly
- [ ] Total clicks widget shows in toolbar
- [ ] Analytics badge displays total views

**Link Management:**
- [ ] "Add New Link" button opens modal
- [ ] Can add new link with title + URL
- [ ] New link appears in list immediately
- [ ] Can edit existing link (pencil icon)
- [ ] Can delete link (trash icon in edit modal)
- [ ] Delete confirmation modal appears
- [ ] Drag-and-drop reordering works
- [ ] Link positions save correctly

**Analytics:**
- [ ] Click counts display on links
- [ ] "🔥 Top" badge shows on most-clicked link
- [ ] Eye icon shows click counts

### ✅ **4. Public Profile View**
- [ ] `/profile/[your-fid]` loads correctly
- [ ] Profile header displays avatar, name, bio
- [ ] Stats show: Lifetime Clicks, Auto-Detected count
- [ ] Badges display correctly (Link Master, Auto-Populated, Viral)
- [ ] Links display as simple vertical list (Linktree-style)
- [ ] Click on link increments counter
- [ ] Share button works
- [ ] Edit button navigates to editor (when viewing own profile)
- [ ] Page scrolls properly on mobile viewport

### ✅ **5. Friends Discovery**
- [ ] "Discover" button visible when authenticated
- [ ] `/discover` page loads without errors
- [ ] Search bar filters friends in real-time
- [ ] Friends with Fartrees show profile cards
- [ ] Friend cards display correctly (avatar, username, link count)
- [ ] Clicking friend card navigates to their profile
- [ ] "Invite" button works on friends without Fartrees
- [ ] Invite opens Farcaster composer OR copies to clipboard
- [ ] Back button works (SDK navigation)
- [ ] Manual back button in header works

### ✅ **6. Navigation & UX**
- [ ] In-app navigation works (no new tabs opening)
- [ ] Preview button saves then navigates to profile
- [ ] Back button returns to previous page
- [ ] Mobile viewport (424x695px) displays correctly
- [ ] All pages scroll within mobile frame
- [ ] No layout overflow issues

### ✅ **7. Messaging & Copy**
- [ ] Landing page: "Kickstart your profile" (not "auto-generates")
- [ ] Feature cards: Quick Setup, Discover Friends, Built-in Analytics
- [ ] Onboarding: Shows only actual detections
- [ ] No over-promising about tokens/hypersubs/casts

---

## 🚀 **Production Testing (After Deploy)**

### **In Real Farcaster Client:**
- [ ] Test in Warpcast mobile app
- [ ] Test in Warpcast desktop
- [ ] Quick Auth works with real JWT
- [ ] Your real FID is extracted
- [ ] Your real Farcaster data populates
- [ ] X (Twitter) link auto-detected (if you have verified)
- [ ] ETH address auto-detected (if you have one)
- [ ] SOL address auto-detected (if you have one)

### **Share Flow:**
- [ ] Copy profile URL works
- [ ] Share to Warpcast works
- [ ] Profile opens in browser correctly
- [ ] Profile displays for non-authenticated visitors

### **Performance:**
- [ ] Pages load in < 2 seconds
- [ ] No infinite loading spinners
- [ ] Images load correctly
- [ ] No console errors in production

---

## 🐛 **Known Non-Critical Issues**

These are safe to ignore:
- ✅ `ERR_BLOCKED_BY_CLIENT` - Warpcast analytics blocked by ad blocker
- ✅ Wallet errors - Solana wallet initialization (background noise)
- ✅ CSS preload warnings - Next.js optimization (harmless)
- ✅ SVG attribute warnings - Cosmetic only

---

## ✅ **Quick Smoke Test (5 minutes)**

**For rapid validation:**
1. [ ] Open app → Loads landing page
2. [ ] Sign in → Quick Auth works
3. [ ] Onboarding → Animation plays, profile created
4. [ ] Editor → Can add a link
5. [ ] Preview → Profile page displays
6. [ ] Discover → Friends list loads
7. [ ] Invite → Composer or clipboard works

**If all 7 pass → Ship it! 🚀**

---

## 📋 **Testing Notes**

**Environment:**
- Development: `http://localhost:3000` or ngrok URL
- Production: Your Vercel URL or custom domain

**Test Accounts:**
- Your real Farcaster account
- Test FID 6841 (development only)

**Browser Console:**
- Keep open during testing
- Look for `console.error` only (logs are fine)
- Red errors = investigate
- Yellow warnings = usually safe

---

**Ready to test? Start with the Quick Smoke Test, then do the full checklist!** ✅

