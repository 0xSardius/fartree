# Fartree Profile Navigation Debugging Guide

## 🔍 The Problem
- Friends who have created Fartree profiles aren't showing up in the Discover page
- Clicking on profile links doesn't navigate to the profile page

## 🎯 Most Likely Causes

### 1. **No Profiles Exist in Database Yet**
Your friends may not have created Fartree profiles yet. The Discover page only shows friends who have:
- Created a profile in Fartree
- Added at least one link to their profile

### 2. **Database Connection Issue**
The profile lookup query might be failing silently.

### 3. **Navigation Being Blocked by Farcaster SDK**
The SDK analytics errors might be interfering with client-side navigation.

---

## 🛠️ Step-by-Step Debugging

### **Step 1: Check What Profiles Exist**

Open this URL to see ALL profiles in your database:
```
https://fartree.vercel.app/api/debug/list-profiles
```

**What to look for:**
- How many profiles exist?
- Do you recognize any usernames?
- Do your friends' FIDs appear in the list?

**Example response:**
```json
{
  "success": true,
  "total_profiles": 5,
  "profiles": [
    {
      "fid": 238814,
      "username": "yourname",
      "display_name": "Your Name",
      "link_count": 3,
      "profile_url": "/profile/238814"
    }
  ]
}
```

---

### **Step 2: Check Server Logs for Discover API**

After you load the Discover page, check your Vercel deployment logs:

**Look for these log messages:**
```
[Discover] Checking 20 friends for Fartree profiles: [123, 456, 789...]
[Discover] Found 2 Fartree profiles: [{ fid: 123, username: "alice", links: "5" }]
[Discover] Result: 2 with Fartree, 18 without
```

**What this tells you:**
- First log: Which friends the API is checking
- Second log: Which friends have Fartree profiles in the database
- Third log: Final count sent to the UI

---

### **Step 3: Check Browser Console (Client-Side)**

Open DevTools Console in the Farcaster app and look for:

**On page load:**
```
[Discover] Data loaded: {
  total_friends: 20,
  fartree_count: 2,
  friends_with_fartree: [
    { fid: 123, username: "alice", has_fartree: true, link_count: 5 }
  ]
}
```

**When you click a profile:**
```
🖱️ FriendCard clicked! { fid: 123, username: "alice", display_name: "Alice" }
👥 Navigating to friend profile: 123
```

**On the profile page (if it loads):**
```
[Server] Rendering profile for FID: 123
[Server] Successfully loaded profile for alice (FID: 123)
📍 Profile page loaded for FID: 123
```

---

### **Step 4: Test Your Own Profile Navigation**

1. Go to the Discover page
2. Click the "My Profile" button in the top right
3. Watch the console for:
   ```
   🧪 Testing navigation to own profile: 238814
   ✅ Navigation initiated
   ```

**If you see your own profile:**
- ✅ Navigation works!
- ✅ Database connection works!
- ❌ Your friends just haven't created Fartrees yet

**If you DON'T see your own profile:**
- ❌ Navigation or database issue
- Check Vercel logs for server errors

---

### **Step 5: Check a Specific Friend's Profile**

If you know a friend's FID, test their profile directly:
```
https://fartree.vercel.app/api/debug/profile-check?fid=123456
```

Replace `123456` with their actual FID.

**Example response (profile exists):**
```json
{
  "success": true,
  "exists": true,
  "profile": {
    "fid": 123456,
    "username": "alice",
    "display_name": "Alice",
    "link_count": 5
  },
  "profile_url": "/profile/123456"
}
```

**Example response (no profile):**
```json
{
  "success": false,
  "exists": false,
  "message": "No profile found for FID 123456"
}
```

---

## 🎯 Common Scenarios & Solutions

### **Scenario A: No Friends Show Up in "Friends with Fartrees" Section**

**Diagnosis:**
- Check `/api/debug/list-profiles` - are there ANY profiles besides yours?
- Check Vercel logs - does the discover API find any profiles?

**Most Likely:** Your friends haven't created Fartree profiles yet.

**Solution:** Invite them! Use the "Invite" button on friends in the Discover page.

---

### **Scenario B: I See Friends Listed, But Clicking Does Nothing**

**Diagnosis:**
- Check browser console when clicking
- Do you see the `🖱️ FriendCard clicked!` log?
- Do you see the `👥 Navigating to friend profile:` log?

**If you see both logs but nothing happens:**
- Check Vercel server logs for profile rendering errors
- The profile page is failing to render server-side
- Check `/api/debug/profile-check?fid=XXX` for that specific profile

**If you DON'T see any logs:**
- JavaScript error blocking click handler
- Check browser console for red errors
- Try refreshing the page

---

### **Scenario C: Farcaster SDK Errors (503/CORS)**

**These errors are HARMLESS:**
```
[usePutMiniAppEvent] Failed to record mini app event
503 Service Unavailable from client.warpcast.com
CORS errors from client.farcaster.xyz
```

**Why:** Farcaster's analytics servers are having issues. This doesn't affect your app functionality.

**Action:** Ignore these errors and focus on the `[Discover]`, `[Server]`, and emoji-prefixed logs.

---

## 🚀 Quick Diagnostic Commands

Run these in order:

1. **Check all profiles:**
   ```
   curl https://fartree.vercel.app/api/debug/list-profiles
   ```

2. **Check your profile:**
   ```
   curl https://fartree.vercel.app/api/debug/profile-check?fid=YOUR_FID
   ```

3. **Check a friend's profile:**
   ```
   curl https://fartree.vercel.app/api/debug/profile-check?fid=FRIEND_FID
   ```

---

## 📊 Understanding the Data Flow

```
User opens Discover page
  ↓
[Client] Calls /api/discover/friends?fid=YOUR_FID
  ↓
[Server] Fetches your 20 best friends from Neynar
  ↓
[Server] Queries database: "Which of these 20 friends have Fartree profiles?"
  ↓
[Server] Returns: friends_with_fartree[] + friends_without_fartree[]
  ↓
[Client] Renders two lists:
  - "Friends with Fartrees" (clickable, shows profile)
  - "Invite Friends" (shows invite button)
```

**If friends don't show up in "Friends with Fartrees":**
- They don't exist in the `profiles` table in your database
- They haven't used Fartree yet

---

## 🎓 Next Steps

1. **Deploy these changes** with the new debugging
2. **Check `/api/debug/list-profiles`** to see what profiles exist
3. **Open browser console** and go to Discover page
4. **Look for the `[Discover] Data loaded:` log** - does it show any friends_with_fartree?
5. **Click "My Profile"** button - does YOUR profile load?
6. **Share the console logs** with me if you're still stuck

---

## 💡 Pro Tips

- The discover page checks your 20 "best friends" (most engaged connections)
- If none of your top 20 friends have used Fartree, you won't see anyone
- Try the search bar to find ANY Farcaster user who has a Fartree
- Your own profile should ALWAYS work if your database is connected

---

## 🆘 If Nothing Works

Share these with me:
1. Output of `/api/debug/list-profiles`
2. Browser console logs from the Discover page
3. Vercel server logs (Functions tab in Vercel dashboard)
4. Your FID and a friend's FID you expect to see

I'll help diagnose the exact issue!

