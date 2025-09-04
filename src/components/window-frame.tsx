import type React from "react"
import { X, Minus, Square } from "lucide-react"
import { cn } from "~/lib/utils"

interface WindowFrameProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  children: React.ReactNode
  className?: string
  contentClassName?: string
}

export function WindowFrame({ title, children, className, contentClassName, ...props }: WindowFrameProps) {
  return (
    <div
      className={cn(
        "border-2 border-fartree-border-dark shadow-[6px_6px_0px_0px_rgba(0,0,0,0.6)] rounded-lg overflow-hidden bg-fartree-window-background text-fartree-text-primary",
        className,
      )}
      {...props}
    >
      {title && (
        <div className="flex items-center justify-between px-3 py-1.5 border-b-2 border-fartree-border-dark bg-fartree-window-header text-fartree-text-primary text-sm font-mono">
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              <button className="w-3 h-3 bg-red-500 rounded-full border border-red-600" aria-label="Close"></button>
              <button
                className="w-3 h-3 bg-yellow-500 rounded-full border border-yellow-600"
                aria-label="Minimize"
              ></button>
              <button
                className="w-3 h-3 bg-green-500 rounded-full border border-green-600"
                aria-label="Maximize"
              ></button>
            </div>
            <span className="ml-2 font-bold">{title}</span>
          </div>
          <div className="flex items-center gap-1">
            <Minus className="w-3 h-3 text-fartree-text-primary" />
            <Square className="w-3 h-3 text-fartree-text-primary" />
            <X className="w-3 h-3 text-fartree-text-primary" />
          </div>
        </div>
      )}
      <div className={cn("p-4", contentClassName)}>{children}</div>
    </div>
  )
}
