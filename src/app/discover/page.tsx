"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { WindowFrame } from "~/components/window-frame"
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar"
import { Button } from "~/components/ui/Button"
import { Card, CardContent } from "~/components/ui/card"
import { useAuth } from "~/contexts/AuthContext"
import { Users, LinkIcon, Sparkles, Loader2, Share2, ArrowRight, ArrowLeft, Search } from "lucide-react"
import { sdk } from "@farcaster/miniapp-sdk"
import { Input } from "~/components/ui/input"

interface FriendData {
  fid: number
  username: string
  display_name: string
  pfp_url?: string
  follower_count: number
  following_count: number
  power_badge: boolean
  has_fartree: boolean
  fartree_data?: {
    link_count: number
    bio?: string
    updated_at: string
  }
}

interface DiscoverData {
  success: boolean
  friends_with_fartree: FriendData[]
  friends_without_fartree: FriendData[]
  total_friends: number
  fartree_count: number
}

export default function DiscoverPage() {
  const router = useRouter()
  const { user, loading: authLoading, isAuthenticated } = useAuth()
  const [loading, setLoading] = useState(true)
  const [discoverData, setDiscoverData] = useState<DiscoverData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<FriendData[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [searchMode, setSearchMode] = useState(false)

  // Enable web navigation for back button
  useEffect(() => {
    const enableBack = async () => {
      try {
        await sdk.back.enableWebNavigation()
      } catch (error) {
        // Back navigation not supported in this context
      }
    }
    
    enableBack()
    
    return () => {
      // Cleanup: disable back navigation when leaving this page
      sdk.back.disableWebNavigation().catch(() => {})
    }
  }, [])

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/')
    }
  }, [authLoading, isAuthenticated, router])

  useEffect(() => {
    async function fetchFriends() {
      if (!user?.fid) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const response = await fetch(`/api/discover/friends?fid=${user.fid}&limit=20`)
        const data = await response.json()

        if (data.success) {
          setDiscoverData(data)
        } else {
          setError(data.error || 'Failed to load friends')
        }
      } catch (err) {
        console.error('Error fetching friends:', err)
        setError('Failed to load friends')
      } finally {
        setLoading(false)
      }
    }

    if (user?.fid) {
      fetchFriends()
    } else if (!authLoading) {
      // Auth is done loading but no user - set loading to false
      setLoading(false)
    }
  }, [user?.fid, authLoading])

  // Handle global Farcaster user search with debouncing
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchMode(false)
      setSearchResults([])
      return
    }

    // Debounce search
    const timer = setTimeout(async () => {
      setSearchMode(true)
      setIsSearching(true)
      
      try {
        const viewerFidParam = user?.fid ? `&viewer_fid=${user.fid}` : '';
        const searchUrl = `/api/search/users?q=${encodeURIComponent(searchQuery)}&limit=10${viewerFidParam}`;
        
        const response = await fetch(searchUrl)
        const data = await response.json()
        
        if (data.success) {
          setSearchResults(data.users || [])
        } else {
          console.error('Search error:', data.error, data.details)
          setSearchResults([])
        }
      } catch (error) {
        console.error('Search failed:', error)
        setSearchResults([])
      } finally {
        setIsSearching(false)
      }
    }, 500) // 500ms debounce

    return () => clearTimeout(timer)
  }, [searchQuery, user?.fid])

  if (authLoading) {
    return (
      <div className="min-h-screen bg-fartree-background flex flex-col items-center justify-center p-4 font-mono">
        <div className="text-center">
          <Loader2 className="animate-spin h-8 w-8 mx-auto mb-4 text-fartree-primary-purple" />
          <p className="text-fartree-text-primary">Authenticating...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-fartree-background flex flex-col items-center justify-center p-4 font-mono">
        <WindowFrame title="Discover Friends" className="w-full max-w-2xl">
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="text-red-500 text-4xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-fartree-text-primary mb-2">Authentication Required</h1>
            <p className="text-fartree-text-secondary mb-6">Please sign in to discover your friends.</p>
            <Button onClick={() => router.push('/')}>Go to Home</Button>
          </div>
        </WindowFrame>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-fartree-background flex flex-col items-center justify-center p-4 font-mono">
        <div className="text-center">
          <Loader2 className="animate-spin h-8 w-8 mx-auto mb-4 text-fartree-primary-purple" />
          <p className="text-fartree-text-primary">Loading your friends...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-fartree-background flex flex-col items-center justify-center p-4 font-mono">
        <WindowFrame title="Discover Friends" className="w-full max-w-2xl">
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="text-red-500 text-4xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-fartree-text-primary mb-2">Oops!</h1>
            <p className="text-fartree-text-secondary mb-6">{error}</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        </WindowFrame>
      </div>
    )
  }

  const friendsWithFartree = discoverData?.friends_with_fartree || []
  const friendsWithoutFartree = discoverData?.friends_without_fartree || []

  // Filter friends based on search query
  const filterFriends = (friends: FriendData[]) => {
    if (!searchQuery.trim()) return friends
    
    const query = searchQuery.toLowerCase()
    return friends.filter(friend => 
      friend.username?.toLowerCase().includes(query) ||
      friend.display_name?.toLowerCase().includes(query) ||
      friend.fid.toString().includes(query)
    )
  }

  const filteredFriendsWithFartree = filterFriends(friendsWithFartree)
  const filteredFriendsWithoutFartree = filterFriends(friendsWithoutFartree)

  return (
    <div className="min-h-screen bg-fartree-background flex flex-col items-center p-4 font-mono">
      <WindowFrame
        title="Discover Friends"
        className="w-full max-w-6xl mx-auto h-[calc(100vh-2rem)]"
        contentClassName="flex flex-col h-full p-0"
      >
        {/* Header */}
        <div className="p-4 border-b-2 border-fartree-border-dark bg-fartree-window-header space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.back()}
                className="flex items-center gap-1"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Back</span>
              </Button>
              <div>
                <h1 className="text-lg font-bold text-fartree-text-primary">Discover Friends</h1>
                <p className="text-xs text-fartree-text-secondary">
                  {searchMode 
                    ? `Searching Farcaster...` 
                    : `${discoverData?.fartree_count || 0} friends with Fartrees • ${discoverData?.total_friends || 0} closest connections`
                  }
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/editor')}
            >
              My Profile
            </Button>
          </div>
          
          {/* Search Bar */}
          <div>
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-fartree-text-secondary pointer-events-none z-10" />
              <Input
                type="text"
                placeholder="Search by username or FID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-fartree-window-background border-fartree-border-dark text-fartree-text-primary placeholder:text-fartree-text-secondary"
              />
            </div>
            <p className="text-xs text-fartree-text-secondary mt-1 ml-1">
              {searchMode 
                ? `Showing search results from all of Farcaster` 
                : `Showing your 20 closest connections • Search to find anyone on Farcaster`
              }
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-fartree-window-background space-y-8">
          {/* Search Mode: Show global search results */}
          {searchMode ? (
            <>
              {isSearching ? (
                <div className="text-center py-12">
                  <Loader2 className="animate-spin w-8 h-8 text-fartree-primary-purple mx-auto mb-4" />
                  <p className="text-fartree-text-secondary">Searching Farcaster...</p>
                </div>
              ) : searchResults.length > 0 ? (
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <Search className="w-5 h-5 text-fartree-primary-purple" />
                    <h2 className="text-xl font-bold text-fartree-text-primary">
                      Search Results ({searchResults.length})
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {searchResults.map((user) => (
                      <InviteFriendCard key={user.fid} friend={user} />
                    ))}
                  </div>
                </section>
              ) : (
                <div className="text-center py-12">
                  <Search className="w-16 h-16 text-fartree-text-secondary mx-auto mb-4 opacity-50" />
                  <h3 className="text-xl font-bold text-fartree-text-primary mb-2">
                    No results found
                  </h3>
                  <p className="text-fartree-text-secondary">
                    Try searching by username or FID
                  </p>
                </div>
              )}
            </>
          ) : (
            /* Default Mode: Show best friends lists */
            <>
              {/* Friends with Fartree */}
              {filteredFriendsWithFartree.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-fartree-primary-purple" />
                <h2 className="text-xl font-bold text-fartree-text-primary">
                  Friends with Fartrees ({filteredFriendsWithFartree.length})
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredFriendsWithFartree.map((friend) => (
                  <FriendCard
                    key={friend.fid}
                    friend={friend}
                    onClick={() => router.push(`/profile/${friend.fid}`)}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Empty state for friends with Fartree */}
          {friendsWithFartree.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-fartree-text-secondary mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-bold text-fartree-text-primary mb-2">
                No friends on Fartree yet
              </h3>
              <p className="text-fartree-text-secondary mb-6">
                Be the first among your friends to create a Fartree profile!
              </p>
            </div>
          )}

          {/* Friends without Fartree */}
          {filteredFriendsWithoutFartree.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Share2 className="w-5 h-5 text-fartree-text-secondary" />
                <h2 className="text-lg font-semibold text-fartree-text-secondary">
                  Invite Friends ({filteredFriendsWithoutFartree.length})
                </h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {filteredFriendsWithoutFartree.slice(0, 8).map((friend) => (
                  <InviteFriendCard key={friend.fid} friend={friend} />
                ))}
              </div>
              {filteredFriendsWithoutFartree.length > 8 && (
                <p className="text-xs text-fartree-text-secondary mt-3 text-center">
                  ...and {filteredFriendsWithoutFartree.length - 8} more friends to invite
                </p>
              )}
            </section>
          )}
            </>
          )}
        </div>
      </WindowFrame>
    </div>
  )
}

// Friend Card Component (with Fartree)
function FriendCard({ friend, onClick }: { friend: FriendData; onClick: () => void }) {
  return (
    <Card
      className="cursor-pointer hover:border-fartree-primary-purple transition-colors"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Avatar className="w-12 h-12 border-2 border-fartree-primary-purple flex-shrink-0">
            <AvatarImage src={friend.pfp_url} alt={friend.display_name} />
            <AvatarFallback className="bg-fartree-primary-purple text-white">
              {friend.display_name?.[0] || friend.username?.[0] || '?'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1">
              <h3 className="font-semibold text-fartree-text-primary truncate">
                {friend.display_name}
              </h3>
              {friend.power_badge && <span className="text-xs">⚡</span>}
            </div>
            <p className="text-xs text-fartree-text-secondary truncate">@{friend.username}</p>
            {friend.fartree_data && (
              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center gap-1 text-xs text-fartree-primary-purple">
                  <LinkIcon className="w-3 h-3" />
                  <span>{friend.fartree_data.link_count} links</span>
                </div>
              </div>
            )}
          </div>
          <ArrowRight className="w-4 h-4 text-fartree-text-secondary flex-shrink-0" />
        </div>
      </CardContent>
    </Card>
  )
}

// Invite Friend Card Component (without Fartree)
function InviteFriendCard({ friend }: { friend: FriendData }) {
  const handleInvite = async () => {
    const shareText = `Hey @${friend.username}! 👋 Check out Fartree - it's like Linktree for Farcaster. Create your Web3 profile in seconds! 🌳✨`
    const shareUrl = window.location.origin
    
    try {
      // Use composeCast to stay within Farcaster (doesn't open new tab)
      await sdk.actions.composeCast({
        text: shareText,
        embeds: [shareUrl],
      })
    } catch (error) {
      // Fallback: copy to clipboard
      try {
        const inviteMessage = `${shareText}\n\n${shareUrl}`
        await navigator.clipboard.writeText(inviteMessage)
        alert('Invite message copied to clipboard! Share it with your friend.')
      } catch (clipboardError) {
        console.error('Error inviting friend:', error)
      }
    }
  }

  return (
    <Card 
      className="opacity-60 hover:opacity-100 transition-opacity cursor-pointer hover:border-fartree-primary-purple"
      onClick={handleInvite}
    >
      <CardContent className="p-3">
        <div className="flex flex-col items-center text-center gap-2">
          <Avatar className="w-10 h-10 border border-fartree-border-dark">
            <AvatarImage src={friend.pfp_url} alt={friend.display_name} />
            <AvatarFallback className="bg-fartree-border-dark text-fartree-text-secondary text-xs">
              {friend.display_name?.[0] || friend.username?.[0] || '?'}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 w-full">
            <p className="text-xs font-medium text-fartree-text-primary truncate">
              {friend.display_name}
            </p>
            <p className="text-[10px] text-fartree-text-secondary truncate">@{friend.username}</p>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="w-full text-xs py-1 h-7 flex items-center justify-center gap-1"
            onClick={(e) => {
              e.stopPropagation()
              handleInvite()
            }}
          >
            <Share2 className="w-3 h-3" />
            <span>Invite</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

