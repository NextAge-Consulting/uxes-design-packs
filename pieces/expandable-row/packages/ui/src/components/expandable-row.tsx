// ui-status: approved
// ui-block: ExpandableRow
import * as React from "react"
import { ChevronRight } from "lucide-react"

import { cn } from "@design-pack/ui/lib/utils"
import { TableCell, TableRow } from "@design-pack/ui/components/ui/table"
import { IconButton } from "@design-pack/ui/components/icon-button"

/**
 * Expandable table row — a row with a leading toggle column that discloses more in place.
 * Every row keeps the toggle column, so the rows' text lines up; only a row with something
 * to open shows its chevron.
 *
 * What it opens is one of two kinds:
 * - `breakdown` — rows of the same table (`TableRow kind="breakdown"`), sharing its
 *   columns, for a row whose amount is made of parts. The screen puts each breakdown cell in
 *   the column that suits its table, as with any row.
 * - `detail` — one full-width block beneath the row, for anything free-form: a task-grouped
 *   editor, a `SummaryList`.
 *
 * The children are the row's cells; `colSpan` is how many (the toggle cell is added). Open
 * state is its own unless `open` and `onOpenChange` are passed. `label` names what opening
 * shows — "how this total is made up" — for the toggle's accessible name.
 * See design.md → Components → display components.
 */
function ExpandableRow({
  children,
  breakdown,
  detail,
  colSpan,
  label,
  open: openProp,
  onOpenChange,
  defaultOpen = false,
}: {
  children: React.ReactNode
  breakdown?: React.ReactNode
  detail?: React.ReactNode
  colSpan: number
  label?: string
  open?: boolean
  onOpenChange?: (open: boolean) => void
  defaultOpen?: boolean
}) {
  const [ownOpen, setOwnOpen] = React.useState(defaultOpen)
  const open = openProp ?? ownOpen
  const setOpen = (next: boolean) => {
    if (openProp === undefined) setOwnOpen(next)
    onOpenChange?.(next)
  }
  const opens = breakdown != null || detail != null

  return (
    <>
      <TableRow data-slot="expandable-row" data-open={open}>
        <TableCell className="w-[1%]">
          {opens ? (
            <IconButton
              label={label ? `${open ? "Hide" : "Show"} ${label}` : open ? "Collapse row" : "Expand row"}
              icon={
                <ChevronRight
                  aria-hidden
                  className={cn("transition-transform", open && "rotate-90")}
                />
              }
              variant="quiet"
              size="icon-affix"
              aria-expanded={open}
              onClick={() => setOpen(!open)}
            />
          ) : null}
        </TableCell>
        {children}
      </TableRow>
      {open && breakdown != null ? breakdown : null}
      {open && breakdown == null && detail != null ? (
        <TableRow data-slot="expandable-row-detail">
          <TableCell colSpan={colSpan + 1} kind="detail">
            <div className="p-4">{detail}</div>
          </TableCell>
        </TableRow>
      ) : null}
    </>
  )
}

/**
 * The same disclosure for a list rather than a table: a heading row with a
 * leading chevron, a badge and a count, opening its items in place beneath it.
 * Open state is the caller's, so it can open groups that hold something or that
 * match a search. Groups are separated by a rule.
 */
function ExpandableGroup({
  id,
  label,
  badge,
  count,
  open,
  onOpenChange,
  children,
}: {
  /** The body's id — what the heading button `aria-controls`. */
  id: string
  label: React.ReactNode
  /** A status beside the label — "2 new". */
  badge?: React.ReactNode
  /** Right-aligned: how many items the group holds. */
  count?: React.ReactNode
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
}) {
  return (
    <div data-slot="expandable-group" className="border-b-frame border-border-subtle last:border-b-0">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => onOpenChange(!open)}
        className="flex w-full items-center gap-2 min-h-10 text-left transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
      >
        <ChevronRight
          aria-hidden
          className={cn("size-4 shrink-0 text-muted-foreground transition-transform", open && "rotate-90")}
        />
        <span className="type-section-heading">{label}</span>
        {badge}
        <span className="ml-auto type-metadata text-muted-foreground">{count}</span>
      </button>
      {open ? (
        <div id={id} className="flex flex-col gap-3 pb-4 pl-6">
          {children}
        </div>
      ) : null}
    </div>
  )
}

export { ExpandableGroup, ExpandableRow }
