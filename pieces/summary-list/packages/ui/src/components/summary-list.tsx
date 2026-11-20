// ui-status: approved
// ui-block: SummaryList
import type * as React from "react"

import { cn } from "@design-pack/ui/lib/utils"

/**
 * Summary list — a short list of label/value rows that account for something:
 * a balance, an invoice, a payment. The label is muted, the value bold with
 * tabular figures, right-aligned so the amounts line up.
 *
 * `total` is the figure the rows add up to, ruled off beneath them. `figuresAlign="field"`
 * lines the figures up with a `FigureInput` placed as a row's value. `pairs="beside"` keeps
 * each label next to its figure, the pairs against the right edge.
 *
 * `note` is ONE sentence of context about the figures above it — where they
 * come from, when they were true, or what they include ("Last Payment of $50.00
 * applied on 01/15/2026", "Figures as of 09/26/2026"). It is never a figure that
 * could be a row: if it reads naturally as `label … value`, it is a row.
 *
 * Not `StatReadout` (one headline figure) and not `ReadOnlyField` (a value in a
 * form grid). See design.md → Components → display components.
 */
type SummaryRow = {
  /** Needed only when `label` is not plain text — it keys the row. */
  id?: string
  label: React.ReactNode
  value: React.ReactNode
  /** A message about this row's value, under it — a typed figure that is not valid. */
  error?: React.ReactNode
}

function SummaryList({
  rows,
  total,
  figuresAlign = "edge",
  pairs = "spread",
  note,
  className,
  ...props
}: {
  /** Labels are unique within a list — each names a different line of the summary. */
  rows: SummaryRow[]
  /** The figure the rows add up to, ruled off beneath them. */
  total?: { label: React.ReactNode; value: React.ReactNode }
  /**
   * `field` insets every plain figure by a field's inner padding, so its last digit
   * lines up with a figure typed into a `FigureInput` in the same column.
   */
  figuresAlign?: "edge" | "field"
  /**
   * `beside` sets each label a standard gap left of its figure, the pairs against the right
   * edge — for a breakdown whose figures must stay under a figure above them.
   */
  pairs?: "spread" | "beside"
  note?: React.ReactNode
} & React.ComponentProps<"div">) {
  const figure = cn(
    "m-0 type-summary-figure",
    figuresAlign === "field" && "pr-field-inset has-data-[slot=figure-input]:pr-0"
  )
  const pair = pairs === "beside" ? "flex items-center justify-end gap-4" : "flex items-center justify-between gap-3"
  return (
    <div
      data-slot="summary-list"
      className={cn("flex flex-col gap-2", className)}
      {...props}
    >
      <dl className="m-0 flex flex-col gap-2">
        {rows.map((row) => (
          <div key={row.id ?? String(row.label)} className="flex flex-col gap-2">
            <div className={pair}>
              <dt className="type-body text-muted-foreground">{row.label}</dt>
              <dd className={figure}>{row.value}</dd>
            </div>
            {row.error ? (
              <div className="type-field-error text-right text-feedback-danger">{row.error}</div>
            ) : null}
          </div>
        ))}
        {total ? (
          <div className={cn(pair, "border-t-line border-border-subtle pt-2")}>
            <dt className="type-row-title">{total.label}</dt>
            <dd className={figure}>{total.value}</dd>
          </div>
        ) : null}
      </dl>
      {note ? (
        <p className={cn("m-0 type-metadata text-muted-foreground", pairs === "beside" && "text-right")}>{note}</p>
      ) : null}
    </div>
  )
}

export { SummaryList }
