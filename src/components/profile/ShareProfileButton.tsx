"use client"

import { useCallback, useMemo, useState } from "react"
import { sdk } from "@farcaster/miniapp-sdk"
import { Share2 } from "lucide-react"
import { Button } from "~/components/ui/Button"

interface ShareProfileButtonProps {
  fid: number
  profileName: string
}

export function ShareProfileButton({ fid, profileName }: ShareProfileButtonProps) {
  const [fallbackLabel, setFallbackLabel] = useState<string | null>(null)

  const shareUrl = useMemo(() => {
    const base = process.env.NEXT_PUBLIC_URL
    if (base) {
      return `${base.replace(/\/$/, "")}/profile/${fid}`
    }

    if (typeof window !== "undefined") {
      return window.location.href
    }

    return `https://fartree.xyz/profile/${fid}`
  }, [fid])

  const handleShare = useCallback(() => {
    setFallbackLabel(null)

    sdk.actions
      .composeCast({
        text: `Check out ${profileName}'s Fartree profile ✨`,
        embeds: [shareUrl],
      })
      .then(() => {
        /* success */
      })
      .catch((error) => {
        console.error("Failed to open cast composer:", error)

        if (typeof navigator !== "undefined") {
          if (navigator.share) {
            navigator
              .share({ url: shareUrl })
              .catch((err) => console.error("Native share failed:", err))
            return
          }

          if (navigator.clipboard?.writeText) {
            navigator.clipboard
              .writeText(shareUrl)
              .then(() => setFallbackLabel("Copied!"))
              .catch((err) => console.error("Clipboard write failed:", err))
            return
          }
        }

        setFallbackLabel("Share manually")
      })
  }, [profileName, shareUrl])

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleShare}
      className="text-xs flex items-center gap-1"
    >
      <Share2 className="w-3 h-3" />
      {fallbackLabel ?? "Share"}
    </Button>
  )
}

export default ShareProfileButton

