"use client"

import { useRouter } from "next/navigation"
import { useAuth } from "~/contexts/AuthContext"
import { Button } from "~/components/ui/Button"
import { Sparkles } from "lucide-react"

interface CreateFartreeCTAProps {
  profileFid: number // The FID of the profile being viewed
}

export function CreateFartreeCTA({ profileFid }: CreateFartreeCTAProps) {
  const router = useRouter()
  const { user } = useAuth()

  // Only show CTA if NOT viewing your own profile
  if (user?.fid === profileFid) {
    return null
  }

  return (
    <div className="px-4 pb-3">
      <Button
        onClick={() => router.push('/onboarding')}
        className="w-full bg-fartree-primary-purple hover:bg-fartree-accent-purple text-white font-medium transition-colors"
      >
        <Sparkles className="w-4 h-4 mr-2" />
        Create your own Fartree
      </Button>
    </div>
  )
}

