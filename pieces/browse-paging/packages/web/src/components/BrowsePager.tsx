// ui-status: approved
// ui-block: Pager
// ui-behaviour: browse-paging.md
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
import { useId } from 'react'
import { IconButton } from '@design-pack/ui/components/icon-button'
import { Label } from '@design-pack/ui/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@design-pack/ui/components/ui/select'

import type { BrowsePagerProps } from '../browse/useBrowsePaging'
import {
  FIT,
  PAGE_SIZES,
  type PageSizePreference,
} from '../browse/useFitPageSize'

/**
 * The pager in its place at the foot of a browse — or nothing, when the list
 * fits on screen and there is no paging to control.
 *
 * Screens render this unconditionally and pass whatever `useBrowsePaging`
 * returned. The null case is handled here rather than at each call site so that
 * a browse copied as a reference cannot pick up the pager without the rule that
 * decides when to show it.
 *
 * The leftover sits ABOVE the pager, not around it.
 *
 * Whole-row fitting always leaves a remainder smaller than one row, and that
 * remainder has to go somewhere. Centring it splits it in two, so the reader
 * sees a gap above the pager AND a gap below it — two gaps for one remainder,
 * which reads as twice the waste it is. Measured at 17 rows: 26px above and
 * 34px below a 32px control.
 *
 * Pushing it all above puts one gap between the table and the pager, where it
 * reads as separation, and leaves the space below the pager as exactly the
 * page's own bottom padding. The pager then sits the same distance from the
 * bottom edge on every screen and at every window height, which is also easier
 * to hit with a mouse.
 */
export function BrowsePager({ pager }: { pager: BrowsePagerProps | null }) {
  if (pager === null) return null

  return (
    <div className="flex flex-1 items-end">
      <div className="w-full">
        <BrowseFooter {...pager} />
      </div>
    </div>
  )
}

/**
 * The pager for every browse and child list: a range readout, a rows selector — Fit
 * and the fixed sizes on a browse, a child list's own sizes on one — and transport
 * controls. Pattern and rationale:
 * `.claude/skills/ui-patterns/references/browse-paging.md`.
 *
 * NOT sticky, and no divider above it — in fit mode there is nothing to scroll
 * past, at a fixed size a pinned pager sits over the rows below it and implies
 * the page ends there, and the table card's border already separates the
 * regions.
 *
 * The transport is first, previous, next and last as icons, each an `IconButton`;
 * the readout is a range ("Showing 1–17 of 849"), never a bare total.
 */
function BrowseFooter({
  page,
  pageCount,
  pageSize,
  rowsOnPage,
  total,
  noun,
  preference,
  sizes,
  onPageSizeChange,
  onGoToPage,
}: {
  page: number
  /** Null when the total is unknown, which disables Last. */
  pageCount: number | null
  pageSize: number
  rowsOnPage: number
  total: number | null
  /** Singular; pluralised for the empty state. */
  noun: string
  preference: PageSizePreference | null
  /** A child list's fixed sizes, offered with no Fit. */
  sizes?: readonly number[]
  onPageSizeChange: (choice: string) => void
  onGoToPage: (page: number) => void
}) {
  const sizeId = useId()
  const first = (page - 1) * pageSize + 1
  const last = first + rowsOnPage - 1
  const atStart = page <= 1
  const atEnd = pageCount != null && page >= pageCount

  return (
    <footer
      data-browse-footer
      className="flex flex-wrap items-center justify-between gap-3 type-body text-muted-foreground"
    >
      {/* A range, not a total — it is what tells you whether the rows you can
          see are the whole page. The page number is NOT repeated here; the
          transport readout already carries it. */}
      <span>
        {rowsOnPage === 0
          ? `No ${plural(noun)}`
          : `Showing ${first.toLocaleString()}–${last.toLocaleString()}${
              total == null ? '' : ` of ${total.toLocaleString()}`
            }`}
      </span>

      <div className="flex items-center gap-2">
        <Label htmlFor={sizeId}>
          Rows
        </Label>
        <Select
          value={preference === null || preference === FIT ? FIT : String(preference)}
          onValueChange={onPageSizeChange}
        >
          <SelectTrigger id={sizeId} size="embedded" className="w-24">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {sizes ? null : <SelectItem value={FIT}>Fit</SelectItem>}
            {(sizes ?? PAGE_SIZES).map((n) => (
              <SelectItem key={n} value={String(n)}>
                {n}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <PageButton
          label="First Page"
          icon={ChevronsLeft}
          disabled={atStart}
          onClick={() => onGoToPage(1)}
        />
        <PageButton
          label="Previous Page"
          icon={ChevronLeft}
          disabled={atStart}
          onClick={() => onGoToPage(page - 1)}
        />
        <span className="min-w-24 text-center type-metadata">
          {pageCount ? `${page} / ${pageCount}` : page}
        </span>
        <PageButton
          label="Next Page"
          icon={ChevronRight}
          disabled={atEnd}
          onClick={() => onGoToPage(page + 1)}
        />
        <PageButton
          label="Last Page"
          icon={ChevronsRight}
          disabled={pageCount == null || atEnd}
          onClick={() => onGoToPage(pageCount ?? 1)}
        />
      </div>
    </footer>
  )
}

/** One transport control. `IconButton` carries the tooltip and the accessible
 *  name, so neither can be forgotten here. */
function PageButton({
  label,
  icon: Icon,
  disabled,
  onClick,
}: {
  label: string
  icon: React.ComponentType<{ className?: string; 'aria-hidden'?: boolean }>
  disabled: boolean
  onClick: () => void
}) {
  return (
    <IconButton
      icon={Icon}
      label={label}
      size="icon-embedded"
      disabled={disabled}
      onClick={onClick}
    />
  )
}

/** The noun's plural: a consonant then `y` takes `ies` (category → categories), else `s`. */
export function plural(noun: string): string {
  return /[^aeiou]y$/i.test(noun) ? `${noun.slice(0, -1)}ies` : `${noun}s`
}
