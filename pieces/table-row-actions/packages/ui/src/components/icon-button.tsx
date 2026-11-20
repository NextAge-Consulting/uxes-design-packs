// ui-status: approved
// ui-atom
// ui-behaviour: table-row-actions.md
import * as React from "react"

import { Button } from "@design-pack/ui/components/ui/button"
import { cn } from "@design-pack/ui/lib/utils"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@design-pack/ui/components/ui/tooltip"

/**
 * An icon-only button, with its label made non-optional.
 *
 * An icon with no text has no accessible name and no hover hint, so the house
 * rules require BOTH an `aria-label` and a tooltip on every one. Written by
 * hand that is two things to remember per button, and the second one is the one
 * that gets dropped — silently, because the button still looks right.
 *
 * Here `label` is a required prop that feeds both. Writing an unlabelled icon
 * button is not possible without going back to the raw `Button`.
 */
export function IconButton({
  label,
  icon: Icon,
  side,
  size = "icon-embedded",
  variant = "quiet",
  disabled,
  href,
  newTab,
  className,
  ...props
}: Omit<React.ComponentProps<typeof Button>, "children" | "aria-label" | "variant"> & {
  /** `row-toggle` for a toggle shown only while its row is hovered;
   *  `ghost-destructive` for a delete (`table-row-actions.md`). */
  variant?: "quiet" | "row-toggle" | "ghost-destructive"
  /** Announced by screen readers AND shown as the tooltip. Name the action. */
  label: string
  /**
   * The glyph: a component, or an element when the glyph carries state — a
   * filled star, a chevron turned open. An element renders as given, so mark it
   * `aria-hidden`.
   */
  icon:
    | React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>
    | React.ReactElement
  side?: React.ComponentProps<typeof TooltipContent>["side"]
  /**
   * Render an anchor instead of a button — an icon-only LINK.
   *
   * Opening a file or an external record is a navigation, not an action, and it
   * has to be a real `<a>`: middle-click, cmd-click and "copy link address" all
   * come from the element, not from an onClick. Without this the case is
   * hand-rolled at the call site, which is where the label and the tooltip get
   * dropped — the row action this replaced was a bare worded link.
   *
   * For an in-app route, pass the router's `Link` through `asChild` instead;
   * this package imports no router.
   */
  href?: string
  /** Opens in a new tab, and says so in the accessible name. */
  newTab?: boolean
}) {
  const name = href && newTab ? `${label} (opens in a new tab)` : label
  const glyph = React.isValidElement(Icon) ? Icon : <Icon aria-hidden />

  const control = href ? (
    <Button asChild variant={variant} size={size} {...props}>
      <a
        href={href}
        aria-label={name}
        {...(newTab ? { target: "_blank", rel: "noreferrer" } : {})}
      >
        {glyph}
      </a>
    </Button>
  ) : (
    <Button
      aria-label={name}
      variant={variant}
      size={size}
      disabled={disabled}
      {...props}
    >
      {glyph}
    </Button>
  )

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {/* A disabled button fires no pointer events, so a tooltip attached
            straight to it would never open. The span stays hoverable while the
            button itself remains inert. It is the outermost box, so the caller's
            placement lands here — the tooltip anchors to where the button is. */}
        <span className={cn("inline-flex items-center", className)}>{control}</span>
      </TooltipTrigger>
      <TooltipContent side={side}>{label}</TooltipContent>
    </Tooltip>
  )
}
