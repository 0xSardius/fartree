# Visitor UX Analysis: Non-Fartree Users Viewing Shared Profiles

*Created: October 21, 2025*  
*Status: ✅ IMPLEMENTED*

---

## 🔍 Current User Flow

**When a non-Fartree user clicks a shared profile link** (e.g., `https://fartree.xyz/profile/6841`):

1. ✅ **They land on the public profile page** - Server-side rendered, no auth required
2. ✅ **They can view all public links** - Clean Linktree-style layout
3. ⚠️ **They see an "Edit" button** - Confusing! They can't edit someone else's profile
4. ⚠️ **No clear CTA to create their own Fartree** - Missed conversion opportunity
5. ⚠️ **If they click "Edit"** → Redirected to `/editor` → Auth flow → Create their own profile
   - This works, but it's not intuitive

---

## ⚠️ Identified UX Gaps

### 1. **Edit Button Shows for Everyone**
**Current:** `EditButton.tsx` renders for all visitors  
**Problem:** Visitors can't edit someone else's profile  
**Fix:** Only show "Edit" when viewing your own profile (FID match)

### 2. **No Visitor CTA**
**Current:** No clear call-to-action for non-Fartree users  
**Problem:** Missed opportunity to convert visitors into users  
**Fix:** Add prominent "Create your own Fartree 🌳" button in footer

### 3. **Share Button Works Correctly** ✅
**Current:** Generates URLs like `https://fartree.xyz/profile/{fid}`  
**Status:** Working as intended - leads to public profile page

---

## ✅ Recommended Solution

### A. Make Edit Button Owner-Only
```tsx
// src/components/profile/EditButton.tsx
"use client"

import { useRouter } from "next/navigation"
import { useAuth } from "~/contexts/AuthContext"
import { Button } from "~/components/ui/Button"
import { Edit } from "lucide-react"

interface EditButtonProps {
  profileFid: number // Pass the profile's FID
}

export function EditButton({ profileFid }: EditButtonProps) {
  const router = useRouter()
  const { user } = useAuth()

  // Only show edit button if viewing your own profile
  if (!user || user.fid !== profileFid) {
    return null
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => router.push('/editor')}
      className="text-xs"
    >
      <Edit className="w-3 h-3 mr-1" /> Edit
    </Button>
  )
}
```

### B. Add Visitor CTA in Footer
```tsx
// In src/app/profile/[fid]/page.tsx footer section
{user?.fid !== profile.fid && (
  <Button
    onClick={() => router.push('/onboarding')}
    className="w-full mb-2 bg-fartree-primary-purple hover:bg-fartree-accent-purple"
  >
    🌳 Create your own Fartree
  </Button>
)}
```

---

## 📊 Impact Analysis

| Scenario | Before Fix | After Fix |
|----------|------------|-----------|
| **Owner views their profile** | Sees "Edit" ✅ | Sees "Edit" ✅ |
| **Visitor views profile** | Sees "Edit" ❌ | Sees "Create your own" ✅ |
| **Unauthenticated user** | Sees "Edit" ❌ | Sees "Create your own" ✅ |
| **Conversion opportunity** | Hidden | Clear CTA |

---

## 🎯 Priority

**Impact:** Medium-High (affects all shared profile links)  
**Effort:** Low (2 small component changes)  
**Recommendation:** Fix before production launch

---

## ✅ Implementation Complete

**Files Changed:**
1. `src/components/profile/EditButton.tsx` - Now accepts `profileFid` prop and only renders for owners
2. `src/components/profile/CreateFartreeCTA.tsx` - New component for visitor conversion
3. `src/app/profile/[fid]/page.tsx` - Integrated both components

**Result:**
- ✅ Edit button is now owner-only
- ✅ Visitors see "Create your own Fartree" CTA with sparkle icon
- ✅ Clear conversion funnel for shared profiles
- ✅ No linting errors

