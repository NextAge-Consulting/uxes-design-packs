// ui-status: approved
// ui-atom
// ui-behaviour: loading-states.md
import { Skeleton } from "@design-pack/ui/components/ui/skeleton"

/**
 * A screen's outline while its data loads: a heading and rows in the page gutter. Hidden
 * from assistive technology; whoever shows it announces the wait.
 */
export function ScreenSkeleton() {
  return (
    <div aria-hidden className="flex min-h-full flex-col gap-default p-page-edge">
      <Skeleton shape="field" className="w-64" />
      {Array.from({ length: 8 }, (_, i) => i).map((i) => (
        <Skeleton key={i} shape="row" className="w-full" />
      ))}
    </div>
  )
}
