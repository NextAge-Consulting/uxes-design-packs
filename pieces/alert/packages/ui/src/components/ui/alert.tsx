// ui-status: approved
// ui-atom
import type * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@design-pack/ui/lib/utils"

const alertVariants = cva(
  "relative grid gap-y-tight rounded-container border-frame px-3 py-2 type-body font-emphasis has-data-[slot=alert-icon]:pl-alert-inset has-data-[slot=alert-title]:has-data-[slot=alert-icon]:pl-alert-inset-titled has-data-[slot=alert-title]:[&_[data-slot=alert-icon]]:size-icon-alert-titled has-data-[slot=alert-title]:[&_[data-slot=alert-icon]_svg]:stroke-[1.25]",
  {
    variants: {
      variant: {
        info: "border-feedback-info-border bg-feedback-info-muted text-feedback-info",
        destructive: "border-feedback-danger-border bg-feedback-danger-muted text-feedback-danger",
        success: "border-feedback-success-border bg-feedback-success-muted text-feedback-success",
        warning: "border-feedback-warning-border bg-feedback-warning-muted text-feedback-warning",
        // Something the reader must not miss that is nothing wrong — dressed as the
        // "new" badge, so it draws the eye without reading as a warning.
        notice: "border-feedback-notice-border bg-feedback-notice-muted text-feedback-notice",
      },
    },
    defaultVariants: { variant: "info" },
  }
)

/** Assertive only where an interruption is warranted. */
const ROLE_FOR: Record<NonNullable<AlertVariant>, "alert" | "status"> = {
  info: "status",
  destructive: "alert",
  success: "status",
  warning: "alert",
  notice: "status",
}

type AlertVariant = VariantProps<typeof alertVariants>["variant"]

/**
 * A banner stating the outcome of something the user did, or a condition they
 * need to know about.
 *
 * This existed as eighteen hand-rolled copies of the same class string before it
 * was a component, and they had drifted: three radii, two font weights, and a
 * `role` that was sometimes `alert` on a success message. The variant now
 * carries all of it.
 *
 * **The role follows the severity, and that is the point.** `role="alert"` is an
 * assertive live region — it interrupts a screen reader mid-sentence, which is
 * right for a failure and rude for "Saved." Success and neutral use
 * `role="status"`, which is polite and waits its turn.
 *
 * Deviates from the shadcn default deliberately: this theme is flat, so
 * separation is a 2px border plus a muted fill, never the stock 1px + `bg-card`
 * (`design.md` → Elevation & Depth).
 *
 * ## The contents STACK, and the icon floats
 *
 * This was a flex ROW, which lays `AlertTitle` and `AlertDescription` out as two
 * COLUMNS — the title on the left, the body beside it — because they are two
 * children of one row. It went unseen for as long as every caller passed a
 * single string; the first to pass both got a two-column banner.
 *
 * So it is a single-column grid, and the icon is taken out of flow and
 * positioned, with `has-[>svg]` reserving the gutter only when one is there.
 *
 * **A two-column grid would have been the obvious fix, and it is wrong here.**
 * Pinning the title and body to column two leaves a bare string child — which
 * two different screens both pass — landing in column one. A raw
 * text node is an anonymous grid item and cannot carry a class, so nothing can
 * move it, and it would render clipped to a zero-width column. One column means
 * every child stacks whatever it is.
 *
 * ## `info` takes the WELL fill, never `surface`
 *
 * `surface` is the CANVAS — the page these cards sit on. Painting it inside a
 * card drops the region two steps down the surface stack, and `design.md` is
 * explicit about what that looks like: *"Near-black does not read as 'a few
 * shades darker' — it reads as a hole."* Measured in dark mode, `card` is
 * 0.2638 and `surface` is 0.2100.
 *
 * `well` (0.2350) is the token that exists for exactly this — *"a recessed area
 * INSIDE a card"* — and it is the right answer on the page canvas too, where it
 * reads as a raised notice rather than a pit. The other three variants never had
 * this problem because their fills are semantic feedback tints, not layout
 * surfaces.
 */
function Alert({
  className,
  variant,
  role,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
  return (
    <div
      data-slot="alert"
      role={role ?? ROLE_FOR[variant ?? "info"]}
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  )
}

/** An optional bold lead-in above the body, for a banner that needs both. */
function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-title"
      className={cn("font-heading", className)}
      {...props}
    />
  )
}

// The alert's icon, placed by the alert itself: the icon sits in this slot, never as a
// bare child, because a Claude Design page wraps every mounted child and a direct-child
// rule would never reach it there. The alert makes room whenever one is present.
//
// Its size follows the alert's structure, set from the alert above: 20px — one line
// tall — on a one-message alert, 32px on an alert with a title, spanning the title and
// the start of its text. The line weight stays the 20px icon's at both sizes (stroke
// 1.25 at 32px): scaling the stroke with the icon makes the large one heavier than the
// text beside it.
function AlertIcon({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="alert-icon"
      aria-hidden
      className={cn("absolute top-2 left-3 flex size-icon-alert [&_svg]:size-full [&_svg]:shrink-0", className)}
      {...props}
    />
  )
}

function AlertDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-description"
      className={cn("font-body", className)}
      {...props}
    />
  )
}

export { Alert, AlertIcon, AlertTitle, AlertDescription, alertVariants }
