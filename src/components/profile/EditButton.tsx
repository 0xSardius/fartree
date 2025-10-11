"use client"

import { useRouter } from "next/navigation"
import { Button } from "~/components/ui/Button"
import { Edit } from "lucide-react"

export function EditButton() {
  const router = useRouter()

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

