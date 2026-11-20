// ui-status: approved
// ui-block: FilterChips
// ui-behaviour: browse-filtering.md
import { X } from "lucide-react"

export interface FilterChip {
  key: string
  label: string
  value: string
  onRemove: () => void
}

/**
 * The filters a list is narrowed by, one chip each — `Label: value`, or the label alone
 * for a filter that is only on — whichever control
 * set them. Removing a chip clears that one filter. Renders nothing while no filter is set.
 */
export function FilterChips({ chips }: { chips: FilterChip[] }) {
  if (chips.length === 0) return null
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="type-metadata text-muted-foreground">Active filters:</span>
      {chips.map((chip) => (
        <span
          key={chip.key}
          className="inline-flex max-w-80 items-center gap-1 rounded-pill border-line border-primary-ink bg-primary-muted py-1 pr-1 pl-3 type-badge text-primary-ink" // design-accepted — the approved look, reviewed in the running app
          title={chip.value ? `${chip.label}: ${chip.value}` : chip.label}
        >
          <span className="truncate">{chip.value ? `${chip.label}: ${chip.value}` : chip.label}</span>
          <button
            type="button"
            aria-label={`Clear filter: ${chip.label}`}
            onClick={chip.onRemove}
            className="flex size-5 shrink-0 items-center justify-center rounded-pill hover:bg-primary-ink/10 focus-visible:outline-2 focus-visible:outline-ring" // design-accepted — the approved look, reviewed in the running app
          >
            <X aria-hidden className="size-3" />
          </button>
        </span>
      ))}
    </div>
  )
}
