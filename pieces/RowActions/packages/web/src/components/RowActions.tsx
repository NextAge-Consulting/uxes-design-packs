// ui-status: approved
// ui-block: RowActions
// ui-behaviour: documents.md, loading-states.md, table-row-actions.md
// Guarantee: delete is always the trash icon in ghost-destructive, never a filled red button.
import { BusyStatus } from '@design-pack/ui/components/busy-status'
import { IconButton } from '@design-pack/ui/components/icon-button'
import { RowActionsMenu } from '@design-pack/ui/components/row-actions-menu'
import { Spinner } from '@design-pack/ui/components/ui/spinner'
import { TableCell, TableHead } from '@design-pack/ui/components/ui/table'
import { Download, Eye, FileText, Pencil, Trash2 } from 'lucide-react'
import type { ReactNode } from 'react'
import { IconLink } from './IconLink'

/** Where a row's action goes: a screen of the app, or something done in place. */
export type RowAction = { to: string; search?: Record<string, unknown> } | { onClick: () => void }

/**
 * A file the row is, or has. `label` is the whole name, the row included, since a file
 * is told apart by more than its row ("Download the import file — 12 Oct, 4 KB").
 * Fetched first when it is `onClick`: while it fetches, `busy` is what is announced,
 * and the icon's slot spins.
 */
export type RowDownload = { label: string } & ({ href: string } | { onClick: () => void; busy?: string })

/**
 * A generated report about the row (`documents.md`): opened in a new tab from `href`, or
 * `onClick` to ask for its choices first. `label` is the whole name, the row included:
 * "Activity Report for Pat Example".
 */
export type RowReport = { label: string } & ({ href: string } | { onClick: () => void })

/**
 * A delete. `onClick` opens the confirmation `table-row-actions.md`'s two gates choose —
 * this cell has no in-place "Delete? Yes / No". `label` when it removes the row from
 * something rather than deleting it ("Remove Pat Example from this group").
 */
export type RowRemove = { onClick: () => void; label?: string }

/**
 * The standard action row at the end of every list
 * (`table-row-actions.md`): view, edit, report, download and delete as icons, in that order,
 * then the overflow menu holding the row's other actions. Each appears only when the
 * row offers it. The cell keeps its clicks to itself, so a row that opens on a click
 * does not open when one of these is used.
 *
 * `subject` names the row — "Pat Example", "item 101" — and finishes every label, so
 * forty rows never announce forty identical "Edit"s.
 */
export function RowActions({
  subject,
  view,
  edit,
  report,
  download,
  remove,
  menu,
  menuBusy,
  buttons,
}: {
  subject: string
  view?: RowAction
  edit?: RowAction
  report?: RowReport
  download?: RowDownload
  remove?: RowRemove
  /** `DropdownMenuItem`s for the row's other actions. */
  menu?: ReactNode
  /** What an action started from the menu is doing, while it works — announced, and
   *  the menu's trigger spins. */
  menuBusy?: string
  /**
   * The row's routine one-off actions, as worded buttons ahead of the icons — "Imports",
   * "History" (`table-row-actions.md`: a worded button beside the overflow
   * trigger is not a mixed action group).
   */
  buttons?: ReactNode
}) {
  return (
    <TableCell kind="actions" onClick={(event) => event.stopPropagation()} onKeyDown={(event) => event.stopPropagation()}>
      <span className="flex items-center justify-end gap-1">
        {buttons}
        {view ? <Action action={view} icon={Eye} label={`View ${subject}`} /> : null}
        {edit ? <Action action={edit} icon={Pencil} label={`Edit ${subject}`} /> : null}
        {report ? (
          'href' in report ? (
            <IconButton icon={FileText} label={report.label} href={report.href} newTab />
          ) : (
            <IconButton icon={FileText} label={report.label} onClick={report.onClick} />
          )
        ) : null}
        {download ? (
          'href' in download ? (
            <IconButton icon={Download} label={download.label} href={download.href} />
          ) : (
            <>
              <IconButton icon={download.busy ? Spinner : Download} label={download.label} onClick={download.onClick} />
              <BusyStatus busy={!!download.busy}>{download.busy ?? ''}</BusyStatus>
            </>
          )
        ) : null}
        {remove ? (
          <IconButton icon={Trash2} variant="ghost-destructive" label={remove.label ?? `Delete ${subject}`} onClick={remove.onClick} />
        ) : null}
        {menu ? (
          <RowActionsMenu label={`More actions for ${subject}`} busy={!!menuBusy} busyLabel={menuBusy}>
            {menu}
          </RowActionsMenu>
        ) : null}
      </span>
    </TableCell>
  )
}

function Action({ action, icon, label }: { action: RowAction; icon: typeof Eye; label: string }) {
  return 'to' in action ? (
    <IconLink to={action.to} search={action.search} icon={icon} label={label} />
  ) : (
    <IconButton icon={icon} label={label} onClick={action.onClick} />
  )
}

/** The heading over the action row: no visible words, a name for screen readers. */
export function RowActionsHead() {
  return (
    <TableHead kind="actions">
      <span className="sr-only">Actions</span>
    </TableHead>
  )
}
