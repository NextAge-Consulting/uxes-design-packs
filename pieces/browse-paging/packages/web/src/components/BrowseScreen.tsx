// ui-status: approved
// ui-block: BrowseScreen
// ui-behaviour: browse-paging.md
import type { ReactNode } from 'react'

/**
 * The frame of every browse: the page gutter and the column the toolbar, the
 * table and the pager stack in. Pattern: `browse-layout.md`.
 *
 * `data-browse-root` is what `measureFit` reads the row gap and bottom padding
 * from, so the fit-to-viewport page size and this frame cannot drift apart.
 */
export function BrowseScreen({ children }: { children: ReactNode }) {
  return (
    <div data-browse-root className="flex min-h-full flex-col gap-default p-page-edge">
      {children}
    </div>
  )
}
