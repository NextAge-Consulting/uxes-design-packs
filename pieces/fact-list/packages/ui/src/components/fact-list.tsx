// ui-status: approved
// ui-block: FactList
import type * as React from "react"

import { cn } from "@design-pack/ui/lib/utils"

/**
 * FactList — read-only facts, one under another: a phone number, an email address,
 * opening hours, an address, a date, a count. For FACTS anywhere they are read on their
 * own; a value in a form beside fields you type into is `ReadOnlyField`, a list of
 * destinations is `NavList`, figures that add up are `SummaryList`.
 *
 * A captioned fact is one `Fact`: its caption tight above its value, so the two read as
 * a pair and the next fact stands apart. `icon` leads it where facts are read on their
 * own — a record's cards, a person's details — and is left off where a fact turns into a
 * field on Change, so the field takes its place without the line shifting.
 * A value that says what it is (a phone number, an email address) takes no caption —
 * compose `FactListItem` with the value and give it a screen-reader label instead. A
 * value followed by a badge goes in `FactListValue`, which owns the space between them.
 *
 * The icon has a slot of its own, never a bare first child: a Claude Design page wraps
 * every mounted child, so a direct-child rule would never size it there, and sizing
 * every icon in the row would also enlarge an icon inside the value (a badge's).
 *
 * Laying the list out in columns is the page's call; the spacing is the list's.
 */
function FactList({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="fact-list" className={cn("flex flex-col gap-4", className)} {...props} />
}

function FactListItem({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div data-slot="fact-list-item" className={cn("flex min-w-0 items-start gap-3", className)} {...props} />
  )
}

function FactListIcon({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="fact-list-icon"
      aria-hidden
      className={cn("flex size-6 shrink-0 text-muted-foreground [&_svg]:size-6", className)}
      {...props}
    />
  )
}

// A value with something after it — a phone number and its badge. The gap is the
// list's: a typed space before a mounted component is dropped in a Claude Design page.
function FactListValue({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="fact-list-value"
      className={cn("flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1", className)}
      {...props}
    />
  )
}

// A caption and its value, stacked.
function FactListContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div data-slot="fact-list-content" className={cn("flex min-w-0 flex-col gap-tight", className)} {...props} />
  )
}

// The caption is set at the value's size, heavier and muted: it names the value without
// shrinking below it.
function FactListCaption({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span data-slot="fact-list-caption" className={cn("type-field-label text-muted-foreground", className)} {...props} />
  )
}

/**
 * One captioned fact. A value given as lines — an address — stacks one per line. It
 * stands alone inside another layout's spacing — an inline-form card's stack, where it
 * swaps places with its form — and sits in a `FactList` when facts are listed.
 */
function Fact({
  caption,
  icon,
  children,
}: {
  caption: React.ReactNode
  /** A lucide icon element, where one helps the eye. */
  icon?: React.ReactNode
  /** The value, or its lines. */
  children: React.ReactNode | readonly string[]
}) {
  const value = isLines(children)
    ? children.filter(Boolean).map((line, i) => (
        <span key={line}>
          {i > 0 && <br />}
          {line}
        </span>
      ))
    : children
  return (
    <FactListItem>
      {icon ? <FactListIcon>{icon}</FactListIcon> : null}
      <FactListContent>
        <FactListCaption>{caption}</FactListCaption>
        <span className="type-body text-card-foreground">{value}</span>
      </FactListContent>
    </FactListItem>
  )
}

function isLines(value: unknown): value is readonly string[] {
  return Array.isArray(value) && value.every((line) => typeof line === "string")
}

export { Fact, FactList, FactListItem, FactListIcon, FactListValue, FactListContent, FactListCaption }
