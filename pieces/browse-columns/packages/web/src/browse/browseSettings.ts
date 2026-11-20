// ui-behaviour-code: browse-columns.md
import { z } from 'zod'

/**
 * What a browse remembers for a person, per list, on the server: the columns' order,
 * which are hidden, the widths they dragged, and the sort they last chose. Filters and
 * the page are never remembered — arriving at a list shows the whole list.
 */
export interface BrowseSettings {
  /** Column ids in display order. */
  order: string[]
  /** Ids hidden. Absent means shown. */
  hidden: string[]
  /** Widths the person dragged, by column id. A column absent here is at its default. */
  widths: Record<string, number>
  sort: BrowseSort
}

export interface BrowseSort {
  id: string
  desc: boolean
}

/** What one list declares about its columns, so a saved layout can be checked against it. */
export interface BrowseDefaults {
  /** Every column id the person may arrange, in default order. */
  columns: readonly string[]
  /** Columns hidden until the person shows them. */
  hidden: readonly string[]
  sort: BrowseSort
  /** Columns the list can sort by. */
  sortable: readonly string[]
}

/** Narrower and a heading cannot be read; the floor of every dragged column. */
export const MIN_COLUMN_WIDTH = 60
/** Wider than any screen; it stops a stray drag or a damaged saved layout. */
export const MAX_COLUMN_WIDTH = 1000

/** What a server function accepts when a person's layout is saved. */
export const browseSettingsSchema = z.object({
  order: z.array(z.string().max(64)).max(100),
  hidden: z.array(z.string().max(64)).max(100),
  widths: z.record(z.string().max(64), z.number()),
  sort: z.object({ id: z.string().max(64), desc: z.boolean() }),
})

/** A list's key: names its saved layout, one per list per person. */
export const browseKeySchema = z.string().regex(/^[a-z0-9][a-z0-9.-]{0,63}$/)

export function defaultBrowseSettings(defaults: BrowseDefaults): BrowseSettings {
  return { order: [...defaults.columns], hidden: [...defaults.hidden], widths: {}, sort: { ...defaults.sort } }
}

/**
 * A saved layout applied to the list as it is today. A column removed since drops out; a
 * column added since appears at the end; a sort on a column that no longer sorts falls
 * back to the list's default; anything unreadable is the defaults.
 */
export function resolveBrowseSettings(saved: unknown, defaults: BrowseDefaults): BrowseSettings {
  const base = defaultBrowseSettings(defaults)
  if (!saved || typeof saved !== 'object') return base
  const blob = saved as Partial<Record<keyof BrowseSettings, unknown>>
  const known = new Set(defaults.columns)
  const sortable = new Set(defaults.sortable)

  const order = Array.isArray(blob.order) ? blob.order.filter((id): id is string => typeof id === 'string' && known.has(id)) : []
  for (const id of defaults.columns) if (!order.includes(id)) order.push(id)

  const hidden = Array.isArray(blob.hidden)
    ? blob.hidden.filter((id): id is string => typeof id === 'string' && known.has(id))
    : base.hidden

  const widths: Record<string, number> = {}
  if (blob.widths && typeof blob.widths === 'object' && !Array.isArray(blob.widths)) {
    for (const [id, value] of Object.entries(blob.widths)) {
      const width = Number(value)
      if (known.has(id) && Number.isFinite(width)) widths[id] = clampWidth(width)
    }
  }

  const sortBlob = blob.sort as { id?: unknown; desc?: unknown } | undefined
  const sort =
    sortBlob && typeof sortBlob.id === 'string' && sortable.has(sortBlob.id)
      ? { id: sortBlob.id, desc: Boolean(sortBlob.desc) }
      : base.sort

  return { order, hidden, widths, sort }
}

export function clampWidth(width: number): number {
  return Math.round(Math.min(MAX_COLUMN_WIDTH, Math.max(MIN_COLUMN_WIDTH, width)))
}

/** Shows or hides a column where it stands: a column moves only when the person moves it. */
export function toggleColumn(settings: BrowseSettings, id: string): BrowseSettings {
  const hidden = settings.hidden.includes(id) ? settings.hidden.filter((h) => h !== id) : [...settings.hidden, id]
  return { ...settings, hidden }
}
