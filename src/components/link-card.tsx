import type React from "react"
import { Card, CardContent } from "~/components/ui/card"
import { cn } from "~/lib/utils"
import { Link, Eye, Pencil, GripVertical } from "lucide-react"
import { Button } from "~/components/ui/Button"

// Helper to shorten long URLs for display
function shortenUrl(url: string, maxLength: number = 32): string {
  if (url.length <= maxLength) return url
  
  try {
    const urlObj = new URL(url)
    const domain = urlObj.hostname.replace('www.', '')
    const path = urlObj.pathname + urlObj.search + urlObj.hash
    
    // If just domain fits, show it
    if (domain.length > maxLength) {
      return domain.substring(0, maxLength - 3) + '...'
    }
    
    // If domain + path fit, show both
    if (domain.length + path.length <= maxLength) {
      return domain + path
    }
    
    // Otherwise, show domain + truncated path
    const remainingLength = maxLength - domain.length - 3 // -3 for "..."
    if (remainingLength > 5) {
      return domain + path.substring(0, remainingLength) + '...'
    }
    
    // If path is too short to show meaningfully, just show domain
    return domain
  } catch {
    // If URL parsing fails, just truncate
    return url.substring(0, maxLength - 3) + '...'
  }
}

interface LinkCardProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ElementType
  title: string
  description?: string
  clickCount?: number
  category?: "Social" | "Crypto" | "Content" | "Collabs" | string
  isAutoDetected?: boolean
  isMostClicked?: boolean
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
  isMostClicked = false,
  editable = false,
  onEdit,
  className,
  ...props
}: LinkCardProps) {
  // Note: onToggleVisibility and onDelete are currently unused
  // They're kept in the interface for future functionality
  const categoryColors = {
    Social: "bg-blue-500",
    Crypto: "bg-yellow-500",
    Content: "bg-green-500",
    Collabs: "bg-purple-500",
  }

  return (
    <Card
      className={cn(
        "relative group border-2 border-fartree-border-dark bg-fartree-window-background text-fartree-text-primary rounded-lg overflow-hidden w-full",
        "hover:border-fartree-accent-purple transition-colors duration-200",
        className,
      )}
      {...props}
    >
      <CardContent className="p-2.5 sm:p-3 w-full">
        {/* Mobile-first responsive layout */}
        <div className="flex items-start gap-2.5 w-full">
          {editable && (
            <div className="flex-shrink-0 cursor-grab text-fartree-text-secondary opacity-0 group-hover:opacity-100 transition-opacity">
              <GripVertical className="w-3 h-3" />
            </div>
          )}
          <div className="flex-shrink-0">
            <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-fartree-primary-purple" />
          </div>
          <div className="flex-1 min-w-0 overflow-hidden pr-1.5">
            <h3 className="font-semibold text-sm truncate leading-tight" title={title}>{title}</h3>
            {description && (
              <p 
                className="text-xs text-fartree-text-secondary truncate font-mono leading-tight" 
                title={description}
              >
                {shortenUrl(description, 30)}
              </p>
            )}
            <div className="flex items-center gap-2 text-xs text-fartree-text-secondary mt-1.5 flex-wrap">
              {clickCount !== undefined && (
                <span className={cn(
                  "flex items-center gap-1 flex-shrink-0",
                  isMostClicked && "text-fartree-accent-purple font-semibold"
                )}>
                  <Eye className="w-3 h-3" /> {clickCount}
                </span>
              )}
              {isMostClicked && (
                <span className="px-1.5 py-0.5 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs flex-shrink-0 font-semibold">
                  🔥 Top
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
          {editable && onEdit && (
            <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="outline"
                size="sm"
                onClick={onEdit}
                className="w-7 h-7 p-0 text-fartree-text-secondary hover:text-fartree-accent-purple border-fartree-border-dark"
              >
                <Pencil className="w-3.5 h-3.5" />
                <span className="sr-only">Edit</span>
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
