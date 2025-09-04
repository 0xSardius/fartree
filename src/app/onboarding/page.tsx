"use client"

import { useState } from "react"
import { Button } from "~/components/ui/button"
import { WindowFrame } from "~/components/window-frame"
import { CheckCircle, Loader2, LinkIcon, User, Sparkles, ArrowRight, ArrowLeft } from "lucide-react"
import { cn } from "~/lib/utils"
import { useRouter } from "next/navigation"

export default function OnboardingFlow() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleNext = () => {
    if (step === 2) {
      setLoading(true)
      setTimeout(() => {
        setLoading(false)
        setStep(step + 1)
      }, 2000) // Simulate scanning time
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
      description: "The Linktree for Farcaster. Connect all your Web3 activities in one shareable profile.",
      buttonText: "Connect Farcaster Account",
      action: async () => {
        // Simulate Neynar SIWN success and profile creation/retrieval
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
            setStep(2) // Move to the next step (auto-scanning)
          } else {
            console.error("Simulated Farcaster Sign-In failed:", data.error)
            alert("Sign-in failed: " + data.error)
          }
        } catch (error) {
          console.error("Error during simulated Farcaster Sign-In:", error)
          alert("An error occurred during sign-in.")
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
      icon: <User className="w-16 h-16 text-fartree-primary-purple mb-6" />,
      description: "Take a look at the links and information we've pulled. You can edit or add more in the next step.",
      buttonText: "Customize My Profile",
      action: handleNext,
    },
    {
      id: 4,
      title: "Customize & Organize",
      icon: <LinkIcon className="w-16 h-16 text-fartree-primary-purple mb-6" />,
      description: "Drag-and-drop to reorder, add new links, and personalize your Fartree to perfection!",
      buttonText: "Go to Editor",
      action: () => console.log("Go to Editor"), // In a real app, navigate to /editor
    },
  ]

  const currentStep = steps[step - 1]

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
              variant="ghost"
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
