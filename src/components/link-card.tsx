import type React from "react"
import { Card, CardContent } from "~/components/ui/card"
import { cn } from "~/lib/utils"
import { Link, Eye, Pencil, GripVertical } from "lucide-react"
import { Button } from "~/components/ui/Button"

// Helper to shorten long URLs for display
function shortenUrl(url: string, maxLength: number = 40): string {
  if (url.length <= maxLength) return url
  
  try {
    const urlObj = new URL(url)
    const domain = urlObj.hostname.replace('www.', '')
    const path = urlObj.pathname + urlObj.search
    
    if (domain.length + path.length <= maxLength) {
      return domain + path
    }
    
    // Truncate path if needed
    const remainingLength = maxLength - domain.length - 3 // -3 for "..."
    if (remainingLength > 10) {
      return domain + path.substring(0, remainingLength) + '...'
    }
    
    return domain
  } catch {
    // If URL parsing fails, just truncate
    return url.substring(0, maxLength) + '...'
  }
}

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
      <CardContent className="p-3 sm:p-4">
        {/* Mobile-first responsive layout */}
        <div className="flex items-start gap-3">
          {editable && (
            <div className="flex-shrink-0 cursor-grab text-fartree-text-secondary opacity-0 group-hover:opacity-100 transition-opacity mt-1">
              <GripVertical className="w-4 h-4" />
            </div>
          )}
          <div className="flex-shrink-0 mt-0.5">
            <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-fartree-primary-purple" />
          </div>
          <div className="flex-1 min-w-0 max-w-full overflow-hidden">
            <h3 className="font-semibold text-base sm:text-lg truncate">{title}</h3>
            {description && (
              <p 
                className="text-xs sm:text-sm text-fartree-text-secondary mt-1 truncate" 
                title={description}
              >
                {shortenUrl(description, 35)}
              </p>
            )}
            <div className="flex items-center gap-2 text-xs text-fartree-text-secondary mt-2 flex-wrap">
              {clickCount !== undefined && (
                <span className="flex items-center gap-1 flex-shrink-0">
                  <Eye className="w-3 h-3" /> {clickCount}
                </span>
              )}
              {category && (
                <span
                  className={cn(
                    "px-1.5 py-0.5 rounded-full text-white text-xs flex-shrink-0",
                    categoryColors[category as keyof typeof categoryColors] || "bg-gray-500",
                  )}
                >
                  {category}
                </span>
              )}
              {isAutoDetected && (
                <span className="px-1.5 py-0.5 rounded-full bg-fartree-primary-purple text-white text-xs flex-shrink-0">
                  Auto
                </span>
              )}
            </div>
          </div>
          {editable && (
            <div className="flex-shrink-0 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {onEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onEdit}
                  className="w-7 h-7 sm:w-8 sm:h-8 text-fartree-text-secondary hover:text-fartree-accent-purple"
                >
                  <Pencil className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="sr-only">Edit</span>
                </Button>
              )}
              {onToggleVisibility && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onToggleVisibility}
                  className="w-7 h-7 sm:w-8 sm:h-8 text-fartree-text-secondary hover:text-fartree-accent-purple"
                >
                  <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="sr-only">Toggle Visibility</span>
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onDelete}
                  className="w-7 h-7 sm:w-8 sm:h-8 text-red-500 hover:text-red-700"
                >
                  <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  <span className="sr-only">Delete</span>
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
