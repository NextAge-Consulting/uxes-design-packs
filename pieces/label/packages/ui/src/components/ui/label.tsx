// ui-status: approved
// ui-atom
import type * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Label as LabelPrimitive } from "radix-ui"

import { cn } from "@design-pack/ui/lib/utils"

// `kind` says what the label names:
//   field  — a control's name, above or beside it ("Email", "Rows per page")
//   option — the words beside a checkbox or radio, read as the choice itself
const labelVariants = cva(
  "flex items-center gap-2 select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:text-disabled-foreground peer-disabled:cursor-not-allowed peer-disabled:text-disabled-foreground",
  {
    variants: {
      kind: {
        field: "type-field-label",
        option: "type-body",
      },
    },
    defaultVariants: { kind: "field" },
  }
)

function Label({
  className,
  kind,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root> &
  VariantProps<typeof labelVariants>) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn(labelVariants({ kind }), className)}
      {...props}
    />
  )
}

export { Label }
