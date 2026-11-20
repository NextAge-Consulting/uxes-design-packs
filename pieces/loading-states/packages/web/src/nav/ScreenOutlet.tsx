// ui-content
// ui-behaviour-code: loading-states.md
import { Outlet, useRouterState } from '@tanstack/react-router'
import { BusyStatus } from '@design-pack/ui/components/busy-status'
import { ScreenSkeleton } from '@design-pack/ui/components/screen-skeleton'
import { useDelayedLoading } from '@design-pack/ui/hooks/use-delayed-loading'

/**
 * Where an app draws its signed-in screens. A click that goes to another screen shows that
 * screen's outline at once while its data loads; a list changing its own page, filter or
 * sort keeps its rows, because the path has not changed.
 */
export function ScreenOutlet() {
  const moving = useRouterState({ select: (s) => s.isLoading && s.location.pathname !== s.resolvedLocation?.pathname })
  const waiting = useDelayedLoading(moving)
  if (!waiting) return <Outlet />
  return (
    <>
      <ScreenSkeleton />
      <BusyStatus busy>Loading</BusyStatus>
    </>
  )
}
