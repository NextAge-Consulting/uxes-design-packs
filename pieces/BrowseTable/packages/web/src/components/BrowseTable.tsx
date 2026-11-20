// design-accepted — a list inside a record takes its own shape (child-list.md)
// ui-status: approved
// ui-block: DataTable
// ui-behaviour: browse-columns.md, sortable-columns.md, loading-states.md
import {
  type RowData,
  columnOrderingFeature,
  columnResizingFeature,
  columnSizingFeature,
  columnVisibilityFeature,
  createColumnHelper,
  tableFeatures,
  useTable,
} from '@tanstack/react-table'
import { ErrorState } from '@design-pack/web/components/ErrorState'
import { SortHead } from '@design-pack/ui/components/sort-head'
import { TableFrame } from '@design-pack/ui/components/table-frame'
import { Skeleton } from '@design-pack/ui/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@design-pack/ui/components/ui/table'
import { Button } from '@design-pack/ui/components/ui/button'
import { Fragment, type KeyboardEvent, type MouseEvent, type ReactNode, type TouchEvent, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { ChevronRight } from 'lucide-react'
import { IconButton } from '@design-pack/ui/components/icon-button'
import { cn } from '@design-pack/ui/lib/utils'
import { type BrowseSort, MAX_COLUMN_WIDTH, MIN_COLUMN_WIDTH } from '../browse/browseSettings'
import type { BrowseSettingsState } from '../browse/useBrowseSettings'
import { ColumnSettings } from './ColumnSettings'

type CellKind = 'text' | 'title' | 'key' | 'code' | 'number' | 'amount' | 'note'

export interface BrowseColumn<T> {
  /** The column's id: its sort key and its key in a person's saved layout. Stable. */
  id: string
  label: string
  /** Its width until the person drags it, in px. */
  width?: number
  /** Sorted by the server on this column's real value. */
  sortable?: boolean
  /** Its first sort is newest or highest first — a "last run" date. */
  descendingFirst?: boolean
  kind?: CellKind
  /** Supporting text rather than the row's main fact. */
  secondary?: boolean
  cell: (row: T) => ReactNode
}

const features = tableFeatures({ columnVisibilityFeature, columnOrderingFeature, columnSizingFeature, columnResizingFeature })
const DEFAULT_WIDTH = 160
/** One empty list for every table with no automatic columns, so the memos below hold. */
const NONE: never[] = []
/**
 * The actions column — the column-settings button and each row's actions — stays at the
 * table's right edge while a wide table scrolls under it, so neither the button nor its
 * pop-up moves when a column is shown. Opaque, in the header's and the row's own colours.
 */
const STICK_END = [
  '[&_tr>*:last-child]:sticky [&_tr>*:last-child]:right-0',
  '[&_thead_tr>*:last-child]:bg-muted',
  '[&_tbody_tr>*:last-child]:bg-card', // design-accepted — the approved look, reviewed in the running app
  '[&_tbody_tr:hover>*:last-child]:bg-linear-to-r [&_tbody_tr:hover>*:last-child]:from-muted/50 [&_tbody_tr:hover>*:last-child]:to-muted/50',
].join(' ')

/** The column-settings button and its cell's padding: the actions column is never narrower. */
const ACTIONS_MIN_WIDTH = 48
/** The leading toggle column of a table whose rows open in place. */
const TOGGLE_WIDTH = 44
const KEY_STEP = 10

/**
 * A list as a table — the collection a browse shows. The person sorts by a heading,
 * drags a heading's right edge (or focuses it and presses ← →) to size a column, and
 * shows, hides and orders the columns from the button at the header's right end; the
 * layout is theirs, saved for this list. ↑ and ↓ move between rows, Enter opens one, and
 * the row last opened is where focus lands on the way back. A failure to load is its own
 * state with Try Again, never an empty list.
 */
export function BrowseTable<T extends RowData>({
  columns,
  automatic = NONE,
  rows,
  getRowId,
  sort,
  onSort,
  layout,
  onOpen,
  actions,
  empty,
  failure,
  returnTo,
  expand,
  inCard = false,
}: {
  columns: BrowseColumn<T>[]
  /**
   * Columns the list shows on its own, ahead of the person's — the owner across many
   * owners. They are not in the person's settings and keep their width.
   */
  automatic?: BrowseColumn<T>[]
  /** The page to show; undefined until the first rows arrive, when placeholders show. */
  rows: T[] | undefined
  getRowId: (row: T) => string
  sort: BrowseSort
  onSort: (next: BrowseSort) => void
  layout: BrowseSettingsState
  /** Opening a row's record — a click on the row, or Enter on it. */
  onOpen?: (row: T) => void
  /** A row's actions cell (`RowActions`). */
  actions?: (row: T) => ReactNode
  empty: string
  /** The rows could not be read: what was thrown, the sentence that says what failed, and how to ask again. */
  failure?: { error: unknown; general: string; onRetry: () => void } | null
  /** The row to bring focus back to, opened before the person left the list. */
  returnTo?: string | null
  /**
   * Rows that open in place: a chevron leading each row shows `detail` in a full-width
   * row beneath it, as `ExpandableRow` does; `label` names what opening shows. With no
   * `onOpen`, Enter on a row opens it too.
   */
  expand?: { label: string; detail: (row: T) => ReactNode }
  /** A child list in a card's rows slot (`ChildList`): the card is the surface, so the table draws no frame of its own. */
  inCard?: boolean
}) {
  const all = useMemo(() => [...automatic, ...columns], [automatic, columns])
  const byId = useMemo(() => new Map(all.map((c) => [c.id, c])), [all])
  const automaticIds = useMemo(() => new Set(automatic.map((c) => c.id)), [automatic])
  const columnDefs = useMemo(() => {
    const helper = createColumnHelper<typeof features, T>()
    return all.map((c) =>
      helper.display({ id: c.id, header: c.label, size: c.width ?? DEFAULT_WIDTH, minSize: MIN_COLUMN_WIDTH, maxSize: MAX_COLUMN_WIDTH }),
    )
  }, [all])
  const columnOrder = useMemo(() => [...automatic.map((c) => c.id), ...layout.settings.order], [automatic, layout.settings.order])

  // The live widths: seeded from the saved ones, and again whenever they change (a reset).
  const savedWidths = JSON.stringify(layout.settings.widths)
  const [sizing, setSizing] = useState<Record<string, number>>(() => JSON.parse(savedWidths))
  const [seenWidths, setSeenWidths] = useState(savedWidths)
  if (seenWidths !== savedWidths) {
    setSeenWidths(savedWidths)
    setSizing(JSON.parse(savedWidths))
  }

  const visibility = useMemo(
    () => Object.fromEntries(columnOrder.map((id) => [id, automaticIds.has(id) || !layout.settings.hidden.includes(id)])),
    [columnOrder, automaticIds, layout.settings.hidden],
  )
  const data = useMemo(() => rows ?? [], [rows])
  const table = useTable({
    features,
    columns: columnDefs,
    data,
    getRowId,
    state: { columnOrder, columnVisibility: visibility, columnSizing: sizing },
    onColumnSizingChange: setSizing,
    columnResizeMode: 'onChange',
  })

  const visible = table.getVisibleLeafColumns()
  const lastId = visible.at(-1)?.id
  const pageRows = table.getRowModel().rows

  const startResize =
    (header: { column: { id: string; getSize: () => number }; getResizeHandler: () => (e: unknown) => void }) =>
    (e: MouseEvent | TouchEvent) => {
      if (e.type === 'mousedown') e.preventDefault()
      header.getResizeHandler()(e)
      const end = () => {
        document.removeEventListener('mouseup', end)
        document.removeEventListener('touchend', end)
        layout.resize(header.column.id, header.column.getSize())
      }
      document.addEventListener('mouseup', end)
      document.addEventListener('touchend', end)
    }

  // Focus comes back to the row the person opened, once it is on the page.
  const bodyRef = useRef<HTMLTableSectionElement>(null)
  const [returned, setReturned] = useState(false)
  useEffect(() => {
    if (returned || !returnTo || !rows) return
    const row = bodyRef.current?.querySelector<HTMLElement>(`[data-row-id="${CSS.escape(returnTo)}"]`)
    if (row) {
      row.focus()
      row.scrollIntoView({ block: 'nearest' })
    }
    setReturned(true)
  }, [returnTo, rows, returned])

  const [opened, setOpened] = useState<ReadonlySet<string>>(() => new Set())
  const toggle = (id: string) =>
    setOpened((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const moveFocus = (event: KeyboardEvent<HTMLTableRowElement>, row: T, id: string) => {
    const here = event.currentTarget
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      // The next record's row, past any detail row opened beneath one.
      let next = (event.key === 'ArrowDown' ? here.nextElementSibling : here.previousElementSibling) as HTMLElement | null
      while (next && !next.hasAttribute('data-row-id')) {
        next = (event.key === 'ArrowDown' ? next.nextElementSibling : next.previousElementSibling) as HTMLElement | null
      }
      next?.focus()
    } else if ((event.key === 'Enter' || event.key === ' ') && event.target === here && (onOpen || expand)) {
      event.preventDefault()
      if (onOpen) onOpen(row)
      else toggle(id)
    }
  }

  // A fixed layout gives an unsized column a share of the table, never its content's
  // width, so the actions column is sized to the widest set of controls it holds.
  const tableRef = useRef<HTMLTableElement>(null)
  const [actionsWidth, setActionsWidth] = useState(ACTIONS_MIN_WIDTH)
  // biome-ignore lint/correctness/useExhaustiveDependencies: the controls are measured again whenever the rows on the page change
  useLayoutEffect(() => {
    const cells = tableRef.current?.querySelectorAll<HTMLElement>('tr:not([data-slot=expandable-row-detail]) > :last-child') ?? []
    let widest = ACTIONS_MIN_WIDTH
    for (const cell of cells) {
      // The span of the controls themselves, so the cell's own width never feeds back in.
      const controls = [...cell.querySelectorAll('button, a')].map((c) => c.getBoundingClientRect())
      if (controls.length === 0) continue
      const span = Math.max(...controls.map((r) => r.right)) - Math.min(...controls.map((r) => r.left))
      const style = getComputedStyle(cell)
      widest = Math.max(widest, Math.ceil(span + Number.parseFloat(style.paddingLeft) + Number.parseFloat(style.paddingRight)))
    }
    setActionsWidth(widest)
  }, [pageRows])

  const span = visible.length + 1 + (expand ? 1 : 0)
  const minWidth = visible.reduce((sum, c) => sum + (c.id === lastId ? MIN_COLUMN_WIDTH : c.getSize()), 0) + actionsWidth

  const Surface = inCard ? Fragment : TableFrame
  return (
    <Surface>
      <Table ref={tableRef} style={{ tableLayout: 'fixed', minWidth: minWidth + (expand ? TOGGLE_WIDTH : 0) }} className={STICK_END}>
        <TableHeader>
          <TableRow>
            {expand ? (
              <TableHead style={{ width: TOGGLE_WIDTH }}>
                <span className="sr-only">Open or close</span>
              </TableHead>
            ) : null}
            {table.getHeaderGroups()[0]?.headers.map((header) => {
              const column = byId.get(header.column.id)
              if (!column) return null
              const isLast = header.column.id === lastId
              const style = isLast ? undefined : { width: header.column.getSize() }
              const resize = isLast || automaticIds.has(column.id)
                ? null
                : {
                    label: column.label,
                    width: header.column.getSize(),
                    onStart: startResize(header),
                    onStep: (step: number) => layout.resize(column.id, header.column.getSize() + step),
                  }
              const direction = sort.id === column.id ? (sort.desc ? 'descending' : 'ascending') : null
              return column.sortable ? (
                <SortHead
                  key={header.id}
                  label={column.label}
                  direction={direction}
                  onSort={() => onSort({ id: column.id, desc: sort.id === column.id ? !sort.desc : !!column.descendingFirst })}
                  className="relative"
                  style={style}
                  kind={column.kind === 'amount' ? 'amount' : 'column'}
                >
                  {resize ? <ResizeHandle {...resize} /> : null}
                </SortHead>
              ) : (
                <TableHead key={header.id} className="relative" style={style} kind={column.kind === 'amount' ? 'amount' : 'column'}>
                  {column.label}
                  {resize ? <ResizeHandle {...resize} /> : null}
                </TableHead>
              )
            })}
            <TableHead kind="actions" style={{ width: actionsWidth }}>
              {/* At the cell's end, over the row's last control. */}
              <div className="flex justify-end">
              <ColumnSettings
                columns={layout.settings.order.flatMap((id) => {
                  const c = byId.get(id)
                  return c ? [{ id, label: c.label, shown: !layout.settings.hidden.includes(id) }] : []
                })}
                onToggle={layout.toggle}
                onReorder={layout.reorder}
                onReset={layout.reset}
              />
              </div>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody ref={bodyRef}>
          {failure ? (
            <TableRow data-browse-empty>
              <TableCell colSpan={span} kind="empty">
                <div className="flex flex-col items-center gap-2">
                  <ErrorState error={failure.error} general={failure.general} />
                  <Button variant="outline" onClick={failure.onRetry}>
                    Try Again
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ) : rows === undefined ? (
            Array.from({ length: 8 }, (_, i) => i).map((i) => (
              <TableRow key={i} aria-hidden>
                <TableCell colSpan={span}>
                  <Skeleton shape="row" className="w-full" />
                </TableCell>
              </TableRow>
            ))
          ) : pageRows.length === 0 ? (
            <TableRow data-browse-empty>
              <TableCell colSpan={span} kind="empty">
                {empty}
              </TableCell>
            </TableRow>
          ) : (
            pageRows.map((row) => {
              const open = opened.has(row.id)
              return (
              <Fragment key={row.id}>
              <TableRow
                data-row-id={row.id}
                tabIndex={0}
                interactive={onOpen !== undefined}
                role={onOpen ? 'link' : undefined}
                onClick={onOpen ? () => onOpen(row.original) : undefined}
                onKeyDown={(e) => moveFocus(e, row.original, row.id)}
              >
                {expand ? (
                  // The same toggle `ExpandableRow` draws; its clicks stay its own.
                  <TableCell onClick={(event) => event.stopPropagation()}>
                    <IconButton
                      label={`${open ? 'Hide' : 'Show'} ${expand.label}`}
                      icon={<ChevronRight aria-hidden className={cn('transition-transform', open && 'rotate-90')} />}
                      variant="quiet"
                      size="icon-affix"
                      aria-expanded={open}
                      onClick={() => toggle(row.id)}
                    />
                  </TableCell>
                ) : null}
                {visible.map((column) => {
                  const c = byId.get(column.id)
                  if (!c) return null
                  return (
                    <TableCell key={column.id} kind={c.kind ?? 'text'} tone={c.secondary ? 'secondary' : 'primary'} className="overflow-hidden text-ellipsis">
                      {c.cell(row.original)}
                    </TableCell>
                  )
                })}
                {actions ? actions(row.original) : <TableCell kind="actions" />}
              </TableRow>
              {expand && open ? (
                <TableRow data-slot="expandable-row-detail">
                  <TableCell colSpan={span} kind="detail">
                    <div className="p-4">{expand.detail(row.original)}</div>
                  </TableCell>
                </TableRow>
              ) : null}
              </Fragment>
              )
            })
          )}
        </TableBody>
      </Table>
      {layout.problem ? <p className="px-2 py-1 type-body text-feedback-danger">{layout.problem}</p> : null}
    </Surface>
  )
}

/** A column's right edge: drag it, or focus it and press ← →, to size the column. */
function ResizeHandle({
  label,
  width,
  onStart,
  onStep,
}: {
  label: string
  width: number
  onStart: (e: MouseEvent | TouchEvent) => void
  onStep: (step: number) => void
}) {
  return (
    // biome-ignore lint/a11y/useSemanticElements: a focusable column splitter is the ARIA separator role; <hr> is neither focusable nor adjustable
    <div
      role="separator"
      aria-orientation="vertical"
      aria-label={`Resize ${label}`}
      aria-valuenow={width}
      aria-valuemin={MIN_COLUMN_WIDTH}
      aria-valuemax={MAX_COLUMN_WIDTH}
      tabIndex={0}
      onMouseDown={onStart}
      onTouchStart={onStart}
      onKeyDown={(e) => {
        if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return
        e.preventDefault()
        onStep(e.key === 'ArrowRight' ? KEY_STEP : -KEY_STEP)
      }}
      className="absolute top-0 right-0 h-full w-2 cursor-col-resize touch-none select-none hover:bg-ring/40 focus-visible:bg-ring focus-visible:outline-none" // design-accepted — the approved look, reviewed in the running app
    />
  )
}
