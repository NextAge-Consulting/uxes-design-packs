// ui-status: approved
// ui-atom
import type * as React from "react"

import { cn } from "@design-pack/ui/lib/utils"
import { fieldVariants } from "@design-pack/ui/components/ui/input"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        fieldVariants(),
        "flex field-sizing-content min-h-16 py-2",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
