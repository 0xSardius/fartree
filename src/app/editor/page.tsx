"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "~/components/ui/Button"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { Switch } from "~/components/ui/switch"
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar"
import { WindowFrame } from "~/components/window-frame"
import { LinkCard } from "~/components/link-card"
import { useQuickAuth } from "~/hooks/useQuickAuth"
import {
  Save,
  Eye,
  Share2,
  Plus,
  Twitter,
  Github,
  Globe,
  Wallet,
  Figma,
  Users,
  Palette,
  Settings,
  LayoutGrid,
  Loader2,
  AlertCircle,
} from "lucide-react"

// Link category icons mapping
const categoryIcons = {
  social: Twitter,
  crypto: Wallet,
  content: Globe,
  collabs: Users,
  default: Globe,
}

// Interface for our link data structure
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
  links?: ProfileLink[];
}

export default function ProfileEditorInterface() {
  // Authentication and state management
  const { user, loading: authLoading, isAuthenticated } = useQuickAuth()
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [links, setLinks] = useState<ProfileLink[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [draggedItem, setDraggedItem] = useState<string | null>(null)

  // Load profile and links data
  const loadProfileData = useCallback(async () => {
    if (!user?.fid) return

    setLoading(true)
    setError(null)

    try {
      // Load profile data
      const profileResponse = await fetch(`/api/profiles/${user.fid}`)
      if (!profileResponse.ok) {
        throw new Error('Failed to load profile')
      }
      const profileData = await profileResponse.json()

      // Load links data
      const linksResponse = await fetch(`/api/profiles/${user.fid}/links?include_hidden=true`)
      if (!linksResponse.ok) {
        throw new Error('Failed to load links')
      }
      const linksData = await linksResponse.json()

      setProfile(profileData.profile)
      setLinks(linksData.links || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }, [user?.fid])

  // Load data on component mount and when user changes
  useEffect(() => {
    if (isAuthenticated && user) {
      loadProfileData()
    }
  }, [isAuthenticated, user, loadProfileData])

  // Save profile changes
  const handleSaveProfile = async () => {
    if (!profile || !user?.fid) return

    setSaving(true)
    try {
      const response = await fetch(`/api/profiles/${user.fid}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          display_name: profile.display_name,
          bio: profile.bio,
          theme: profile.theme,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save profile')
      }

      // Show success message (you could add a toast here)
      console.log('Profile saved successfully')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  // Reorder links with API call
  const handleLinkReorder = async (draggedId: string, targetId: string) => {
    const draggedIndex = links.findIndex((link) => link.id === draggedId)
    const targetIndex = links.findIndex((link) => link.id === targetId)

    if (draggedIndex === -1 || targetIndex === -1) return

    // Optimistically update UI
    const newLinks = Array.from(links)
    const [reorderedItem] = newLinks.splice(draggedIndex, 1)
    newLinks.splice(targetIndex, 0, reorderedItem)

    // Update positions
    const updatedLinks = newLinks.map((link, index) => ({
      ...link,
      position: index
    }))

    setLinks(updatedLinks)

    // Save to backend
    try {
      for (let i = 0; i < updatedLinks.length; i++) {
        const link = updatedLinks[i]
        await fetch(`/api/profiles/${user?.fid}/links/${link.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            position: i
          }),
        })
      }
    } catch (err) {
      console.error('Failed to save link order:', err)
      // Revert on error
      loadProfileData()
    }
  }

  // Add new link
  const handleAddLink = async (linkData: { title: string; url: string; category?: string }) => {
    if (!user?.fid) return

    try {
      const response = await fetch(`/api/profiles/${user.fid}/links`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(linkData),
      })

      if (!response.ok) {
        throw new Error('Failed to add link')
      }

      // Reload data to get the new link
      loadProfileData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add link')
    }
  }

  // Delete link
  const handleDeleteLink = async (linkId: string) => {
    if (!user?.fid) return

    try {
      const response = await fetch(`/api/profiles/${user.fid}/links/${linkId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete link')
      }

      // Remove from state
      setLinks(links.filter(link => link.id !== linkId))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete link')
    }
  }

  // Toggle link visibility
  const handleToggleVisibility = async (linkId: string) => {
    const link = links.find(l => l.id === linkId)
    if (!link || !user?.fid) return

    try {
      const response = await fetch(`/api/profiles/${user.fid}/links/${linkId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          is_visible: !link.is_visible
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update link visibility')
      }

      // Update state
      setLinks(links.map(l => 
        l.id === linkId 
          ? { ...l, is_visible: !l.is_visible }
          : l
      ))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update link visibility')
    }
  }

  // Get icon for category
  const getIconForCategory = (category?: string) => {
    if (!category) return categoryIcons.default
    const lowerCategory = category.toLowerCase()
    return categoryIcons[lowerCategory as keyof typeof categoryIcons] || categoryIcons.default
  }

  // Loading state
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-fartree-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-fartree-primary-purple" />
          <p className="text-fartree-text-primary">Loading your profile...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-fartree-background flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 mx-auto mb-4 text-red-500" />
          <p className="text-fartree-text-primary mb-4">Error: {error}</p>
          <Button onClick={loadProfileData} className="bg-fartree-primary-purple hover:bg-fartree-accent-purple">
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  // Not authenticated
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-fartree-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-fartree-text-primary mb-4">Please sign in to edit your profile</p>
          <Button onClick={() => window.location.href = '/'} className="bg-fartree-primary-purple hover:bg-fartree-accent-purple">
            Go to Sign In
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-fartree-background flex flex-col items-center justify-center p-4 font-mono">
      <WindowFrame title="Fartree Editor" className="w-full max-w-6xl h-[calc(100vh-4rem)] flex flex-col">
        {/* Top Toolbar */}
        <div className="flex items-center justify-between p-3 border-b-2 border-fartree-border-dark bg-fartree-window-header">
          <div className="flex gap-2">
            <Button 
              onClick={handleSaveProfile}
              disabled={saving}
              className="bg-fartree-primary-purple hover:bg-fartree-accent-purple text-fartree-text-primary"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" /> Save
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => window.open(`/profile/${user?.fid}`, '_blank')}
              className="border-fartree-border-dark text-fartree-text-primary hover:bg-fartree-window-background hover:text-fartree-accent-purple bg-transparent"
            >
              <Eye className="w-4 h-4 mr-2" /> Preview
            </Button>
          </div>
          <Button
            variant="outline"
            onClick={() => {
              const url = `${window.location.origin}/profile/${user?.fid}`
              navigator.clipboard.writeText(url)
              // You could add a toast notification here
              console.log('Profile URL copied to clipboard')
            }}
            className="border-fartree-border-dark text-fartree-text-primary hover:bg-fartree-window-background hover:text-fartree-accent-purple bg-transparent"
          >
            <Share2 className="w-4 h-4 mr-2" /> Share
          </Button>
        </div>

        <div className="flex-1 grid grid-cols-1 md:grid-cols-[280px_1fr_280px] overflow-hidden bg-fartree-window-background">
          {/* Left Sidebar: Profile Preview */}
          <div className="hidden md:flex flex-col p-4 border-r-2 border-fartree-border-dark bg-fartree-window-background overflow-auto">
            <h2 className="text-lg font-semibold text-fartree-text-primary mb-4">Profile Preview</h2>
            <div className="flex flex-col items-center text-center mb-6">
              <Avatar className="w-20 h-20 border-2 border-fartree-primary-purple mb-3">
                <AvatarImage src={profile?.avatar_url || user?.avatar_url || "/placeholder.svg"} alt={profile?.display_name || user?.display_name} />
                <AvatarFallback>
                  {(profile?.display_name || user?.display_name || 'U')
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <h3 className="text-xl font-bold text-fartree-text-primary">{profile?.display_name || user?.display_name}</h3>
              <p className="text-fartree-text-secondary text-sm">@{profile?.username || user?.username}</p>
              <p className="text-fartree-text-secondary text-xs mt-2">{profile?.bio || user?.bio}</p>
            </div>
            <div className="flex-1 grid gap-3">
              {links.slice(0, 3).map((link) => {
                const IconComponent = getIconForCategory(link.category)
                return (
                  <LinkCard
                    key={link.id}
                    icon={IconComponent}
                    title={link.title}
                    description={link.url}
                    category={link.category}
                    clickCount={link.click_count}
                    isAutoDetected={link.auto_detected}
                    className="!bg-fartree-window-background"
                  />
                )
              })}
              {links.length > 3 && (
                <p className="text-xs text-fartree-text-secondary text-center">
                  +{links.length - 3} more links
                </p>
              )}
            </div>
          </div>

          {/* Center Area: Link Management */}
          <div className="flex flex-col p-4 bg-fartree-window-background overflow-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-fartree-text-primary">Your Links ({links.length})</h2>
              <Button 
                onClick={() => {
                  // Simple add link - you could enhance this with a modal
                  const title = prompt('Link title:')
                  const url = prompt('Link URL:')
                  if (title && url) {
                    handleAddLink({ title, url, category: 'content' })
                  }
                }}
                className="bg-fartree-primary-purple hover:bg-fartree-accent-purple text-fartree-text-primary"
              >
                <Plus className="w-4 h-4 mr-2" /> Add New Link
              </Button>
            </div>
            
            {links.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-center">
                <div>
                  <Globe className="w-12 h-12 mx-auto mb-4 text-fartree-text-secondary" />
                  <h3 className="text-lg font-medium text-fartree-text-primary mb-2">No links yet</h3>
                  <p className="text-fartree-text-secondary mb-4">Add your first link to get started!</p>
                  <Button 
                    onClick={() => {
                      const title = prompt('Link title:')
                      const url = prompt('Link URL:')
                      if (title && url) {
                        handleAddLink({ title, url, category: 'content' })
                      }
                    }}
                    className="bg-fartree-primary-purple hover:bg-fartree-accent-purple text-fartree-text-primary"
                  >
                    <Plus className="w-4 h-4 mr-2" /> Add Your First Link
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid gap-4 flex-1">
                {links.map((link) => {
                  const IconComponent = getIconForCategory(link.category)
                  return (
                    <div
                      key={link.id}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData("linkId", link.id)
                        setDraggedItem(link.id)
                      }}
                      onDragEnd={() => setDraggedItem(null)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        const draggedId = e.dataTransfer.getData("linkId")
                        if (draggedId !== link.id) {
                          handleLinkReorder(draggedId, link.id)
                        }
                      }}
                      className={`cursor-grab active:cursor-grabbing transition-opacity ${
                        draggedItem === link.id ? 'opacity-50' : 'opacity-100'
                      }`}
                    >
                      <LinkCard
                        icon={IconComponent}
                        title={link.title}
                        description={link.url}
                        clickCount={link.click_count}
                        category={link.category}
                        isAutoDetected={link.auto_detected}
                        editable
                        onEdit={() => {
                          // Simple edit - you could enhance this with a modal
                          const newTitle = prompt('Edit title:', link.title)
                          if (newTitle && newTitle !== link.title) {
                            // Add edit functionality here
                            console.log('Edit link:', link.id, newTitle)
                          }
                        }}
                        onToggleVisibility={() => handleToggleVisibility(link.id)}
                        onDelete={() => {
                          if (confirm(`Delete "${link.title}"?`)) {
                            handleDeleteLink(link.id)
                          }
                        }}
                        className={!link.is_visible ? 'opacity-60' : ''}
                      />
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Right Panel: Customization Options */}
          <div className="hidden md:flex flex-col p-4 border-l-2 border-fartree-border-dark bg-fartree-window-background overflow-auto">
            <h2 className="text-lg font-semibold text-fartree-text-primary mb-4">Customization</h2>
            <div className="grid gap-6">
              <div>
                <h3 className="font-medium text-fartree-text-primary mb-2 flex items-center gap-2">
                  <Palette className="w-4 h-4" /> Theme & Colors
                </h3>
                <div className="grid gap-2">
                  <Label htmlFor="theme-select" className="text-fartree-text-secondary">
                    Theme
                  </Label>
                  <Input id="theme-select" defaultValue="Light Retro" />
                  <Label htmlFor="primary-color" className="text-fartree-text-secondary">
                    Primary Color
                  </Label>
                  <Input id="primary-color" type="color" defaultValue="#8465CB" className="h-8 w-full" />
                </div>
              </div>
              <div>
                <h3 className="font-medium text-fartree-text-primary mb-2 flex items-center gap-2">
                  <LayoutGrid className="w-4 h-4" /> Layout
                </h3>
                <div className="grid gap-2">
                  <Label htmlFor="layout-style" className="text-fartree-text-secondary">
                    Layout Style
                  </Label>
                  <Input id="layout-style" defaultValue="Grid" />
                </div>
              </div>
              <div>
                <h3 className="font-medium text-fartree-text-primary mb-2 flex items-center gap-2">
                  <Settings className="w-4 h-4" /> Visibility
                </h3>
                <div className="flex items-center justify-between">
                  <Label htmlFor="show-click-count" className="text-fartree-text-secondary">
                    Show Click Count
                  </Label>
                  <Switch id="show-click-count" defaultChecked />
                </div>
                <div className="flex items-center justify-between mt-2">
                  <Label htmlFor="show-categories" className="text-fartree-text-secondary">
                    Show Categories
                  </Label>
                  <Switch id="show-categories" defaultChecked />
                </div>
              </div>
            </div>
          </div>
        </div>
      </WindowFrame>
    </div>
  )
}
