// design-accepted — a list inside a record takes its own shape (child-list.md)
// ui-status: approved
// ui-block: DataTable
// ui-behaviour: child-list.md
import { BrowseLoading } from '@design-pack/ui/components/browse-toolbar'
import { Card, CardAction, CardContent, CardFooter, CardHeader, CardTitle } from '@design-pack/ui/components/ui/card'
import type { ReactNode } from 'react'
import type { BrowsePagerProps } from '../browse/useBrowsePaging'
import { BrowsePager } from './BrowsePager'

/**
 * A record's child list — an order's lines, an invoice's payments —
 * as a card on the record: its title with the card's own actions in the header, the
 * `BrowseTable` (`inCard`) edge to edge under the header's rule, and the pager in a ruled
 * footer while there is paging (`child-list.md`); while its rows load, the list's
 * loading sign sits before the card's actions. No search, filter or chips: the record
 * already says whose rows these are.
 */
export function ChildList({
  title,
  actions,
  loading,
  pager,
  children,
}: {
  title: string
  /** Its rows are on their way — `useBrowseData`'s `loading`. */
  loading: boolean
  /** The card's own actions, such as a report of the whole list or Add. */
  actions?: ReactNode
  /** From `childPager`; null when every row fits on the smallest page. */
  pager: BrowsePagerProps | null
  /** The list's `BrowseTable`, with `inCard`. */
  children: ReactNode
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardAction className="flex items-center gap-3"> {/* design-accepted — the loading sign spaced from the card's own actions, approved in the running app */}
          <BrowseLoading busy={loading} />
          {actions}
        </CardAction>
      </CardHeader>
      <CardContent inset="rows">{children}</CardContent>
      {pager ? (
        <CardFooter ruled>
          <BrowsePager pager={pager} />
        </CardFooter>
      ) : null}
    </Card>
  )
}
