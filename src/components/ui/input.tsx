import * as React from "react"

import { cn } from "~/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border-2 border-fartree-border-dark bg-white px-3 py-2 text-base text-fartree-text-primary font-medium placeholder:text-fartree-text-secondary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fartree-primary-purple focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
