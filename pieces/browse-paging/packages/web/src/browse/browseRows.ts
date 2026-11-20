// ui-behaviour-code: browse-paging.md
import { z } from 'zod'
import { type FilterField, filterSchema } from './advancedFilter'
import type { BrowseSort } from './browseSettings'

/**
 * What a list's two server functions accept: its search, its advanced filter and its
 * sort, and for the rows a block — at most 100 rows from an offset. The sort names only a
 * column the list can sort by, and the filter only the list's own fields.
 */
export function browseRowsInput(fields: readonly FilterField[], sortable: readonly [string, ...string[]]) {
  return browseCountInput(fields).extend({
    sort: z.object({ id: z.enum(sortable), desc: z.boolean() }),
    offset: z.number().int().min(0),
    limit: z.number().int().min(1).max(100),
  })
}

export function browseCountInput(fields: readonly FilterField[]) {
  return z.object({
    search: z.string().trim().max(200).optional(),
    filter: filterSchema(fields),
  })
}

const collator = new Intl.Collator('en', { sensitivity: 'base', numeric: true })

/**
 * The block of a small list a server already holds whole: sorted by the column's real
 * value, an empty value last whichever way, ties broken by the row's key so pages never
 * shift. A list over a big table pages in SQL instead.
 */
export function blockInMemory<T>(
  rows: readonly T[],
  request: { sort: BrowseSort; offset: number; limit: number },
  sortValue: (row: T, id: string) => string | number | null,
  key: (row: T) => string | number,
): T[] {
  const dir = request.sort.desc ? -1 : 1
  const compare = (a: T, b: T) => {
    const x = sortValue(a, request.sort.id)
    const y = sortValue(b, request.sort.id)
    const xEmpty = x === null || x === ''
    const yEmpty = y === null || y === ''
    if (xEmpty !== yEmpty) return xEmpty ? 1 : -1
    if (!xEmpty && !yEmpty) {
      const order = typeof x === 'number' && typeof y === 'number' ? x - y : collator.compare(String(x), String(y))
      if (order !== 0) return dir * order
    }
    const kx = key(a)
    const ky = key(b)
    return typeof kx === 'number' && typeof ky === 'number' ? kx - ky : collator.compare(String(kx), String(ky))
  }
  return [...rows].sort(compare).slice(request.offset, request.offset + request.limit)
}
