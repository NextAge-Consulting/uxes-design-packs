// ui-behaviour-code: child-list.md
import { useCallback, useEffect, useState } from 'react'
import type { BrowsePagerProps } from './useBrowsePaging'

/** The sizes a child list pages by; the first is where it starts. */
const CHILD_PAGE_SIZES = [10, 25, 50, 100] as const

/**
 * A child list's page size: 10 to start, or the size the person last chose for this
 * list, kept in the browser (`child-list.md`). Read after mount — the browser's storage
 * does not exist while the server renders.
 */
export function useChildPageSize(storageKey: string): { size: number; choose: (size: number) => void } {
  const key = `${storageKey}.size`
  const [size, setSize] = useState<number>(CHILD_PAGE_SIZES[0])
  useEffect(() => {
    const stored = Number(window.localStorage.getItem(key))
    if ((CHILD_PAGE_SIZES as readonly number[]).includes(stored)) setSize(stored)
  }, [key])
  const choose = useCallback(
    (next: number) => {
      setSize(next)
      window.localStorage.setItem(key, String(next))
    },
    [key],
  )
  return { size, choose }
}

/**
 * A child list's pager, or null while every row fits on the smallest page — there is
 * then nothing to page and no size worth choosing.
 */
export function childPager({
  rowsOnPage,
  total,
  size,
  page,
  noun,
  onChooseSize,
  onGoToPage,
}: {
  rowsOnPage: number
  /** Null until the count arrives. */
  total: number | null
  size: number
  page: number
  noun: string
  /** Returns to page one: page 3 of 10 rows is not page 3 of 50. */
  onChooseSize: (size: number) => void
  onGoToPage: (page: number) => void
}): BrowsePagerProps | null {
  if (total === null || total <= CHILD_PAGE_SIZES[0]) return null
  return {
    page,
    pageCount: Math.max(1, Math.ceil(total / size)),
    pageSize: size,
    rowsOnPage,
    total,
    noun,
    preference: size,
    sizes: CHILD_PAGE_SIZES,
    onPageSizeChange: (choice) => onChooseSize(Number(choice)),
    onGoToPage,
  }
}
