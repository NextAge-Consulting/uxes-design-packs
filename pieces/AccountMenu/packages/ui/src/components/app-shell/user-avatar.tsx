// ui-status: approved
// ui-atom
import type * as React from "react"

import { cn } from "@design-pack/ui/lib/utils"

/** First letter of the first two words — "Jane Doe" → "JD". */
function initialsFrom(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "?"
  return parts
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("")
}

/**
 * Circular user initials badge. Rendered as a plain span so the caller decides
 * the interaction — wrap it in a DropdownMenuTrigger for the account menu
 * rather than baking a click handler in here.
 */
function UserAvatar({
  name,
  initials,
  className,
  ...props
}: {
  name: string
  /** Override the derived initials (e.g. a code that isn't a person's name). */
  initials?: string
} & Omit<React.ComponentProps<"span">, "children">) {
  return (
    <span
      data-slot="user-avatar"
      aria-hidden
      className={cn(
        "flex size-8 shrink-0 select-none items-center justify-center rounded-pill border-frame border-border bg-primary type-initials text-primary-foreground",
        className
      )}
      {...props}
    >
      {initials ?? initialsFrom(name)}
    </span>
  )
}

export { UserAvatar, initialsFrom }
