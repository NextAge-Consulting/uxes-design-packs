// ui-status: approved
// ui-atom
import type * as React from "react"

import { cn } from "@design-pack/ui/lib/utils"

/**
 * A content region.
 *
 * Reconciled to the project's tokens rather than left at shadcn's defaults:
 * 2px `border`, `panel` radius, and NO shadow — the theme is flat and separation
 * comes from borders (`design.md` → Elevation & Depth, Card). Shipped stock, it
 * disagreed with the spec on all three, which is why every card in the app was
 * hand-rolled instead of composed from it.
 *
 * `TableFrame` is the zero-padding variant for a table that IS the surface.
 *
 * `CardMedia`, first in the card, is a picture edge to edge across its top: the card drops
 * its top padding for it, and the picture is cropped to a `ratio`. `CardFooter` sits at the
 * card's bottom, so cards stretched to one height in a row line their footers up.
 */
// `edge="bottom"` — a card against the bottom edge of the screen, a bottom sheet: its
// bottom corners square and its bottom border gone where it meets the edge, its shadow
// cast upward, and its content clear of a phone's home indicator.
function Card({
  className,
  edge,
  ...props
}: React.ComponentProps<"div"> & { edge?: "bottom" }) {
  return (
    <div
      data-slot="card"
      className={cn(
        "flex flex-col gap-4 border-frame border-border bg-card text-card-foreground",
        edge === "bottom"
          ? "rounded-t-container border-b-0 pt-4 shadow-sheet edge-panel has-data-[inset=list]:pt-2"
          : "rounded-container py-4 has-data-[inset=list]:py-2",
        "has-data-[slot=card-media]:overflow-hidden has-data-[slot=card-media]:pt-0",
        className
      )}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-4 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b-frame]:pb-4",
        className
      )}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn("flex items-center gap-2 type-card-title", className)}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("type-body text-muted-foreground", className)}
      {...props}
    />
  )
}

// Beside the title: a badge, or the header's controls in a row, 8px apart.
function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 flex items-center gap-x-2 gap-y-1 self-start justify-self-end",
        className
      )}
      {...props}
    />
  )
}

// `inset` says what the content is:
//   padded — a stack of blocks inside the card's padding (the default)
//   list — a column of rows (a `NavList`), 8px from every edge; the card trims its
//          own top and bottom to match, so a row's highlight sits evenly inset
//   flush — children that draw their own padded, divided regions (the form shell)
//   rows — a table or a list of rows running edge to edge, under a rule that
//          divides them from the header
const CARD_MEDIA_RATIO = {
  landscape: "aspect-video",
  square: "aspect-square",
} as const

function CardMedia({
  className,
  ratio = "landscape",
  ...props
}: React.ComponentProps<"div"> & { ratio?: keyof typeof CARD_MEDIA_RATIO }) {
  return (
    <div
      data-slot="card-media"
      className={cn(
        "overflow-hidden [&_img]:block [&_img]:size-full [&_img]:object-cover",
        CARD_MEDIA_RATIO[ratio],
        className
      )}
      {...props}
    />
  )
}

const CARD_CONTENT_INSET = {
  padded: "gap-default px-4",
  list: "gap-0 px-2",
  flush: "gap-0 p-0",
  rows: "gap-0 border-t-line border-border-subtle p-0",
} as const

function CardContent({
  className,
  inset = "padded",
  ...props
}: React.ComponentProps<"div"> & { inset?: keyof typeof CARD_CONTENT_INSET }) {
  return (
    <div
      data-slot="card-content"
      data-inset={inset}
      className={cn("flex flex-col", CARD_CONTENT_INSET[inset], className)}
      {...props}
    />
  )
}

/** `ruled` sets the footer off from the card's content with a rule above it. */
function CardFooter({ className, ruled = false, ...props }: React.ComponentProps<"div"> & { ruled?: boolean }) {
  return (
    <div
      data-slot="card-footer"
      className={cn("mt-auto flex items-center px-4 [.border-t-frame]:pt-4", ruled && "border-t-frame border-border-subtle", className)}
      {...props}
    />
  )
}

export {
  Card,
  CardMedia,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
}
