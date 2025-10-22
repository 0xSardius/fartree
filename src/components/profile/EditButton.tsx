"use client"

import { useRouter } from "next/navigation"
import { useAuth } from "~/contexts/AuthContext"
import { Button } from "~/components/ui/Button"
import { Edit } from "lucide-react"

interface EditButtonProps {
  profileFid: number // The FID of the profile being viewed
}

export function EditButton({ profileFid }: EditButtonProps) {
  const router = useRouter()
  const { user } = useAuth()

  // Only show edit button if viewing your own profile
  if (!user || user.fid !== profileFid) {
    return null
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => router.push('/editor')}
      className="text-xs"
    >
      <Edit className="w-3 h-3 mr-1" /> Edit
    </Button>
  )
}

