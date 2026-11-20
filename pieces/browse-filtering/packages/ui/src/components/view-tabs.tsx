// ui-status: approved
// ui-block: SavedViews
// ui-behaviour: browse-filtering.md
"use client"

import { Badge } from "@design-pack/ui/components/ui/badge"
import { cn } from "@design-pack/ui/lib/utils"

export interface ViewTab<T extends string> {
  value: T
  label: string
  /** How many the view holds, shown beside its name; left out while unknown. */
  count?: number
  /** The count in the warning tone — a view of things needing attention. */
  attention?: boolean
}

/**
 * The views of one list — Active and Archived — as underlined tabs above it: the
 * chosen one underlined in the brand colour, each with its count. Choosing one switches
 * the list; nothing else on the screen moves. They sit directly above the list they
 * switch, with its filter chips — below any notice or panel about the screen as a whole. Each is a toggle button, pressed when
 * chosen, in a group named by `label`.
 */
function ViewTabs<T extends string>({
  label,
  value,
  onChange,
  tabs,
  className,
}: {
  /** What the views are views of, for assistive technology. */
  label: string
  value: T
  onChange: (value: T) => void
  tabs: readonly ViewTab<T>[]
  className?: string
}) {
  return (
    <fieldset className={cn("flex gap-6 border-b-line border-border", className)}>
      <legend className="sr-only">{label}</legend>
      {tabs.map((tab) => {
        const chosen = tab.value === value
        return (
          <button
            key={tab.value}
            type="button"
            aria-pressed={chosen}
            onClick={() => onChange(tab.value)}
            className={cn(
              "-mb-px flex items-center gap-2 border-b-frame px-1 pb-2 type-button-label transition-colors",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
              chosen ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
            {tab.count === undefined ? null : (
              <Badge variant={tab.attention && tab.count > 0 ? "warning" : "muted"}>{tab.count.toLocaleString()}</Badge>
            )}
          </button>
        )
      })}
    </fieldset>
  )
}

export { ViewTabs }
