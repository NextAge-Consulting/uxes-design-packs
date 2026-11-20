// ui-status: approved
// ui-block: FieldGroup
import type * as React from "react"

import { cn } from "@design-pack/ui/lib/utils"

/**
 * Detail panel — a titled editor region opened by a facet tile or an expanded
 * row. Header band uses primary-muted; body holds the grouped fields.
 * See design.md → Components → display components.
 */
function DetailPanel({
  title,
  children,
  className,
  ...props
}: {
  title: React.ReactNode
} & React.ComponentProps<"div">) {
  const frame = cn(
    "overflow-hidden rounded-container border-frame border-border bg-card",
    className
  )
  const band = "border-b-frame border-border-subtle bg-primary-muted px-4 py-2"
  const heading = "type-section-heading"
  // The panel owns the rhythm between its own regions. Without a gap, sibling
  // blocks stack flush — and a region that draws its own top rule (`border-t-2
  // … pt-4`, the in-panel divider) pads BELOW the rule only, so the previous
  // block's last line lands on it. Symmetric spacing is the container's job:
  // fixing it at each divider means getting it right every time forever.
  const body = "flex flex-col gap-4 p-4"

  return (
    <div data-slot="detail-panel" className={frame} {...props}>
      <div className={band}>
        <h3 className={heading}>{title}</h3>
      </div>
      <div className={body}>{children}</div>
    </div>
  )
}

export { DetailPanel }
