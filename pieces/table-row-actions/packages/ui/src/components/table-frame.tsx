// ui-status: approved
// ui-atom
// ui-behaviour: table-row-actions.md
import type * as React from "react"

import { cn } from "@design-pack/ui/lib/utils"

/**
 * The card a table sits in — border, radius, and the clipping that keeps the
 * first and last rows inside the rounded corners.
 *
 * A table that IS the surface goes in a frame; a table already
 * inside a `Card` or panel does not.
 *
 * Horizontal scrolling is NOT set here — `Table` already renders its own
 * `overflow-x-auto` container, and nesting a second one produces two scrollbars.
 */
export function TableFrame({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="table-frame"
      className={cn(
        "overflow-hidden rounded-container border-frame border-border bg-card",
        className
      )}
      {...props}
    />
  )
}
