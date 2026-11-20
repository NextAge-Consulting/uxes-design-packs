// ui-status: approved
// ui-block: PickerDialog
// ui-behaviour: loading-states.md
import type * as React from "react"

import { BusyStatus } from "@design-pack/ui/components/busy-status"
import { EmptyState } from "@design-pack/ui/components/empty-state"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@design-pack/ui/components/ui/dialog"
import { SearchInput } from "@design-pack/ui/components/ui/input"

/**
 * Choose one record from a searchable list — choosing it is what ends the
 * dialog, so there is no Select or OK button.
 *
 * The frame: title and description, a search box, and the list in a scrolling
 * region. The caller supplies the rows — `Button variant="row"` — and filters
 * them against `query`; when nothing is left it passes `emptyMessage` instead.
 * `banner` is a notice above the search, such as a failed choice.
 */
export function PickerDialog({
  open,
  onOpenChange,
  title,
  description,
  searchLabel,
  searchPlaceholder,
  query,
  onQueryChange,
  banner,
  emptyMessage,
  busy = false,
  busyLabel,
  children,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: React.ReactNode
  description?: React.ReactNode
  searchLabel: string
  searchPlaceholder?: string
  query: string
  onQueryChange: (query: string) => void
  banner?: React.ReactNode
  /** Shown in place of the list when it has nothing to offer — "Nobody matches." */
  emptyMessage?: React.ReactNode
  /** A choice is being acted on — one announcement for the dialog, not per row. */
  busy?: boolean
  busyLabel?: string
  children?: React.ReactNode
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description ? <DialogDescription>{description}</DialogDescription> : null}
        </DialogHeader>
        {banner}
        <SearchInput
          aria-label={searchLabel}
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder={searchPlaceholder}
        />
        <div className="max-h-80 scroll-region">
          {emptyMessage ? (
            <EmptyState>{emptyMessage}</EmptyState>
          ) : (
            <ul className="flex flex-col">{children}</ul>
          )}
        </div>
        {busyLabel ? <BusyStatus busy={busy}>{busyLabel}</BusyStatus> : null}
      </DialogContent>
    </Dialog>
  )
}
