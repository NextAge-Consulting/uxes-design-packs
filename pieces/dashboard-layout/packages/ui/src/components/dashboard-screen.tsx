// ui-status: approved
// ui-block: DashboardScreen
import type * as React from "react"

/**
 * The frame of a read-only summary screen: the page gutter and the column its heading,
 * its choices and its cards stack in, a section's gap apart. Pattern: `dashboard-layout.md`.
 */
function DashboardScreen({ children }: { children: React.ReactNode }) {
  return (
    <div data-slot="dashboard-screen" className="flex flex-col gap-section p-page-edge">
      {children}
    </div>
  )
}

export { DashboardScreen }
