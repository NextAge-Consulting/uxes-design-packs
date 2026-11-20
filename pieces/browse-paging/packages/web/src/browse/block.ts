// ui-behaviour-code: browse-paging.md
/**
 * What a browse FETCHES is not what it shows. The request is keyed on a block of rows
 * and the page is a slice of it, so a refit, a change of page size inside the block and
 * most page changes are a slice of rows already in hand rather than another request.
 */
export const BLOCK_SIZE = 100

export interface BrowseBlock {
  /** Rows to skip on the server. */
  offset: number
  /** Rows to return. */
  limit: number
  /** Where the page starts inside the returned block. */
  sliceFrom: number
}

export function browseBlock(page: number, pageSize: number): BrowseBlock {
  const size = Math.max(1, Math.trunc(pageSize) || 1)
  const offset = (Math.max(1, Math.trunc(page) || 1) - 1) * size
  // A page as big as a block is its own block: there is nothing to share.
  if (size >= BLOCK_SIZE) return { offset, limit: size, sliceFrom: 0 }
  const alignedStart = Math.floor(offset / BLOCK_SIZE) * BLOCK_SIZE
  const sliceFrom = offset - alignedStart
  // A page that would straddle two blocks becomes its own block, starting where it
  // starts, rather than two requests.
  return sliceFrom + size <= BLOCK_SIZE
    ? { offset: alignedStart, limit: BLOCK_SIZE, sliceFrom }
    : { offset, limit: BLOCK_SIZE, sliceFrom: 0 }
}
