// ui-status: approved
// ui-block: StatRow
import type * as React from "react"

/**
 * A row of headline figures — `StatReadout`s side by side, at the record
 * header's own grid, so a report's figures line up the way a record's do.
 *
 * `columns` is how many figures the row holds at full width; it narrows to two
 * (and, for six, three) on smaller screens.
 */
const COLUMNS = {
  3: "grid grid-cols-3 gap-figures",
  4: "grid grid-cols-2 gap-figures lg:grid-cols-4",
  6: "grid grid-cols-2 gap-figures sm:grid-cols-3 lg:grid-cols-6",
} as const

export function StatRow({
  columns,
  children,
}: {
  columns: keyof typeof COLUMNS
  children: React.ReactNode
}) {
  return (
    <div data-slot="stat-row" className={COLUMNS[columns]}>
      {children}
    </div>
  )
}
