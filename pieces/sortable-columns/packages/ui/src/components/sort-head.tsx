// ui-status: approved
// ui-atom
// ui-behaviour: sortable-columns.md
import { ChevronDown, ChevronUp, ChevronsUpDown } from "lucide-react"
import type * as React from "react"

import { TableHead } from "@design-pack/ui/components/ui/table"

/**
 * A column heading that sorts its table (`sortable-columns.md`): the heading is a
 * button, the `th` carries `aria-sort`, and a chevron shows the direction. Clicking
 * the sorted column again reverses it; the caller owns the order and the rows.
 *
 * The construction of the WAI-ARIA sortable-table example, Carbon's and Primer's
 * data tables: a real `<button>` inside the header cell so the keyboard reaches it,
 * `aria-sort` only on the sorted column, and a chevron that is decoration beside the
 * heading text, which stays the button's name. A light chevron, as Primer's, Ant
 * Design's and the W3C example's carets are: the sorted column shows its one direction;
 * the others show a faint up-and-down pair only on hover or focus.
 */
export function SortHead({
  label,
  direction,
  onSort,
  children,
  ...props
}: {
  label: string
  /** The column's sort, or null when the table is sorted by another column. */
  direction: "ascending" | "descending" | null
  onSort: () => void
  /** Drawn after the heading's button inside the cell — a column's resize handle. */
  children?: React.ReactNode
} & Omit<React.ComponentProps<typeof TableHead>, "children" | "aria-sort">) {
  const Mark = direction === "ascending" ? ChevronUp : direction === "descending" ? ChevronDown : ChevronsUpDown
  return (
    <TableHead {...props} aria-sort={direction ?? undefined}>
      <button
        type="button"
        onClick={onSort}
        className="group/sort inline-flex items-center gap-tight rounded-control text-inherit hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        {label}
        <Mark
          aria-hidden
          className={direction ? "size-icon-inline" : "size-icon-inline text-muted-foreground opacity-0 group-hover/sort:opacity-100 group-focus-visible/sort:opacity-100"}
        />
      </button>
      {children}
    </TableHead>
  )
}
