// ui-status: approved
// ui-atom
// ui-behaviour: browse-paging.md, table-row-actions.md
"use client"

import type * as React from "react"

import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@design-pack/ui/lib/utils"

/**
 * The data table. `TableHead` and `TableCell` both reserve the row height, so
 * every row is one height whatever it holds — the browse fit sizes a page from it.
 *
 * Say what a cell holds with `kind` — `title`, `key`, `code`, `number`, `amount`,
 * `actions`, `empty`, `detail`, `note` — and `tone="secondary"` for supporting text; never
 * set a typeface, figure style or colour at the call site. A column of money is
 * `amount` on its heading and its cells, so both align right; the row's own controls
 * are `actions` on both. `TableHead kind="spanning"` heads a grouped header;
 * `TableRow interactive` is a row that is itself the control. A table that is the
 * surface is `TableFrame`.
 */
function Table({ className, ...props }: React.ComponentProps<"table">) {
  return (
    <div
      data-slot="table-container"
      className="relative w-full overflow-x-auto"
    >
      <table
        data-slot="table"
        className={cn("w-full caption-bottom type-body", className)}
        {...props}
      />
    </div>
  )
}

/**
 * The header band is styled HERE, not per screen.
 *
 * A fill is what separates the header from the rows, and `sticky` keeps it in
 * place once the body scrolls. Both were previously hand-applied on the one
 * browse that needed them, so every later table shipped without them and the
 * difference only showed up in review. Sticky is inert when nothing scrolls
 * vertically, so it costs the short tables nothing.
 *
 * **`muted`, not `surface`** (design.md → Elevation & Depth). A table lives
 * inside `TableFrame`, which is a card, so painting the header with the page
 * canvas drops it BELOW the rows it heads. Light mode hides that — canvas and
 * card are three percent apart — but dark mode separates them widely, and the
 * header renders as a black bar. `muted` lifts in dark and dips fractionally in
 * light, which is the direction a header wants in both.
 */
// Rows draw their dividing line on TOP, so the first body row's line is the header's
// bottom edge and nothing is drawn below the last row — no row needs to know its
// position. A last-row rule would need that, and inside a Claude Design page every row
// sits in its own wrapper, where every row is the last one and every line disappears.
// Header rows take no top line (the frame is there) and keep the line beneath.
/** The header band and its stickiness live here; no screen styles a table header. */
function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return (
    <thead
      data-slot="table-header"
      className={cn("sticky top-0 z-10 bg-muted [&_tr]:border-t-0 [&_tr]:border-b-line", className)}
      {...props}
    />
  )
}

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return (
    <tbody
      data-slot="table-body"
      className={className}
      {...props}
    />
  )
}

function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn(
        "border-t-line bg-muted/50 font-emphasis",
        className
      )}
      {...props}
    />
  )
}

// `interactive` — the row itself is the control (a browse row opens its
// record), so it takes the pointer cursor and a visible keyboard focus ring.
// The caller supplies the role, `tabIndex` and key handling, which depend on
// what the row opens.
// `kind="breakdown"` is a row of the parts of the row above it, on the well — what
// `ExpandableRow`'s `breakdown` opens. It never highlights on hover.
function TableRow({
  className,
  interactive = false,
  kind = "record",
  ...props
}: React.ComponentProps<"tr"> & { interactive?: boolean; kind?: "record" | "breakdown" }) {
  return (
    <tr
      data-slot="table-row"
      data-kind={kind}
      className={cn(
        "border-t-line transition-colors hover:bg-muted/50 has-aria-expanded:bg-muted/50 data-[state=selected]:bg-muted",
        kind === "breakdown" && "bg-well hover:bg-well",
        interactive &&
          "cursor-pointer outline-none focus-visible:bg-muted/50 focus-visible:outline-2 focus-visible:outline-solid focus-visible:-outline-offset-2 focus-visible:outline-ring",
        className
      )}
      {...props}
    />
  )
}

// `kind` says what the heading sits over:
//   column   — one column, in a single header row
//   spanning — a column's heading spanning both rows of a grouped header,
//              anchored to the bottom so it lines up with the grouped
//              headings beside it
//   amount   — heads a column of money, aligned right over its figures
//   actions  — heads the row-actions column, as narrow as its buttons
const tableHeadVariants = cva(
  "h-row px-2 text-left type-column-heading whitespace-nowrap text-card-foreground [&:has([role=checkbox])]:pr-0 [&_[role=checkbox]]:translate-y-[2px]",
  {
    variants: {
      kind: {
        column: "align-middle",
        spanning: "pb-2 align-bottom",
        amount: "align-middle text-right",
        actions: "w-[1%] align-middle",
      },
    },
    defaultVariants: { kind: "column" },
  }
)

function TableHead({
  className,
  kind,
  ...props
}: React.ComponentProps<"th"> & VariantProps<typeof tableHeadVariants>) {
  return (
    <th
      data-slot="table-head"
      className={cn(tableHeadVariants({ kind }), className)}
      {...props}
    />
  )
}

// `kind` says what the cell holds; `tone` whether it is primary or supporting.
//   text   — ordinary words
//   title  — the words that name the row (a person's or record's name)
//   key    — the machine identifier that names the row (a record id, a code)
//   code   — any other machine string
//   number — a figure, a count or a date, in the cell-figure role, so a column
//            lines up digit for digit
//   amount — money: a number aligned right, under its `amount` heading
//   actions — the row's own controls, as narrow as they are, at the row's end
//   empty  — the one cell of a table with no rows, saying so
//   detail — the full-width cell an expanded row discloses its editor in; it spans
//            the row, so it is never pinned to the table's edge the way a table that
//            pins its last column would otherwise pin it
//   note   — a row's status and what it says, in a browse: wraps to the column,
//            breaking even a long address or code, so the row's actions stay in view
//   prose  — sentences that wrap, in a table that is part of a document being
//            read (a help article's table), never a browse
// Any other alignment is the caller's (`text-center` for dates).
const tableCellVariants = cva(
  // `h-row` RESERVES a row height, matching TableHead — without it a body row
  // is whatever its tallest cell happens to need, so a row carrying a badge
  // sits 2px taller than one of plain text and the table stops reading as
  // straight lines. On a <td> this is a minimum, not a cap, so a cell that
  // genuinely wraps still grows.
  "align-middle [&:has([role=checkbox])]:pr-0 [&_[role=checkbox]]:translate-y-[2px]",
  {
    variants: {
      kind: {
        text: "h-row px-2 py-1 whitespace-nowrap",
        title: "h-row px-2 py-1 whitespace-nowrap type-row-title",
        key: "h-row px-2 py-1 whitespace-nowrap type-code font-strong",
        code: "h-row px-2 py-1 whitespace-nowrap type-code",
        number: "h-row px-2 py-1 whitespace-nowrap type-cell-figure",
        amount: "h-row px-2 py-1 whitespace-nowrap type-cell-figure text-right",
        actions: "h-row w-[1%] px-2 py-1 whitespace-nowrap",
        empty: "py-empty-inset text-center type-state-message text-muted-foreground",
        detail: "static! bg-well bg-none! p-0",
        note: "h-row px-2 py-1 wrap-anywhere",
        prose: "px-2 py-1 align-top type-body",
      },
      tone: {
        primary: "",
        secondary: "text-muted-foreground",
      },
    },
    defaultVariants: { kind: "text", tone: "primary" },
  }
)

function TableCell({
  className,
  kind,
  tone,
  ...props
}: React.ComponentProps<"td"> & VariantProps<typeof tableCellVariants>) {
  return (
    <td
      data-slot="table-cell"
      className={cn(tableCellVariants({ kind, tone }), className)}
      {...props}
    />
  )
}

function TableCaption({
  className,
  ...props
}: React.ComponentProps<"caption">) {
  return (
    <caption
      data-slot="table-caption"
      className={cn("mt-4 type-body text-muted-foreground", className)}
      {...props}
    />
  )
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
}
