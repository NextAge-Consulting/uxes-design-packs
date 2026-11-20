// ui-behaviour-code: browse-paging.md, loading-states.md
import { keepPreviousData, queryOptions, useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { browseBlock } from './block'
import type { BrowseSort } from './browseSettings'

/** What a list's rows are read by: its search, its advanced filter and its sort. */
export interface BrowseRequest<F> {
  search: string | undefined
  filter: F
  sort: BrowseSort
}

/** A list's two reads: a block of rows, and how many rows match. */
export interface BrowseSource<T, F> {
  /** The list's query-key root — unique to the list. */
  key: readonly unknown[]
  rows: (input: BrowseRequest<F> & { offset: number; limit: number }) => Promise<T[]>
  count: (input: { search: string | undefined; filter: F }) => Promise<number>
}

function browseRowsOptions<T, F>(source: BrowseSource<T, F>, request: BrowseRequest<F>, page: number, size: number) {
  const { offset, limit } = browseBlock(page, size)
  return queryOptions({
    queryKey: [...source.key, 'rows', request.search ?? '', request.filter, request.sort, offset, limit],
    queryFn: () => source.rows({ ...request, offset, limit }),
  })
}

function browseCountOptions<T, F>(source: BrowseSource<T, F>, request: Pick<BrowseRequest<F>, 'search' | 'filter'>) {
  return queryOptions({
    queryKey: [...source.key, 'count', request.search ?? '', request.filter],
    queryFn: () => source.count({ search: request.search, filter: request.filter }),
  })
}

/**
 * The page of a list on screen, cut from the block of rows it falls in, and the list's
 * total, counted once per search and filter. Paging and sorting keep the last page on
 * screen while the next arrives; a new search or filter does not, so a new total is
 * never shown over rows of the old filter.
 */
export function useBrowseData<T, F>(source: BrowseSource<T, F>, request: BrowseRequest<F>, page: number, size: number) {
  const rowsQuery = useQuery({ ...browseRowsOptions(source, request, page, size), placeholderData: keepPreviousData })
  const countQuery = useQuery(browseCountOptions(source, request))

  const filtersKey = JSON.stringify([request.search ?? '', request.filter])
  const { sliceFrom } = browseBlock(page, size)
  const block = rowsQuery.isPlaceholderData ? undefined : rowsQuery.data
  const fresh = useMemo(() => block?.slice(sliceFrom, sliceFrom + size), [block, sliceFrom, size])
  const [last, setLast] = useState<{ rows: T[]; filtersKey: string } | undefined>(undefined)
  if (fresh !== undefined && (fresh !== last?.rows || filtersKey !== last.filtersKey)) setLast({ rows: fresh, filtersKey })
  const rows = fresh ?? (last?.filtersKey === filtersKey ? last.rows : undefined)

  return {
    rows,
    /** Null until the count arrives. */
    total: countQuery.data ?? null,
    /** A page, a sort or a filter is on its way. */
    loading: rowsQuery.isFetching || countQuery.isFetching,
    failure: rowsQuery.isError
      ? { error: rowsQuery.error, onRetry: () => void rowsQuery.refetch() }
      : countQuery.isError
        ? { error: countQuery.error, onRetry: () => void countQuery.refetch() }
        : null,
  }
}
