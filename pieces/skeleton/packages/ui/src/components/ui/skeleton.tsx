// ui-status: approved
// ui-atom
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@design-pack/ui/lib/utils"

/**
 * Skeleton — a content-shaped placeholder for a region being rebuilt.
 *
 * Use where the layout is KNOWN, so nothing jumps when the real content lands
 * and the user can see what is coming. For a control that triggered slow work,
 * use a Spinner on the control instead.
 * See design.md → Components, and the loading-states references.
 */
const skeletonVariants = cva("animate-pulse rounded-control bg-placeholder", {
  variants: {
    // What the placeholder stands in for, so it lands at that thing's height.
    shape: {
      caption: "h-4",
      field: "h-control",
      row: "h-row",
    },
  },
})

function Skeleton({
  className,
  shape,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof skeletonVariants>) {
  return (
    <div
      data-slot="skeleton"
      aria-hidden="true"
      className={cn(skeletonVariants({ shape }), className)}
      {...props}
    />
  )
}

export { Skeleton }
