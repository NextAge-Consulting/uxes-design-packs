// ui-status: approved
// ui-atom
// ui-behaviour: permission-masked-fields.md
import type * as React from "react"
import { Lock } from "lucide-react"

import { cn } from "@design-pack/ui/lib/utils"
import { Tooltip, TooltipContent, TooltipTrigger } from "@design-pack/ui/components/ui/tooltip"

/**
 * A value the signed-in user is not permitted to see.
 *
 * ## Masked, not hidden — and that is the deliberate exception
 *
 * The usual choice is to hide what a user cannot reach: it declutters the
 * screen and it does not tease. This component exists for the cases where the
 * opposite is right, and there are two reasons, both about what the user learns:
 *
 * - **Absence is ambiguous.** A missing cost reads as "this item has no cost
 *   recorded", which is a different and wrong fact. The placeholder says the
 *   number exists and is withheld — so nobody makes a decision on a value they
 *   think is zero.
 * - **It makes the permission visible.** A user who can see that something is
 *   restricted can ask for access. A user shown nothing has nothing to ask
 *   about, and an administrator has nothing prompting them to decide.
 *
 * Use it where a value is genuinely withheld from THIS user by a permission.
 * Do NOT use it for a value that is merely absent, not applicable, or not yet
 * entered — those are empty states and read differently.
 *
 * ## The blur is a treatment, not a mechanism
 *
 * The real value never reaches the browser: the server omits it and flags what
 * it withheld. This renders a plausible-width placeholder so the layout does
 * not jump, and blurs it so it reads as obscured rather than as data. There is
 * nothing here to un-blur — the digits are decorative.
 */
export function RestrictedValue({
  /** Roughly how wide the real value would be, so nothing reflows when granted. */
  width = "5ch",
  /** What is withheld, for the tooltip: "Cost", "Markup". */
  label,
  className,
  ...props
}: {
  width?: string
  label?: string
} & Omit<React.ComponentProps<"span">, "children">) {
  const message = label
    ? `${label} is restricted — ask an administrator for access.`
    : "Restricted — ask an administrator for access."

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          data-slot="restricted-value"
          // `role="img"` because that is what this is: a graphic standing in
          // for a value, not text to be read. It also makes `aria-label` valid
          // here — a bare span has no role to attach a name to, so the label
          // would be dropped by assistive tech rather than announced.
          role="img"
          // Announced instead of the placeholder digits, which are meaningless
          // and would otherwise be read out as if they were the value.
          aria-label={message}
          className={cn(
            "inline-flex select-none items-center gap-1 align-middle text-muted-foreground",
            className,
          )}
          {...props}
        >
          <Lock aria-hidden className="size-3 shrink-0" />
          <span
            aria-hidden
            className="rounded-stamp bg-muted/60 blur-[3px]"
            style={{ width }}
          >
            {/* Decorative filler. Not the value, and never was — the server did
                not send one. */}
            0000
          </span>
        </span>
      </TooltipTrigger>
      <TooltipContent>{message}</TooltipContent>
    </Tooltip>
  )
}
