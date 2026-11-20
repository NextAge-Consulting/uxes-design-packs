// ui-status: approved
// ui-atom
import { LoaderCircle } from "lucide-react"

import { cn } from "@design-pack/ui/lib/utils"

/**
 * Spinner — indeterminate, for a control that is doing work.
 *
 * Deliberately animates regardless of `prefers-reduced-motion`: it communicates
 * state, so freezing it would remove the signal rather than soften it.
 *
 * Decorative by default — the surrounding control carries the accessible name
 * and its busy state. Pass a `label` only when the spinner stands alone.
 */
function Spinner({
  className,
  label,
  ...props
}: React.ComponentProps<"span"> & { label?: string }) {
  return (
    <span
      data-slot="spinner"
      role={label ? "status" : undefined}
      aria-hidden={label ? undefined : true}
      className={cn("inline-flex items-center justify-center", className)}
      {...props}
    >
      <LoaderCircle className="size-4 animate-spin" />
      {label ? <span className="sr-only">{label}</span> : null}
    </span>
  )
}

export { Spinner }
