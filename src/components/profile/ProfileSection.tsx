"use client"

import { PropsWithChildren } from "react"

interface ProfileSectionProps {
  title: string
  description?: string
}

export function ProfileSection({ title, description, children }: PropsWithChildren<ProfileSectionProps>) {
  return (
    <section className="space-y-3 rounded-xl border border-fartree-border-dark bg-fartree-window-background p-4">
      <div>
        <h3 className="text-lg font-semibold text-fartree-text-primary">{title}</h3>
        {description && <p className="text-sm text-fartree-text-secondary">{description}</p>}
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  )
}

export default ProfileSection

