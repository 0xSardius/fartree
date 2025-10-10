"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { WindowFrame } from "~/components/window-frame"
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar"
import { Button } from "~/components/ui/Button"
import { Card, CardContent } from "~/components/ui/card"
import { useAuth } from "~/contexts/AuthContext"
import { Users, LinkIcon, Sparkles, Loader2, Share2, ArrowRight } from "lucide-react"

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

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/')
    }
  }, [authLoading, isAuthenticated, router])

  useEffect(() => {
    async function fetchFriends() {
      if (!user?.fid) return

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
    }
  }, [user?.fid])

  if (authLoading || loading) {
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

  return (
    <div className="min-h-screen bg-fartree-background flex flex-col items-center p-4 font-mono">
      <WindowFrame
        title="Discover Friends"
        className="w-full max-w-6xl mx-auto h-[calc(100vh-2rem)]"
        contentClassName="flex flex-col h-full p-0"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b-2 border-fartree-border-dark bg-fartree-window-header">
          <div className="flex items-center gap-3">
            <Users className="w-6 h-6 text-fartree-primary-purple" />
            <div>
              <h1 className="text-lg font-bold text-fartree-text-primary">Your Friends on Fartree</h1>
              <p className="text-xs text-fartree-text-secondary">
                {discoverData?.fartree_count || 0} of {discoverData?.total_friends || 0} friends have Fartrees
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-fartree-window-background space-y-8">
          {/* Friends with Fartree */}
          {friendsWithFartree.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-fartree-primary-purple" />
                <h2 className="text-xl font-bold text-fartree-text-primary">
                  Friends with Fartrees ({friendsWithFartree.length})
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {friendsWithFartree.map((friend) => (
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
          {friendsWithoutFartree.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Share2 className="w-5 h-5 text-fartree-text-secondary" />
                <h2 className="text-lg font-semibold text-fartree-text-secondary">
                  Invite Friends ({friendsWithoutFartree.length})
                </h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {friendsWithoutFartree.slice(0, 8).map((friend) => (
                  <InviteFriendCard key={friend.fid} friend={friend} />
                ))}
              </div>
              {friendsWithoutFartree.length > 8 && (
                <p className="text-xs text-fartree-text-secondary mt-3 text-center">
                  ...and {friendsWithoutFartree.length - 8} more friends to invite
                </p>
              )}
            </section>
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
  return (
    <Card className="opacity-60 hover:opacity-100 transition-opacity">
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
        </div>
      </CardContent>
    </Card>
  )
}

