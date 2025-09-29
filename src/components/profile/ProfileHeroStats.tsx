"use client"

import { Trophy, Zap } from "lucide-react"

interface ProfileHeroStatsProps {
  totalClicks: number
  autoDetectedCount: number
  badgeLabels: string[]
}

export function ProfileHeroStats({ totalClicks, autoDetectedCount, badgeLabels }: ProfileHeroStatsProps) {
  return (
    <div className="w-full rounded-xl border border-fartree-border-dark bg-fartree-window-background p-4 shadow-lg">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-fartree-text-primary">Your Digital Empire</h2>
          <p className="text-sm text-fartree-text-secondary">
            A snapshot of the impact you&apos;re making across Farcaster.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 rounded-lg border border-fartree-border-dark px-3 py-2">
            <Zap className="h-4 w-4 text-fartree-primary-purple" />
            <div>
              <p className="text-xs text-fartree-text-secondary">Lifetime Clicks</p>
              <p className="text-sm font-semibold text-fartree-text-primary">{totalClicks}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-fartree-border-dark px-3 py-2">
            <Trophy className="h-4 w-4 text-fartree-primary-purple" />
            <div>
              <p className="text-xs text-fartree-text-secondary">Auto-Detected Wins</p>
              <p className="text-sm font-semibold text-fartree-text-primary">{autoDetectedCount}</p>
            </div>
          </div>
          {badgeLabels.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {badgeLabels.map((label) => (
                <span
                  key={label}
                  className="rounded-full border border-fartree-primary-purple px-3 py-1 text-xs font-semibold text-fartree-text-primary"
                >
                  {label}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProfileHeroStats

