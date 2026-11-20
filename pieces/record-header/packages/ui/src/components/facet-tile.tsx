// ui-status: approved
// ui-atom
import type * as React from "react"
import { ChevronRight } from "lucide-react"

import { cn } from "@design-pack/ui/lib/utils"

/**
 * Facet tile — a clickable summary card (icon + label + one-line value +
 * chevron) that toggles a detail panel open. Active state = primary border +
 * primary-muted fill. Rows of these summarize a record header's field clusters
 * (who is involved, dates, documents).
 * See design.md → Components → display components.
 */
function FacetTile({
  icon: Icon,
  label,
  value,
  active = false,
  className,
  ...props
}: {
  icon?: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>
  label: string
  value?: React.ReactNode
  active?: boolean
  // `value` is Omitted from the button props: a native `<button value>` is a
  // string, and intersecting it with `ReactNode` silently narrows this prop to
  // whatever both allow — so a perfectly good element or `null` fails to
  // type-check at a call site with no clue why.
} & Omit<React.ComponentProps<"button">, "value">) {
  return (
    <button
      type="button"
      data-slot="facet-tile"
      data-active={active}
      className={cn(
        "group flex w-full items-center gap-3 rounded-control border-frame bg-card px-3 py-2 text-left transition-colors",
        active
          ? "border-primary bg-primary-muted"
          : "border-border-subtle hover:border-border",
        className
      )}
      {...props}
    >
      {Icon ? (
        <Icon aria-hidden className="size-4 shrink-0 text-muted-foreground" />
      ) : null}
      <span className="flex min-w-0 flex-col">
        <span className="type-readout-caption text-muted-foreground">
          {label}
        </span>
        {value ? (
          <span className="truncate type-body font-emphasis text-card-foreground">
            {value}
          </span>
        ) : null}
      </span>
      <ChevronRight
        aria-hidden
        className={cn(
          "ml-auto size-4 shrink-0 text-muted-foreground transition-transform",
          active && "rotate-90"
        )}
      />
    </button>
  )
}

export { FacetTile }
