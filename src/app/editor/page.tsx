"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { WindowFrame } from "@/components/window-frame"
import { LinkCard } from "@/components/link-card"
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
} from "lucide-react"

// Dummy data for demonstration
const dummyProfile = {
  fid: "12345",
  name: "Alice Smith",
  username: "@alicesmith",
  bio: "Web3 enthusiast, builder, and cat lover. Exploring the decentralized future.",
  avatarUrl: "/placeholder-user.jpg",
  followerCount: 1234,
  links: [
    {
      id: "1",
      icon: Twitter,
      title: "Follow me on X",
      description: "Latest thoughts and updates.",
      url: "https://x.com/alicesmith",
      clickCount: 567,
      category: "Social",
      isAutoDetected: true,
    },
    {
      id: "2",
      icon: Github,
      title: "My GitHub Repos",
      description: "Open-source contributions and projects.",
      url: "https://github.com/alicesmith",
      clickCount: 321,
      category: "Content",
      isAutoDetected: true,
    },
    {
      id: "3",
      icon: Wallet,
      title: "My Crypto Wallet",
      description: "View my public wallet address.",
      url: "https://etherscan.io/address/0x...",
      clickCount: 189,
      category: "Crypto",
      isAutoDetected: true,
    },
    {
      id: "4",
      icon: Figma,
      title: "Figma Design Portfolio",
      description: "My latest UI/UX design projects.",
      url: "https://figma.com/alicesmith",
      clickCount: 98,
      category: "Content",
      isAutoDetected: false,
    },
    {
      id: "5",
      icon: Users,
      title: "DAO Contributions",
      description: "Active in various decentralized autonomous organizations.",
      url: "https://snapshot.org/#/alicesmith",
      clickCount: 75,
      category: "Collabs",
      isAutoDetected: true,
    },
    {
      id: "6",
      icon: Globe,
      title: "Personal Website",
      description: "My blog and professional portfolio.",
      url: "https://alicesmith.com",
      clickCount: 450,
      category: "Content",
      isAutoDetected: false,
    },
  ],
}

export default function ProfileEditorInterface() {
  const [profile, setProfile] = useState(dummyProfile)

  const handleLinkReorder = (draggedId: string, targetId: string) => {
    const draggedIndex = profile.links.findIndex((link) => link.id === draggedId)
    const targetIndex = profile.links.findIndex((link) => link.id === targetId)

    if (draggedIndex === -1 || targetIndex === -1) return

    const newLinks = Array.from(profile.links)
    const [reorderedItem] = newLinks.splice(draggedIndex, 1)
    newLinks.splice(targetIndex, 0, reorderedItem)

    setProfile({ ...profile, links: newLinks })
  }

  return (
    <div className="min-h-screen bg-fartree-background flex flex-col items-center justify-center p-4 font-mono">
      <WindowFrame title="Fartree Editor" className="w-full max-w-6xl h-[calc(100vh-4rem)] flex flex-col">
        {/* Top Toolbar */}
        <div className="flex items-center justify-between p-3 border-b-2 border-fartree-border-dark bg-fartree-window-header">
          <div className="flex gap-2">
            <Button className="bg-fartree-primary-purple hover:bg-fartree-accent-purple text-fartree-text-primary">
              <Save className="w-4 h-4 mr-2" /> Save
            </Button>
            <Button
              variant="outline"
              className="border-fartree-border-dark text-fartree-text-primary hover:bg-fartree-window-background hover:text-fartree-accent-purple bg-transparent"
            >
              <Eye className="w-4 h-4 mr-2" /> Preview
            </Button>
          </div>
          <Button
            variant="outline"
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
                <AvatarImage src={profile.avatarUrl || "/placeholder.svg"} alt={profile.name} />
                <AvatarFallback>
                  {profile.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <h3 className="text-xl font-bold text-fartree-text-primary">{profile.name}</h3>
              <p className="text-fartree-text-secondary text-sm">{profile.username}</p>
              <p className="text-fartree-text-secondary text-xs mt-2">{profile.bio}</p>
            </div>
            <div className="flex-1 grid gap-3">
              {profile.links.slice(0, 3).map(
                (
                  link, // Show a few links as preview
                ) => (
                  <LinkCard
                    key={link.id}
                    icon={link.icon}
                    title={link.title}
                    description={link.description}
                    category={link.category}
                    className="!bg-fartree-window-background" // Ensure consistent background
                  />
                ),
              )}
            </div>
          </div>

          {/* Center Area: Link Management */}
          <div className="flex flex-col p-4 bg-fartree-window-background overflow-auto">
            <h2 className="text-lg font-semibold text-fartree-text-primary mb-4">Your Links</h2>
            <Button className="mb-4 bg-fartree-primary-purple hover:bg-fartree-accent-purple text-fartree-text-primary">
              <Plus className="w-4 h-4 mr-2" /> Add New Link
            </Button>
            <div className="grid gap-4 flex-1">
              {profile.links.map((link) => (
                <div
                  key={link.id}
                  draggable
                  onDragStart={(e) => e.dataTransfer.setData("linkId", link.id)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    const draggedId = e.dataTransfer.getData("linkId")
                    handleLinkReorder(draggedId, link.id)
                  }}
                  className="cursor-grab active:cursor-grabbing"
                >
                  <LinkCard
                    icon={link.icon}
                    title={link.title}
                    description={link.description}
                    clickCount={link.clickCount}
                    category={link.category}
                    isAutoDetected={link.isAutoDetected}
                    editable
                  />
                </div>
              ))}
            </div>
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
