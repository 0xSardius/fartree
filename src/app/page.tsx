"use client"

import Link from "next/link"
import { Button } from "../components/ui/Button"
import { WindowFrame } from "../components/window-frame"
import { ArrowRight, Sparkles, LinkIcon, User } from "lucide-react"
import { useRouter } from "next/navigation"

export default function LandingPage() {
  const router = useRouter()
  return (
    <div className="min-h-screen bg-fartree-background flex flex-col items-center justify-center p-4 font-mono">
      <WindowFrame title="Fartree OS" className="w-full max-w-4xl h-[calc(100vh-4rem)] flex flex-col">
        <header className="flex items-center justify-between p-4 border-b-2 border-fartree-border-dark bg-fartree-window-header">
          <div className="text-2xl font-bold text-fartree-primary-purple">Fartree</div>
          <nav>
            <Button variant="ghost" className="text-fartree-text-primary hover:text-fartree-accent-purple">
              Sign In
            </Button>
          </nav>
        </header>

        <main className="flex-1 flex flex-col items-center justify-center text-center p-8 overflow-auto bg-fartree-window-background">
          <section className="hero-section mb-12">
            <h1 className="text-5xl md:text-7xl font-bold text-fartree-text-primary mb-4 leading-tight">
              The <span className="text-fartree-primary-purple">Linktree</span> for Farcaster
            </h1>
            <p className="text-lg md:text-xl text-fartree-text-secondary mb-8 max-w-2xl">
              Connect all your Web3 activities, mini-apps, tokens, and collaborations in one shareable link,
              auto-generated from your FID.
            </p>
            <Button
              onClick={async () => {
                // Simulate Neynar SIWN success and profile creation/retrieval
                // In a real app, this would involve a redirect to Neynar and a callback
                const simulatedFarcasterData = {
                  fid: 12345, // Replace with actual FID from Neynar
                  username: "alicesmith", // Replace with actual username
                  displayName: "Alice Smith",
                  bio: "Web3 enthusiast, builder, and cat lover.",
                  avatarUrl: "/placeholder-user.jpg",
                }

                try {
                  const response = await fetch("/api/auth/neynar-siwn", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify(simulatedFarcasterData),
                  })

                  const data = await response.json()
                  if (data.success) {
                    console.log("Simulated Farcaster Sign-In successful:", data)
                    // Redirect to onboarding or editor based on whether it's a new user
                    router.push("/onboarding") // Or '/editor' if already onboarded
                  } else {
                    console.error("Simulated Farcaster Sign-In failed:", data.error)
                    alert("Sign-in failed: " + data.error)
                  }
                } catch (error) {
                  console.error("Error during simulated Farcaster Sign-In:", error)
                  alert("An error occurred during sign-in.")
                }
              }}
              className="relative inline-flex h-12 overflow-hidden rounded-md p-[1px] focus:outline-none focus:ring-2 focus:ring-fartree-accent-purple focus:ring-offset-2 focus:ring-offset-fartree-background"
            >
              <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#8465CB_0%,#a478e8_50%,#8465CB_100%)]" />
              <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-md bg-fartree-primary-purple px-8 py-2 text-lg font-medium text-fartree-text-primary backdrop-blur-3xl hover:bg-fartree-accent-purple transition-colors duration-300">
                Sign in with Farcaster <ArrowRight className="ml-2 h-5 w-5" />
              </span>
            </Button>
          </section>

          <section className="feature-preview w-full max-w-3xl grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-fartree-window-background p-6 rounded-lg border-2 border-fartree-border-dark shadow-md">
              <Sparkles className="w-8 h-8 text-fartree-primary-purple mb-3" />
              <h3 className="font-semibold text-fartree-text-primary text-xl mb-2">Auto-Detection</h3>
              <p className="text-fartree-text-secondary text-sm">
                Automatically pulls your Web3 activities from your FID.
              </p>
            </div>
            <div className="bg-fartree-window-background p-6 rounded-lg border-2 border-fartree-border-dark shadow-md">
              <LinkIcon className="w-8 h-8 text-fartree-primary-purple mb-3" />
              <h3 className="font-semibold text-fartree-text-primary text-xl mb-2">Unified Links</h3>
              <p className="text-fartree-text-secondary text-sm">One link to share all your digital presence.</p>
            </div>
            <div className="bg-fartree-window-background p-6 rounded-lg border-2 border-fartree-border-dark shadow-md">
              <User className="w-8 h-8 text-fartree-primary-purple mb-3" />
              <h3 className="font-semibold text-fartree-text-primary text-xl mb-2">Custom Profiles</h3>
              <p className="text-fartree-text-secondary text-sm">
                Personalize your Fartree profile to match your brand.
              </p>
            </div>
          </section>
        </main>

        <footer className="p-4 border-t-2 border-fartree-border-dark text-fartree-text-secondary text-sm text-center bg-fartree-window-header">
          <p>&copy; {new Date().getFullYear()} Fartree. All rights reserved.</p>
          <div className="flex justify-center gap-4 mt-2">
            <Link href="#" className="hover:text-fartree-accent-purple">
              Privacy
            </Link>
            <Link href="#" className="hover:text-fartree-accent-purple">
              Terms
            </Link>
            <Link href="#" className="hover:text-fartree-accent-purple">
              Contact
            </Link>
          </div>
        </footer>
      </WindowFrame>
    </div>
  )
}
