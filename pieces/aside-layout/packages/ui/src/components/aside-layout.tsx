// ui-status: approved
// ui-block: AsideScreen
import type * as React from "react"

import { cn } from "@design-pack/ui/lib/utils"

/**
 * A page body in two columns from 1024px: `AsideLayoutSide`, a narrow column of
 * supporting blocks, beside `AsideLayoutMain`. Below 1024px it is one column, the side
 * first. The columns are 24px apart, 16px when stacked; blocks in a column are 16px
 * apart.
 */
function AsideLayout({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="aside-layout"
      className={cn(
        "grid w-full grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,var(--size-aside))_minmax(0,1fr)] lg:gap-6",
        className
      )}
      {...props}
    />
  )
}

function AsideLayoutSide({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="aside-layout-side" className={cn("flex min-w-0 flex-col gap-4", className)} {...props} />
}

function AsideLayoutMain({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="aside-layout-main" className={cn("flex min-w-0 flex-col gap-4", className)} {...props} />
}

export { AsideLayout, AsideLayoutSide, AsideLayoutMain }
