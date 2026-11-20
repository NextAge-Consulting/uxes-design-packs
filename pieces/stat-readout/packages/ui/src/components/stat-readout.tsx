// ui-status: approved
// ui-block: StatTile
import type * as React from "react"

import { cn } from "@design-pack/ui/lib/utils"

/**
 * Stat readout — a *readout*, never an input. Label (muted) over a
 * bold value. Used for record-header KPIs and derived line values
 * (Amount, Sub-total, Balance, weights). User-entered values get an Input.
 * See design.md → Components → display components.
 */
function StatReadout({
  label,
  value,
  hint,
  className,
  ...props
}: {
  label: string
  value: React.ReactNode
  hint?: React.ReactNode
} & React.ComponentProps<"div">) {
  return (
    <div
      data-slot="stat-readout"
      className={cn("flex flex-col gap-1", className)}
      {...props}
    >
      <span className="type-readout-caption text-muted-foreground">
        {label}
      </span>
      <span className="flex items-baseline gap-2 type-figure">
        {value}
      </span>
      {hint ? (
        <span className="type-metadata text-muted-foreground">{hint}</span>
      ) : null}
    </div>
  )
}

export { StatReadout }
