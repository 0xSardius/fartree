import { notFound } from "next/navigation";
import { Metadata } from "next";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import {
  ProfileLinkList,
  type ProfileLink,
} from "~/components/profile/ProfileLinkList";
import { WindowFrame } from "~/components/window-frame";
import { ShareProfileButton } from "~/components/profile/ShareProfileButton";
import { EditButton } from "~/components/profile/EditButton";
import { CreateFartreeCTA } from "~/components/profile/CreateFartreeCTA";
import { ProfilePageClient } from "~/components/profile/ProfilePageClient";

interface ProfileData {
  id: string;
  fid: number;
  username?: string;
  display_name?: string;
  bio?: string;
  avatar_url?: string;
  theme?: string;
  created_at?: string;
  updated_at?: string;
  follower_count?: number;
  following_count?: number;
  power_badge?: boolean;
}

// Server-side data fetching functions
async function getProfile(identifier: string): Promise<ProfileData | null> {
  try {
    console.log(
      `[Profile] 🔍 Fetching profile for identifier: "${identifier}" (type: ${typeof identifier})`
    );

    // Use direct database query instead of internal API call
    const { query } = await import("~/lib/db");

    // Helper function to determine if identifier is FID (numeric) or username
    const isNumeric = (str: string): boolean => {
      return !isNaN(Number(str)) && !isNaN(parseFloat(str));
    };

    let result;
    if (isNumeric(identifier)) {
      console.log(`[Profile] 📊 Querying by FID: "${identifier}"`);
      // CRITICAL: FIDs are stored as strings in the database
      result = await query("SELECT * FROM profiles WHERE fid = $1", [
        identifier, // Keep as string to match database
      ]);
      console.log(`[Profile] ✅ FID query returned ${result.rows.length} rows`);
    } else {
      console.log(`[Profile] 👤 Querying by username: "${identifier}"`);
      result = await query("SELECT * FROM profiles WHERE username = $1", [
        identifier,
      ]);
      console.log(
        `[Profile] ✅ Username query returned ${result.rows.length} rows`
      );
    }

    if (result.rows.length > 0) {
      console.log(
        `[Profile] 🎉 Found profile: FID ${result.rows[0].fid}, username ${result.rows[0].username}`
      );
    } else {
      console.log(
        `[Profile] ❌ No profile found for identifier: "${identifier}"`
      );
    }

    return result.rows.length > 0 ? result.rows[0] : null;
  } catch (error) {
    console.error(`[Profile] ❌ Error fetching profile:`, error);
    return null;
  }
}

async function getProfileLinks(identifier: string): Promise<ProfileLink[]> {
  try {
    // Use direct database query instead of internal API call
    const { query } = await import("~/lib/db");

    // Helper function to determine if identifier is FID (numeric) or username
    const isNumeric = (str: string): boolean => {
      return !isNaN(Number(str)) && !isNaN(parseFloat(str));
    };

    // First get the profile ID
    let profileResult;
    if (isNumeric(identifier)) {
      // CRITICAL: FIDs are stored as strings in the database
      profileResult = await query("SELECT id FROM profiles WHERE fid = $1", [
        identifier, // Keep as string to match database
      ]);
    } else {
      profileResult = await query(
        "SELECT id FROM profiles WHERE username = $1",
        [identifier]
      );
    }

    if (profileResult.rows.length === 0) {
      return [];
    }

    const profileId = profileResult.rows[0].id;

    // Get the links for this profile
    const linksResult = await query(
      `
      SELECT id, title, url, category, position, is_visible, click_count, auto_detected, created_at
      FROM profile_links 
      WHERE profile_id = $1 AND is_visible = true
      ORDER BY position ASC, created_at ASC
    `,
      [profileId]
    );

    return linksResult.rows;
  } catch {
    return [];
  }
}

// Generate metadata for SEO and social sharing
export async function generateMetadata({
  params,
}: {
  params: Promise<{ fid: string }>;
}): Promise<Metadata> {
  const { fid } = await params;

  try {
    const profile = await getProfile(fid);
    const { getMiniAppEmbedMetadata } = await import("~/lib/utils");
    const baseUrl = process.env.NEXT_PUBLIC_URL || "https://fartree.vercel.app";

    if (!profile) {
      return {
        title: "Profile Not Found - Fartree",
        description: "This Fartree profile does not exist.",
      };
    }

    const profileName =
      profile.display_name || profile.username || `User ${profile.fid}`;
    const description =
      profile.bio ||
      `${profileName}'s Fartree profile - Web3 links and digital identity`;
    const profileImageUrl =
      profile.avatar_url || `${baseUrl}/api/opengraph-image?fid=${fid}`;

    return {
      title: `${profileName} - Fartree`,
      description,
      openGraph: {
        title: `${profileName} - Fartree`,
        description,
        images: [profileImageUrl],
        type: "profile",
        url: `${baseUrl}/profile/${fid}`,
      },
      twitter: {
        card: "summary_large_image",
        title: `${profileName} - Fartree`,
        description,
        images: [profileImageUrl],
      },
      other: {
        "fc:miniapp": JSON.stringify(getMiniAppEmbedMetadata(profileImageUrl)),
      },
    };
  } catch {
    return {
      title: "Fartree Profile",
      description: "Web3 profile and links",
    };
  }
}

// Main component - now using server-side rendering
export default async function PublicProfileView({
  params,
}: {
  params: Promise<{ fid: string }>;
}) {
  const { fid } = await params;

  console.log(`[Server] 🚀 Rendering profile page for FID: ${fid}`);

  // Fetch profile and links data server-side
  let profile, links;
  try {
    [profile, links] = await Promise.all([
      getProfile(fid),
      getProfileLinks(fid),
    ]);
    console.log(
      `[Server] ✅ Fetch complete - Profile: ${
        profile ? "FOUND" : "NOT FOUND"
      }, Links: ${links?.length || 0}`
    );
  } catch (error) {
    console.error(`[Server] ❌ Error fetching profile ${fid}:`, error);
    notFound();
  }

  if (!profile) {
    console.log(`[Server] ⚠️ Profile not found for FID: ${fid} - showing 404`);
    notFound();
  }

  console.log(
    `[Server] 🎨 Rendering profile for ${profile.username} (FID: ${profile.fid})`
  );

  console.log(
    `[Server] Successfully loaded profile for ${profile.username} (FID: ${fid})`
  );

  const profileName =
    profile.display_name || profile.username || `User ${profile.fid}`;

  return (
    <ProfilePageClient fid={fid}>
      <div className="min-h-screen bg-fartree-background flex flex-col items-center justify-center p-4 font-mono">
        <WindowFrame
          title={`${profileName}'s Fartree`}
          className="w-full max-w-md mx-auto h-[calc(100vh-4rem)]"
          contentClassName="flex flex-col h-full p-0"
        >
          {/* Header with share button */}
          <div className="flex items-center justify-between p-3 border-b-2 border-fartree-border-dark bg-fartree-window-header">
            <div className="text-sm text-fartree-text-primary font-medium">
              FID: {profile.fid}
            </div>
            <div className="flex gap-2">
              <ShareProfileButton fid={profile.fid} profileName={profileName} />
              <EditButton profileFid={profile.fid} />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto bg-fartree-window-background min-h-0">
            <div className="flex flex-col items-center p-6 space-y-6">
              {/* Profile Header */}
              <Avatar className="w-24 h-24 border-4 border-fartree-primary-purple mb-4 shadow-lg">
                <AvatarImage
                  src={profile.avatar_url || "/placeholder.svg"}
                  alt={profileName}
                />
                <AvatarFallback className="bg-fartree-primary-purple text-white text-2xl">
                  {profileName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>

              <h1 className="text-2xl font-bold text-fartree-text-primary mb-1">
                {profileName}
              </h1>

              {profile.username && (
                <p className="text-fartree-text-secondary text-sm mb-2">
                  @{profile.username}
                </p>
              )}

              {profile.bio && (
                <p className="text-fartree-text-secondary text-center max-w-xs mb-4">
                  {profile.bio}
                </p>
              )}

              <div className="space-y-4 w-full">
                {/* Simple Linktree-style single list */}
                {links.length > 0 ? (
                  <ProfileLinkList
                    initialLinks={links}
                    profileFid={profile.fid}
                    showSummary={false}
                  />
                ) : (
                  <div className="text-center py-8 text-fartree-text-secondary">
                    <p>No links yet. Check back soon!</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Visitor CTA - Shows only for non-owners */}
          <CreateFartreeCTA profileFid={profile.fid} />

          {/* Footer */}
          <footer className="p-4 border-t-2 border-fartree-border-dark text-fartree-text-secondary text-xs text-center bg-fartree-window-header">
            <div className="flex items-center justify-between">
              <p className="text-fartree-text-secondary">
                Powered by Fartree ✨
              </p>
              {profile.updated_at && (
                <p className="text-[10px]">
                  Updated {new Date(profile.updated_at).toLocaleDateString()}
                </p>
              )}
            </div>
          </footer>
        </WindowFrame>
      </div>
    </ProfilePageClient>
  );
}
