// ui-status: approved
// ui-atom
import type * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@design-pack/ui/lib/utils"

const buttonVariants = cva(
  // Disabled uses the design system's disabled token trio, NOT opacity. A single
  // opacity reads as disabled only on low-ink variants: it washes out an outline
  // button (border + icon are the only ink) while a filled primary stays a solid
  // coloured button with legible white text. Overriding all three channels gives
  // every variant the same inert grey. See design.md → Colors → Disabled.
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-control type-button-label whitespace-nowrap transition-all outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:bg-disabled disabled:text-disabled-foreground disabled:border-disabled-border aria-disabled:text-disabled-foreground aria-invalid:border-feedback-danger aria-invalid:ring-feedback-danger/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-icon-body",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary-hover",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive-hover focus-visible:ring-destructive/20",
        outline:
          "border-line border-outline-border bg-outline-fill hover:bg-outline-hover hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary-hover",
        ghost: "hover:bg-ghost-hover hover:text-accent-foreground",
        // A destructive action that is not the page's main event — a delete
        // sitting in a row of actions. It carries the destructive colour so the
        // consequence reads before the click, without the visual weight of a
        // filled red button repeated down every row.
        "ghost-destructive":
          "text-destructive hover:bg-destructive/10 hover:text-destructive focus-visible:ring-destructive/20",
        // Inline text that acts — "Forgot your password?". Sized by its text,
        // not by the control height.
        link: "text-primary-ink underline-offset-4 hover:underline",
        // A whole row of a picker list that is itself the command — its content
        // is a title and a metadata line, so it starts at the left edge and
        // grows to fit them.
        row: "w-full justify-start text-left hover:bg-ghost-hover hover:text-accent-foreground",
        // Every icon-only button: a glyph with no fill and no border, muted at
        // rest and bright on hover or while the menu it opens is open.
        quiet: "text-muted-foreground hover:text-accent-foreground aria-expanded:text-accent-foreground",
        // A toggle on a row that shows only while its `group/row` is hovered or
        // focused, and stays visible while it is on — a nav item's star.
        "row-toggle":
          "text-muted-foreground opacity-0 transition-opacity hover:text-accent-foreground focus-visible:opacity-100 group-hover/row:opacity-100 aria-pressed:opacity-100",
      },
      size: {
        default: "h-control px-4 py-2 has-[>svg]:px-3",
        embedded: "h-control-embedded px-3 has-[>svg]:px-2",
        icon: "size-control",
        "icon-embedded": "size-control-embedded",
        "icon-affix": "size-control-affix",
      },
      // Two centred lines between an icon column and an empty column its width, growing
      // past the control height to fit the second line — what `CaptionedButton` draws.
      captioned: {
        true: "grid h-auto min-h-control grid-cols-[var(--icon-alert-titled)_minmax(0,1fr)_var(--icon-alert-titled)] items-center gap-3 py-2 [&_[data-slot=captioned-button-icon]_svg:not([class*='size-'])]:size-full [&_[data-slot=captioned-button-icon]_svg]:stroke-[1.25]",
        false: "",
      },
    },
    compoundVariants: [
      { variant: "link", className: "h-auto p-0 has-[>svg]:p-0" },
      { variant: "row", className: "h-auto px-3 py-2 has-[>svg]:px-3" },
    ],
    defaultVariants: {
      variant: "default",
      size: "default",
      captioned: false,
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  captioned = false,
  asChild = false,
  type,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, captioned, className }))}
      {...(asChild ? {} : { type: type ?? "button" })}
      {...props}
    />
  )
}

export { Button, buttonVariants }
