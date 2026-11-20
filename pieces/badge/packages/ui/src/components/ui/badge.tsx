// ui-status: approved
// ui-atom
import type * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@design-pack/ui/lib/utils"

const badgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-stamp border-line border-transparent px-2 py-1 type-badge whitespace-nowrap transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 [&_svg]:pointer-events-none [&_svg]:size-3",
  {
    variants: {
      variant: {
        // Every badge is a tinted fill + coloured outline + coloured text, so none
        // wears a button's solid fill (design.md → Colors → Status semantics).
        default: "border-primary-ink bg-primary-muted text-primary-ink",
        secondary:
          "bg-secondary text-secondary-foreground [a&]:hover:bg-secondary-hover",
        destructive: "border-danger bg-danger-muted text-danger",
        outline:
          "border-border text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
        ghost: "[a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
        link: "text-primary-ink underline-offset-4 [a&]:hover:underline",
        // See design.md → Colors → Status semantics for the label mappings.
        success: "border-success bg-success-muted text-success",
        warning: "border-warning bg-warning-muted text-warning",
        data: "border-data bg-data-muted text-data",
        muted: "border-neutral-state-border bg-neutral-state-muted text-muted-foreground",
        // A KIND of thing — which interface, which type — never a state. Two
        // hues outside the status family, so a kind is never read as health.
        // See design.md → Colors → Category.
        "category-1": "rounded-pill border-category-1 bg-category-1-muted px-3 text-category-1",
        "category-2": "rounded-pill border-category-2 bg-category-2-muted px-3 text-category-2",
        // A feature — something the service offers (a language, a paperless option),
        // never a record state. A pill, so it can't be read as a status, outlined in
        // the text colour and spending no hue: found by its shape and its icon, which
        // goes first. See design.md → Colors → Status semantics.
        feature: "rounded-pill border-foreground px-3 text-card-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span"

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
