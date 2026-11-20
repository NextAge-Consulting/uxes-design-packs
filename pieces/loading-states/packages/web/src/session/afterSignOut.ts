import type { QueryClient } from '@tanstack/react-query'
import { forgetBrowseReturns } from '../browse/browseReturn'

/**
 * Ends, in the browser, what belonged to the sign-in that just signed out: the data it
 * loaded and the places its browses remember.
 */
export function afterSignOut(queryClient: QueryClient): void {
  queryClient.clear()
  forgetBrowseReturns()
}
