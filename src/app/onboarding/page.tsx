"use client"

import { useState, useEffect } from "react"
import { Button } from "~/components/ui/Button"
import { WindowFrame } from "~/components/window-frame"
import { CheckCircle, Loader2, LinkIcon, User, Sparkles, ArrowRight, ArrowLeft } from "lucide-react"
import { cn } from "~/lib/utils"
import { useRouter } from "next/navigation"
import { useAuth } from "~/contexts/AuthContext"
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar"

export default function OnboardingFlow() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [profileData, setProfileData] = useState<any>(null)
  const router = useRouter()
  
  // Use centralized auth context
  const { user, loading: authLoading, error: authError, isAuthenticated, refetch } = useAuth()
  
  // Auto-advance to step 2 when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user && step === 1) {
      setStep(2)
      handleAutoScan()
    }
  }, [isAuthenticated, user, step])

  // Real auto-scanning function
  const handleAutoScan = async () => {
    setLoading(true)
    try {
      // The user data from useQuickAuth already contains the auto-populated profile
      // But let's refetch to ensure we have the latest data
      await refetch()
      
      // Simulate some scanning time for better UX
      setTimeout(() => {
        setProfileData(user)
        setLoading(false)
        setStep(3) // Move to review step
      }, 2000)
    } catch (error) {
      console.error('Auto-scan failed:', error)
      setLoading(false)
      // Still advance but show error state
      setStep(3)
    }
  }

  const handleNext = () => {
    if (step === 2) {
      handleAutoScan()
    } else {
      setStep(step + 1)
    }
  }

  const handleBack = () => {
    setStep(step - 1)
  }

  const steps = [
    {
      id: 1,
      title: "Welcome to Fartree!",
      icon: <Sparkles className="w-16 h-16 text-fartree-primary-purple mb-6" />,
      description: isAuthenticated 
        ? `Welcome back, ${user?.display_name || user?.username}! Let's set up your Fartree profile.`
        : "The Linktree for Farcaster. Connect all your Web3 activities in one shareable profile.",
      buttonText: authLoading 
        ? "Connecting..." 
        : isAuthenticated 
          ? "Continue Setup" 
          : "Connect Farcaster Account",
      action: () => {
        if (isAuthenticated) {
          setStep(2)
          handleAutoScan()
        } else {
          // Quick Auth should happen automatically in miniapp environment
          console.log("Waiting for Quick Auth...")
        }
      },
    },
    {
      id: 2,
      title: "Auto-Scanning Your Profile",
      icon: loading ? (
        <Loader2 className="w-16 h-16 text-fartree-primary-purple animate-spin mb-6" />
      ) : (
        <CheckCircle className="w-16 h-16 text-fartree-success-green mb-6" />
      ),
      description: loading
        ? "We're automatically detecting your Web3 activities and links from your FID. This might take a moment..."
        : "Scan complete! Your profile has been auto-generated.",
      buttonText: loading ? "Scanning..." : "Review My Profile",
      action: handleNext,
      disabled: loading,
    },
    {
      id: 3,
      title: "Review Your Auto-Generated Profile",
      icon: profileData?.avatar_url ? (
        <Avatar className="w-16 h-16 mb-6">
          <AvatarImage src={profileData.avatar_url} alt={profileData.display_name} />
          <AvatarFallback className="bg-fartree-primary-purple text-white text-2xl">
            {profileData.display_name?.[0] || profileData.username?.[0] || 'U'}
          </AvatarFallback>
        </Avatar>
      ) : (
        <User className="w-16 h-16 text-fartree-primary-purple mb-6" />
      ),
      description: profileData ? (
        <div className="text-left max-w-md">
          <h3 className="font-semibold text-fartree-text-primary mb-2">
            {profileData.display_name || profileData.username}
          </h3>
          {profileData.bio && (
            <p className="text-sm text-fartree-text-secondary mb-3">
              {profileData.bio.length > 100 ? profileData.bio.substring(0, 100) + '...' : profileData.bio}
            </p>
          )}
          <div className="text-sm text-fartree-text-secondary">
            <strong>Auto-detected {profileData.links?.length || 0} links:</strong>
            {profileData.links?.slice(0, 3).map((link: any, index: number) => (
              <div key={index} className="flex items-center mt-1">
                <span className="text-xs">🔗</span>
                <span className="ml-2 truncate">{link.title}</span>
                {link.auto_detected && <span className="ml-1 text-xs">🤖</span>}
              </div>
            ))}
            {(profileData.links?.length || 0) > 3 && (
              <div className="text-xs mt-1">...and {(profileData.links?.length || 0) - 3} more</div>
            )}
          </div>
        </div>
      ) : (
        "Take a look at the links and information we've pulled. You can edit or add more in the next step."
      ),
      buttonText: "Customize My Profile",
      action: handleNext,
    },
    {
      id: 4,
      title: "Customize & Organize",
      icon: <LinkIcon className="w-16 h-16 text-fartree-primary-purple mb-6" />,
      description: "Drag-and-drop to reorder, add new links, and personalize your Fartree to perfection!",
      buttonText: "Go to Editor",
      action: () => router.push('/editor'),
    },
  ]

  const currentStep = steps[step - 1]

  // Show loading state while authenticating
  if (authLoading) {
    return (
      <div className="min-h-screen bg-fartree-background flex flex-col items-center justify-center p-4 font-mono">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 mx-auto mb-4 border-4 border-fartree-primary-purple border-t-transparent rounded-full"></div>
          <p className="text-fartree-text-primary">Loading Fartree...</p>
        </div>
      </div>
    )
  }

  // Show error state if authentication fails
  if (authError) {
    return (
      <div className="min-h-screen bg-fartree-background flex flex-col items-center justify-center p-4 font-mono">
        <WindowFrame title="Fartree Onboarding" className="w-full max-w-xl h-[calc(100vh-4rem)] flex flex-col">
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="text-red-500 text-6xl mb-6">⚠️</div>
            <h1 className="text-3xl font-bold text-fartree-text-primary mb-4">Connection Error</h1>
            <p className="text-lg text-fartree-text-secondary mb-8">{authError}</p>
            <Button
              onClick={() => window.location.reload()}
              className="bg-fartree-primary-purple text-white px-6 py-3 rounded hover:bg-fartree-accent-purple"
            >
              Try Again
            </Button>
          </div>
        </WindowFrame>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-fartree-background flex flex-col items-center justify-center p-4 font-mono">
      <WindowFrame title="Fartree Onboarding" className="w-full max-w-xl h-[calc(100vh-4rem)] flex flex-col">
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 overflow-auto bg-fartree-window-background">
          <div className="mb-8 flex gap-2">
            {steps.map((s) => (
              <div
                key={s.id}
                className={cn(
                  "w-8 h-2 rounded-full transition-all duration-300",
                  step >= s.id ? "bg-fartree-primary-purple" : "bg-fartree-border-dark",
                )}
              />
            ))}
          </div>

          {currentStep.icon}
          <h1 className="text-3xl font-bold text-fartree-text-primary mb-4">{currentStep.title}</h1>
          <p className="text-lg text-fartree-text-secondary mb-8 max-w-md">{currentStep.description}</p>

          <Button
            onClick={currentStep.action}
            disabled={currentStep.disabled}
            className="relative inline-flex h-12 overflow-hidden rounded-md p-[1px] focus:outline-none focus:ring-2 focus:ring-fartree-accent-purple focus:ring-offset-2 focus:ring-offset-fartree-background"
          >
            <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#8465CB_0%,#a478e8_50%,#8465CB_100%)]" />
            <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-md bg-fartree-primary-purple px-8 py-2 text-lg font-medium text-fartree-text-primary backdrop-blur-3xl hover:bg-fartree-accent-purple transition-colors duration-300">
              {currentStep.buttonText} {step < steps.length && !loading && <ArrowRight className="ml-2 h-5 w-5" />}
            </span>
          </Button>

          {step > 1 && (
            <Button
              variant="outline"
              onClick={handleBack}
              className="mt-4 text-fartree-text-secondary hover:text-fartree-accent-purple"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>
          )}
        </div>
      </WindowFrame>
    </div>
  )
}
