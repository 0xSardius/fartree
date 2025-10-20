import { notFound } from "next/navigation"
import { Metadata } from "next"
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar"
import { ProfileLinkList, type ProfileLink } from "~/components/profile/ProfileLinkList"
import { ProfileHeroStats } from "~/components/profile/ProfileHeroStats"
import { ProfileSection } from "~/components/profile/ProfileSection"
import { WindowFrame } from "~/components/window-frame"
import { ShareProfileButton } from "~/components/profile/ShareProfileButton"
import { EditButton } from "~/components/profile/EditButton"
import { Zap } from "lucide-react"


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
    // Use direct database query instead of internal API call
    const { query } = await import('~/lib/db')
    
    // Helper function to determine if identifier is FID (numeric) or username
    const isNumeric = (str: string): boolean => {
      return !isNaN(Number(str)) && !isNaN(parseFloat(str))
    }

    let result
    if (isNumeric(identifier)) {
      result = await query('SELECT * FROM profiles WHERE fid = $1', [parseInt(identifier)])
    } else {
      result = await query('SELECT * FROM profiles WHERE username = $1', [identifier])
    }
    
    return result.rows.length > 0 ? result.rows[0] : null
  } catch (error) {
    console.error('Error fetching profile:', error)
    return null
  }
}

async function getProfileLinks(identifier: string): Promise<ProfileLink[]> {
  try {
    // Use direct database query instead of internal API call
    const { query } = await import('~/lib/db')
    
    // Helper function to determine if identifier is FID (numeric) or username
    const isNumeric = (str: string): boolean => {
      return !isNaN(Number(str)) && !isNaN(parseFloat(str))
    }

    // First get the profile ID
    let profileResult
    if (isNumeric(identifier)) {
      profileResult = await query('SELECT id FROM profiles WHERE fid = $1', [parseInt(identifier)])
    } else {
      profileResult = await query('SELECT id FROM profiles WHERE username = $1', [identifier])
    }
    
    if (profileResult.rows.length === 0) {
      return []
    }
    
    const profileId = profileResult.rows[0].id
    
    // Get the links for this profile
    const linksResult = await query(`
      SELECT id, title, url, category, position, is_visible, click_count, auto_detected, created_at
      FROM profile_links 
      WHERE profile_id = $1 AND is_visible = true
      ORDER BY position ASC, created_at ASC
    `, [profileId])
    
    return linksResult.rows
  } catch (error) {
    console.error('Error fetching links:', error)
    return []
  }
}

// Generate metadata for SEO and social sharing
export async function generateMetadata({ params }: { params: Promise<{ fid: string }> }): Promise<Metadata> {
  const { fid } = await params
  
  try {
    const profile = await getProfile(fid)
    
    if (!profile) {
      return {
        title: 'Profile Not Found - Fartree',
        description: 'This Fartree profile does not exist.',
      }
    }
    
    const profileName = profile.display_name || profile.username || `User ${profile.fid}`
    const description = profile.bio || `${profileName}'s Fartree profile - Web3 links and digital identity`
    
    return {
      title: `${profileName} - Fartree`,
      description,
      openGraph: {
        title: `${profileName} - Fartree`,
        description,
        images: profile.avatar_url ? [profile.avatar_url] : undefined,
        type: 'profile',
      },
      twitter: {
        card: 'summary',
        title: `${profileName} - Fartree`,
        description,
        images: profile.avatar_url ? [profile.avatar_url] : undefined,
      },
    }
  } catch (error) {
    return {
      title: 'Fartree Profile',
      description: 'Web3 profile and links',
    }
  }
}


// Main component - now using server-side rendering
export default async function PublicProfileView({ params }: { params: Promise<{ fid: string }> }) {
  const { fid } = await params

  // Fetch profile and links data server-side
  const [profile, links] = await Promise.all([
    getProfile(fid),
    getProfileLinks(fid),
  ])

  if (!profile) {
    notFound()
  }

  const visibleLinks = links
    .filter((link) => link.is_visible !== false)
    .sort((a, b) => (a.position || 0) - (b.position || 0))

  const profileName = profile.display_name || profile.username || `User ${profile.fid}`

  const totalClicks = visibleLinks.reduce((acc, link) => acc + (link.click_count || 0), 0)
  const autoDetectedCount = visibleLinks.filter((link) => link.auto_detected).length

  const empireLinks = visibleLinks.filter((link) => link.category?.toLowerCase() === "crypto")
  const collabLinks = visibleLinks.filter((link) => link.category?.toLowerCase() === "collabs")
  const socialLinks = visibleLinks.filter((link) => link.category?.toLowerCase() === "social")
  const contentLinks = visibleLinks.filter((link) => link.category?.toLowerCase() === "content")
  const signatureLinks = visibleLinks.filter(
    (link) => !["crypto", "collabs", "social", "content"].includes(link.category?.toLowerCase() || ""),
  )

  const badgeLabels: string[] = []
  if (empireLinks.length > 0) {
    badgeLabels.push("Empire Builder")
  }
  if (collabLinks.length > 0) {
    badgeLabels.push("Collaboration King")
  }
  if (totalClicks > 100) {
    badgeLabels.push("Viral Spark")
  }

  return (
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
            <EditButton />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-fartree-window-background min-h-0">
          <div className="flex flex-col items-center p-6 space-y-6">
          {/* Profile Header */}
          <Avatar className="w-24 h-24 border-4 border-fartree-primary-purple mb-4 shadow-lg">
            <AvatarImage src={profile.avatar_url || "/placeholder.svg"} alt={profileName} />
            <AvatarFallback className="bg-fartree-primary-purple text-white text-2xl">
              {profileName
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          
          <h1 className="text-2xl font-bold text-fartree-text-primary mb-1">{profileName}</h1>
          
          {profile.username && (
            <p className="text-fartree-text-secondary text-sm mb-2">@{profile.username}</p>
          )}
          
          {profile.bio && (
            <p className="text-fartree-text-secondary text-center max-w-xs mb-4">{profile.bio}</p>
          )}

          <ProfileHeroStats
            totalClicks={totalClicks}
            autoDetectedCount={autoDetectedCount}
            badgeLabels={badgeLabels}
            followerCount={profile.follower_count}
          />

          <div className="space-y-4 w-full">
            {empireLinks.length > 0 && (
              <ProfileSection
                title="Your Empire"
                description="Flagship projects, tokens, and onchain creations."
              >
                <ProfileLinkList
                  initialLinks={empireLinks}
                  profileFid={profile.fid}
                  showSummary={false}
                />
              </ProfileSection>
            )}

            {collabLinks.length > 0 && (
              <ProfileSection
                title="Collaboration King"
                description="Builds and splits with fellow Farcaster creators."
              >
                <ProfileLinkList
                  initialLinks={collabLinks}
                  profileFid={profile.fid}
                  showSummary={false}
                />
              </ProfileSection>
            )}

            {contentLinks.length > 0 && (
              <ProfileSection
                title="Content That Slaps"
                description="Viral casts, frames, and content that grab attention."
              >
                <ProfileLinkList
                  initialLinks={contentLinks}
                  profileFid={profile.fid}
                  showSummary={false}
                />
              </ProfileSection>
            )}

            {socialLinks.length > 0 && (
              <ProfileSection
                title="Signal Boost"
                description="Where to connect and follow the journey."
              >
                <ProfileLinkList
                  initialLinks={socialLinks}
                  profileFid={profile.fid}
                  showSummary={false}
                />
              </ProfileSection>
            )}

            {signatureLinks.length > 0 && (
              <ProfileSection
                title="Signature Moves"
                description="Hand-picked links that define your vibe."
              >
                <ProfileLinkList
                  initialLinks={signatureLinks}
                  profileFid={profile.fid}
                  showSummary={false}
                />
              </ProfileSection>
            )}
          </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="p-4 border-t-2 border-fartree-border-dark text-fartree-text-secondary text-xs text-center bg-fartree-window-header">
          <div className="flex items-center justify-between">
            <p className="flex items-center gap-1">
              Powered by <Zap className="w-3 h-3 text-fartree-primary-purple" /> Fartree
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
  )
}
