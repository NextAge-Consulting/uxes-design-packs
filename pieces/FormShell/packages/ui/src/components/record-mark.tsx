// ui-status: approved
// ui-atom
import type * as React from "react"

import { cn } from "@design-pack/ui/lib/utils"

/**
 * The framed icon beside a record's identity heading.
 *
 * A detail route inherits its browse's icon by prefix match, so this is the same
 * mark the nav rail shows on the row still highlighted behind it — which is what
 * ties the open record to where the user came from.
 *
 * One component because it appears wherever an identity heading does: the record
 * header and the form shell's identity variant.
 */
function RecordMark({
  icon: Icon,
  className,
  ...props
}: {
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>
} & Omit<React.ComponentProps<"span">, "children">) {
  return (
    <span
      data-slot="record-mark"
      className={cn(
        "flex size-9 shrink-0 items-center justify-center rounded-control border-frame border-border bg-card text-primary-ink",
        className
      )}
      {...props}
    >
      <Icon className="size-5" aria-hidden />
    </span>
  )
}

export { RecordMark }
