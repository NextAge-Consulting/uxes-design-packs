// ui-status: approved
// ui-atom
// ui-behaviour: loading-states.md, table-row-actions.md
import type * as React from "react"
import { EllipsisVertical } from "lucide-react"

import { BusyStatus } from "@design-pack/ui/components/busy-status"
import { Button } from "@design-pack/ui/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@design-pack/ui/components/ui/dropdown-menu"
import { Spinner } from "@design-pack/ui/components/ui/spinner"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@design-pack/ui/components/ui/tooltip"

/**
 * The overflow menu on a table row — the actions that exist but are not the
 * reason anyone opened the list.
 *
 * ## What belongs in here, and what does not
 *
 * A row's buttons are paid for on every row, forever. So the row itself carries
 * only the actions someone runs **routinely**; anything run at setup, or once a
 * quarter, or to check something, goes in here.
 *
 * **Frequency decides it, not importance.** A rarely-used action is not a minor
 * one — setting an account up is more consequential than the import that follows
 * it every month. It is in the menu because it is *done once*, and a permanent
 * button for a once-only act taxes the row forever to save one click a year.
 *
 * This does not soften `table-row-actions.md`'s standard-vs-one-off rule; it
 * sits before it. Decide first whether an action is frequent enough to be on the
 * row at all, then decide whether what is left is an icon or a word.
 *
 * ## Why a worded button beside this is not "mixing a word and an icon"
 *
 * `table-row-actions.md` forbids that pairing, and it means something narrower
 * than it first reads: *"do not pair a standard icon WITH its own word"*, and do
 * not present two peer actions as different kinds. This trigger is neither — it
 * is not an action, it is the container the remaining actions are inside, and it
 * has no worded twin because the words are on the items.
 *
 * ## Busy
 *
 * A menu closes when an item is chosen, so an action started from here has no
 * control left to spin on. The trigger takes over: the ellipsis is replaced by a
 * spinner in the same slot, so nothing moves, and `busyLabel` is announced in a
 * live region. The trigger stays enabled throughout — `disabled` means
 * unavailable, never working.
 */
export function RowActionsMenu({
  label,
  busy = false,
  busyLabel,
  children,
}: {
  /**
   * Announced and shown as the tooltip. **Name the row, not just the action** —
   * forty rows of "More actions" is forty identical announcements with no way to
   * tell which one has focus.
   */
  label: string
  busy?: boolean
  /** What is happening, spoken while `busy`. Required whenever `busy` can be true. */
  busyLabel?: string
  children: React.ReactNode
}) {
  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button aria-label={label} variant="quiet" size="icon-embedded">
              {busy ? (
                <Spinner className="size-4" />
              ) : (
                <EllipsisVertical aria-hidden />
              )}
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent>{label}</TooltipContent>
      </Tooltip>

      {/* `align="end"`: the trigger sits at the right edge of the row, so a
          menu aligned to its start would hang off the table. */}
      <DropdownMenuContent align="end">{children}</DropdownMenuContent>

      <BusyStatus busy={busy}>{busyLabel ?? ""}</BusyStatus>
    </DropdownMenu>
  )
}
