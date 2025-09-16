"use client"

import Link from "next/link"
import { Button } from "../components/ui/Button"
import { WindowFrame } from "../components/window-frame"
import { ArrowRight, Sparkles, LinkIcon, User } from "lucide-react"
import { useRouter } from "next/navigation"
import { useQuickAuth } from "../hooks/useQuickAuth"
import { useEffect, useState } from "react"
import { sdk } from "@farcaster/miniapp-sdk"

export default function LandingPage() {
  const router = useRouter()
  const { user, loading: authLoading, isAuthenticated, error } = useQuickAuth()
  const [isSDKReady, setIsSDKReady] = useState(false)

  // Initialize Farcaster SDK and call ready()
  useEffect(() => {
    async function initializeSDK() {
      try {
        console.log('🚀 Landing page: Initializing Farcaster SDK...')
        const isInMiniApp = await sdk.isInMiniApp()
        
        if (isInMiniApp) {
          console.log('✅ Landing page: Mini App environment detected')
          console.log('📱 Landing page: Calling sdk.actions.ready() to hide splash screen')
          await sdk.actions.ready()
        } else {
          console.log('⚠️ Landing page: Not in Mini App environment - running as web app')
        }
        
        setIsSDKReady(true)
      } catch (error) {
        console.error('❌ Landing page: Failed to initialize SDK:', error)
        setIsSDKReady(true) // Still mark as ready to avoid blocking UI
      }
    }

    initializeSDK()
  }, [])

  // Redirect authenticated users to the main app
  useEffect(() => {
    if (isAuthenticated && user) {
      // Check if user has completed onboarding (has links or is returning user)
      if (user.links && user.links.length > 0) {
        router.push('/editor') // Go to editor for existing users
      } else {
        router.push('/onboarding') // Go to onboarding for new users
      }
    }
  }, [isAuthenticated, user, router])

  // Show loading while SDK initializes
  if (!isSDKReady) {
    return (
      <div className="min-h-screen bg-fartree-background flex flex-col items-center justify-center p-4 font-mono">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 mx-auto mb-4 border-4 border-fartree-primary-purple border-t-transparent rounded-full"></div>
          <p className="text-fartree-text-primary">Loading Fartree...</p>
        </div>
      </div>
    )
  }

  // If there's an auth error, still show the landing page
  // This handles desktop users who might not be in a miniapp environment

  return (
    <div className="min-h-screen bg-fartree-background flex flex-col items-center justify-center p-4 font-mono">
      <WindowFrame title="Fartree OS" className="w-full max-w-4xl h-[calc(100vh-4rem)] flex flex-col">
        <header className="flex items-center justify-between p-4 border-b-2 border-fartree-border-dark bg-fartree-window-header">
          <div className="text-2xl font-bold text-fartree-primary-purple">Fartree</div>
          <nav>
            <Button 
              variant="outline" 
              className="text-fartree-text-primary hover:text-fartree-accent-purple"
              onClick={() => router.push('/onboarding')}
              disabled={authLoading}
            >
              {authLoading ? "Connecting..." : isAuthenticated ? "Go to App" : "Sign In"}
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
              onClick={() => {
                if (authLoading) return
                
                if (isAuthenticated) {
                  // User is already authenticated, redirect appropriately
                  if (user?.links && user.links.length > 0) {
                    router.push('/app')
                  } else {
                    router.push('/onboarding')
                  }
                } else {
                  // In a miniapp environment, Quick Auth should happen automatically
                  // For web, redirect to onboarding where auth will be handled
                  router.push('/onboarding')
                }
              }}
              disabled={authLoading}
              className="relative inline-flex h-12 overflow-hidden rounded-md p-[1px] focus:outline-none focus:ring-2 focus:ring-fartree-accent-purple focus:ring-offset-2 focus:ring-offset-fartree-background"
            >
              <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#8465CB_0%,#a478e8_50%,#8465CB_100%)]" />
              <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-md bg-fartree-primary-purple px-8 py-2 text-lg font-medium text-fartree-text-primary backdrop-blur-3xl hover:bg-fartree-accent-purple transition-colors duration-300">
                {authLoading 
                  ? "Connecting..." 
                  : isAuthenticated 
                    ? "Continue to App" 
                    : "Sign in with Farcaster"
                } 
                {!authLoading && <ArrowRight className="ml-2 h-5 w-5" />}
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
