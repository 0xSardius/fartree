import type React from "react"
import { Card, CardContent } from "~/components/ui/card"
import { cn } from "~/lib/utils"
import { Link, Eye, Pencil, GripVertical } from "lucide-react"
import { Button } from "~/components/ui/Button"

interface LinkCardProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ElementType
  title: string
  description?: string
  clickCount?: number
  category?: "Social" | "Crypto" | "Content" | "Collabs" | string
  isAutoDetected?: boolean
  editable?: boolean
  onEdit?: () => void
  onToggleVisibility?: () => void
  onDelete?: () => void
}

export function LinkCard({
  icon: Icon = Link,
  title,
  description,
  clickCount,
  category,
  isAutoDetected = false,
  editable = false,
  onEdit,
  onToggleVisibility,
  onDelete,
  className,
  ...props
}: LinkCardProps) {
  const categoryColors = {
    Social: "bg-blue-500",
    Crypto: "bg-yellow-500",
    Content: "bg-green-500",
    Collabs: "bg-purple-500",
  }

  return (
    <Card
      className={cn(
        "relative group border-2 border-fartree-border-dark bg-fartree-window-background text-fartree-text-primary rounded-lg overflow-hidden",
        "hover:border-fartree-accent-purple transition-colors duration-200",
        className,
      )}
      {...props}
    >
      <CardContent className="p-4 flex items-center gap-4">
        {editable && (
          <div className="absolute left-2 top-1/2 -translate-y-1/2 cursor-grab text-fartree-text-secondary opacity-0 group-hover:opacity-100 transition-opacity">
            <GripVertical className="w-4 h-4" />
          </div>
        )}
        <div className={cn("flex-shrink-0", editable && "ml-6")}>
          <Icon className="w-6 h-6 text-fartree-primary-purple" />
        </div>
        <div className="flex-1 grid gap-0.5">
          <h3 className="font-semibold text-lg">{title}</h3>
          {description && <p className="text-sm text-fartree-text-secondary">{description}</p>}
          <div className="flex items-center gap-2 text-xs text-fartree-text-secondary mt-1">
            {clickCount !== undefined && (
              <span className="flex items-center gap-1">
                <Eye className="w-3 h-3" /> {clickCount} Clicks
              </span>
            )}
            {category && (
              <span
                className={cn(
                  "px-2 py-0.5 rounded-full text-white",
                  categoryColors[category as keyof typeof categoryColors] || "bg-gray-500",
                )}
              >
                {category}
              </span>
            )}
            {isAutoDetected && (
              <span className="px-2 py-0.5 rounded-full bg-fartree-primary-purple text-white">Auto-Detected</span>
            )}
          </div>
        </div>
        {editable && (
          <div className="flex-shrink-0 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            {onEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={onEdit}
                className="w-8 h-8 text-fartree-text-secondary hover:text-fartree-accent-purple"
              >
                <Pencil className="w-4 h-4" />
                <span className="sr-only">Edit</span>
              </Button>
            )}
            {onToggleVisibility && (
              <Button
                variant="outline"
                size="sm"
                onClick={onToggleVisibility}
                className="w-8 h-8 text-fartree-text-secondary hover:text-fartree-accent-purple"
              >
                <Eye className="w-4 h-4" />
                <span className="sr-only">Toggle Visibility</span>
              </Button>
            )}
            {onDelete && (
              <Button
                variant="outline"
                size="sm"
                onClick={onDelete}
                className="w-8 h-8 text-red-500 hover:text-red-700"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span className="sr-only">Delete</span>
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
