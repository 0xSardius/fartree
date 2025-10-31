"use client"

import { useRouter } from "next/navigation"
import { useAuth } from "~/contexts/AuthContext"
import { Button } from "~/components/ui/Button"
import { Sparkles, Edit } from "lucide-react"

interface CreateFartreeCTAProps {
  profileFid: number // The FID of the profile being viewed
}

export function CreateFartreeCTA({ profileFid }: CreateFartreeCTAProps) {
  const router = useRouter()
  const { user } = useAuth()

  // Don't show anything if viewing your own profile
  if (user?.fid === profileFid) {
    return null
  }

  // If user is logged in and has a profile, show "Edit your Fartree" instead
  if (user?.fid) {
    return (
      <div className="px-4 pb-3">
        <Button
          onClick={() => router.push('/editor')}
          variant="outline"
          className="w-full border-fartree-primary-purple text-fartree-primary-purple hover:bg-fartree-primary-purple hover:text-white font-medium transition-colors"
        >
          <Edit className="w-4 h-4 mr-2" />
          Edit your Fartree
        </Button>
      </div>
    )
  }

  // If not logged in, show "Create your own Fartree"
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

