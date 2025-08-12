import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LinkCard } from "@/components/link-card"
import { WindowFrame } from "@/components/window-frame"
import { Twitter, Github, Globe, Users, Figma, Wallet, Zap } from "lucide-react"

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

export default function PublicProfileView({ params }: { params: { fid: string } }) {
  // In a real app, you'd fetch profile data based on params.fid
  const profile = dummyProfile // Using dummy data for now

  return (
    <div className="min-h-screen bg-fartree-background flex flex-col items-center justify-center p-4 font-mono">
      <WindowFrame
        title={`${profile.name}'s Fartree`}
        className="w-full max-w-md mx-auto h-[calc(100vh-4rem)] flex flex-col"
      >
        <div className="flex-1 flex flex-col items-center p-6 overflow-auto bg-fartree-window-background">
          <Avatar className="w-24 h-24 border-4 border-fartree-primary-purple mb-4 shadow-lg">
            <AvatarImage src={profile.avatarUrl || "/placeholder.svg"} alt={profile.name} />
            <AvatarFallback>
              {profile.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <h1 className="text-2xl font-bold text-fartree-text-primary mb-1">{profile.name}</h1>
          <p className="text-fartree-text-secondary text-sm mb-2">{profile.username}</p>
          <p className="text-fartree-text-secondary text-center max-w-xs mb-4">{profile.bio}</p>
          <div className="flex items-center gap-2 text-fartree-text-secondary text-sm mb-6">
            <Users className="w-4 h-4" />
            <span>{profile.followerCount} Followers</span>
          </div>

          <div className="grid gap-4 w-full">
            {profile.links.map((link) => (
              <Link key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" className="block">
                <LinkCard
                  icon={link.icon}
                  title={link.title}
                  description={link.description}
                  clickCount={link.clickCount}
                  category={link.category}
                  isAutoDetected={link.isAutoDetected}
                  className="w-full"
                />
              </Link>
            ))}
          </div>
        </div>

        <footer className="p-4 border-t-2 border-fartree-border-dark text-fartree-text-secondary text-xs text-center bg-fartree-window-header">
          <p className="flex items-center justify-center gap-1">
            Powered by <Zap className="w-3 h-3 text-fartree-primary-purple" /> Fartree
          </p>
        </footer>
      </WindowFrame>
    </div>
  )
}
