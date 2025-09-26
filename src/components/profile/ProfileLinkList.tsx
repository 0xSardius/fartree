"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import type { ElementType } from "react"
import { Globe, Zap } from "lucide-react"
import Link from "next/link"

import { LinkCard } from "~/components/link-card"

interface ProfileLink {
  id: string
  title: string
  url: string
  category?: string
  click_count?: number
  auto_detected?: boolean
  description?: string
}

interface ProfileLinkListProps {
  initialLinks: ProfileLink[]
  profileFid: number
  getIconForCategory?: (category?: string) => ElementType
  showSummary?: boolean
}

const CLICK_DEBOUNCE_MS = 500

export function ProfileLinkList({ initialLinks, profileFid, getIconForCategory, showSummary = true }: ProfileLinkListProps) {
  const sanitizedLinks = useMemo(
    () =>
      initialLinks.map((link) => ({
        ...link,
        click_count: link.click_count ?? 0,
      })),
    [initialLinks],
  )

  const [links, setLinks] = useState(sanitizedLinks)
  const [totalClicks, setTotalClicks] = useState(() =>
    sanitizedLinks.reduce((acc, link) => acc + (link.click_count ?? 0), 0),
  )

  const pendingClicksRef = useRef<Map<string, number>>(new Map())
  const debounceTimersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

  useEffect(() => {
    setLinks(sanitizedLinks)
    setTotalClicks(sanitizedLinks.reduce((acc, link) => acc + (link.click_count ?? 0), 0))
  }, [sanitizedLinks])

  const flushClicks = useCallback(
    async (linkId: string) => {
      const pending = pendingClicksRef.current.get(linkId) ?? 0
      if (pending <= 0) {
        pendingClicksRef.current.delete(linkId)
        debounceTimersRef.current.delete(linkId)
        return
      }

      pendingClicksRef.current.delete(linkId)
      debounceTimersRef.current.delete(linkId)

      try {
        await fetch(`/api/profiles/${profileFid}/links/${linkId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ action: "click", count: pending }),
        })
      } catch (error) {
        console.error("Failed to record link clicks", error)
      }
    },
    [profileFid],
  )

  const scheduleFlush = useCallback(
    (linkId: string) => {
      const existingTimer = debounceTimersRef.current.get(linkId)
      if (existingTimer) {
        clearTimeout(existingTimer)
      }

      const timer = setTimeout(() => {
        flushClicks(linkId)
      }, CLICK_DEBOUNCE_MS)

      debounceTimersRef.current.set(linkId, timer)
    },
    [flushClicks],
  )

  const registerClick = useCallback(
    (linkId: string) => {
      setLinks((prev) =>
        prev.map((link) =>
          link.id === linkId
            ? {
                ...link,
                click_count: (link.click_count ?? 0) + 1,
              }
            : link,
        ),
      )
      setTotalClicks((prev) => prev + 1)

      const currentPending = pendingClicksRef.current.get(linkId) ?? 0
      pendingClicksRef.current.set(linkId, currentPending + 1)
      scheduleFlush(linkId)
    },
    [scheduleFlush],
  )

  useEffect(() => {
    return () => {
      debounceTimersRef.current.forEach((timer, linkId) => {
        clearTimeout(timer)
        flushClicks(linkId)
      })
    }
  }, [flushClicks])

  return (
    <div className="w-full">
      {showSummary && (
        <div className="flex items-center gap-4 text-fartree-text-secondary text-sm mb-6">
          <div className="flex items-center gap-1">
            <Globe className="w-4 h-4" />
            <span>{links.length} Links</span>
          </div>
          <div className="flex items-center gap-1">
            <Zap className="w-4 h-4" />
            <span>{totalClicks} Total Clicks</span>
          </div>
        </div>
      )}

      {links.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-center">
          <div>
            <Globe className="w-12 h-12 mx-auto mb-4 text-fartree-text-secondary" />
            <h3 className="text-lg font-medium text-fartree-text-primary mb-2">No links yet</h3>
            <p className="text-fartree-text-secondary mb-4">This profile hasn't added any links yet.</p>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 w-full">
          {links.map((link) => {
            const IconComponent = getIconForCategory?.(link.category)
            return (
              <Link
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block transition-transform hover:scale-[1.02]"
                onClick={() => registerClick(link.id)}
              >
                <LinkCard
                  icon={IconComponent}
                  title={link.title}
                  description={link.url}
                  clickCount={link.click_count}
                  category={link.category}
                  isAutoDetected={link.auto_detected}
                  className="w-full hover:border-fartree-accent-purple cursor-pointer"
                />
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default ProfileLinkList

