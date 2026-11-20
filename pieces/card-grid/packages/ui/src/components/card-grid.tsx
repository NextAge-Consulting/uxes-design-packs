// ui-status: approved
// ui-block: CardGrid
import type * as React from "react"

import { cn } from "@design-pack/ui/lib/utils"

/**
 * Cards of one kind in a grid — tips, articles, options to pick from: one column on a phone,
 * two from a tablet, three from a wide screen, 16px apart. Cards stretched to one height in
 * a row line their footers up (`CardFooter`).
 */
function CardGrid({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-grid"
      className={cn("grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3", className)}
      {...props}
    />
  )
}

export { CardGrid }
