import Link from "next/link"
import { notFound } from "next/navigation"
import { Metadata } from "next"
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar"
import { LinkCard } from "~/components/link-card"
import { WindowFrame } from "~/components/window-frame"
import { Twitter, Github, Globe, Users, Figma, Wallet, Zap, Edit } from "lucide-react"
import { Button } from "~/components/ui/Button"
import { ShareProfileButton } from "~/components/profile/ShareProfileButton"

// Link category icons mapping (same as editor)
const categoryIcons = {
  social: Twitter,
  crypto: Wallet,
  content: Globe,
  collabs: Users,
  default: Globe,
}

// Interface for our data structures
interface ProfileLink {
  id: string;
  title: string;
  url: string;
  category?: string;
  position?: number;
  is_visible?: boolean;
  click_count?: number;
  auto_detected?: boolean;
  created_at?: string;
}

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

// Get icon for category
function getIconForCategory(category?: string) {
  if (!category) return categoryIcons.default
  const lowerCategory = category.toLowerCase()
  return categoryIcons[lowerCategory as keyof typeof categoryIcons] || categoryIcons.default
}

// Generate metadata for SEO and social sharing
export async function generateMetadata({ params }: { params: { fid: string } }): Promise<Metadata> {
  const { fid } = params
  
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

// Component for handling link clicks with analytics
function TrackableLink({ link, profileFid, children }: { link: ProfileLink; profileFid: number; children: React.ReactNode }) {
  const handleClick = async () => {
    try {
      // Track the click - use the correct API endpoint
      // Use a timeout to prevent blocking the navigation
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 1000)
      
      await fetch(`/api/profiles/${profileFid}/links/${link.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      })
      
      clearTimeout(timeoutId)
    } catch (error) {
      // Fail silently for analytics - don't block user navigation
      console.error('Failed to track click:', error)
    }
  }

  return (
    <Link 
      href={link.url} 
      target="_blank" 
      rel="noopener noreferrer" 
      className="block transition-transform hover:scale-[1.02]"
      onClick={handleClick}
    >
      {children}
    </Link>
  )
}

// Main component - now using server-side rendering
export default async function PublicProfileView({ params }: { params: { fid: string } }) {
  const { fid } = params

  // Fetch profile and links data server-side
  const [profile, links] = await Promise.all([
    getProfile(fid),
    getProfileLinks(fid),
  ])

  // Handle profile not found
  if (!profile) {
    notFound()
  }

  // Filter to only show visible links, sorted by position
  const visibleLinks = links
    .filter(link => link.is_visible !== false)
    .sort((a, b) => (a.position || 0) - (b.position || 0))

  const profileName = profile.display_name || profile.username || `User ${profile.fid}`

  return (
    <div className="min-h-screen bg-fartree-background flex flex-col items-center justify-center p-4 font-mono">
      <WindowFrame
        title={`${profileName}'s Fartree`}
        className="w-full max-w-md mx-auto h-[calc(100vh-4rem)] flex flex-col"
      >
        {/* Header with share button */}
        <div className="flex items-center justify-between p-3 border-b-2 border-fartree-border-dark bg-fartree-window-header">
          <div className="text-sm text-fartree-text-primary font-medium">
            FID: {profile.fid}
          </div>
          <div className="flex gap-2">
            <ShareProfileButton fid={profile.fid} profileName={profileName} />
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (typeof window !== 'undefined') {
                  window.location.href = '/editor'
                }
              }}
              className="text-xs"
            >
              <Edit className="w-3 h-3 mr-1" /> Edit
            </Button>
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center p-6 overflow-auto bg-fartree-window-background">
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

          {/* Stats */}
          <div className="flex items-center gap-4 text-fartree-text-secondary text-sm mb-6">
            <div className="flex items-center gap-1">
              <Globe className="w-4 h-4" />
              <span>{visibleLinks.length} Links</span>
            </div>
            <div className="flex items-center gap-1">
              <Zap className="w-4 h-4" />
              <span>{links.reduce((acc, link) => acc + (link.click_count || 0), 0)} Total Clicks</span>
            </div>
          </div>

          {/* Links */}
          {visibleLinks.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-center">
              <div>
                <Globe className="w-12 h-12 mx-auto mb-4 text-fartree-text-secondary" />
                <h3 className="text-lg font-medium text-fartree-text-primary mb-2">No links yet</h3>
                <p className="text-fartree-text-secondary mb-4">This profile hasn't added any links yet.</p>
              </div>
            </div>
          ) : (
            <div className="grid gap-4 w-full">
              {visibleLinks.map((link) => {
                const IconComponent = getIconForCategory(link.category)
                return (
                  <TrackableLink key={link.id} link={link} profileFid={profile.fid}>
                    <LinkCard
                      icon={IconComponent}
                      title={link.title}
                      description={link.url}
                      clickCount={link.click_count}
                      category={link.category}
                      isAutoDetected={link.auto_detected}
                      className="w-full hover:border-fartree-accent-purple cursor-pointer"
                    />
                  </TrackableLink>
                )
              })}
            </div>
          )}
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
