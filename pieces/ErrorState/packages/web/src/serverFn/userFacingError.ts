import { createSerializationAdapter } from '@tanstack/react-router'
import { UserFacingError } from '@design-pack/shared/errors/userFacingError'

/**
 * Client-safe: the server throws a `UserFacingError`, the screen checks for it.
 *
 * Start rebuilds every thrown error as a plain `Error`, so the subclass survives
 * the wire only through this adapter, registered in `src/start.ts`
 * (mfing-bible-of-tanstack/references/server-functions.md).
 */
export { UserFacingError }

export const userFacingErrorAdapter = createSerializationAdapter({
  key: 'user-facing-error',
  test: (v): v is UserFacingError => v instanceof UserFacingError,
  toSerializable: (e) => e.message,
  fromSerializable: (message) => new UserFacingError(message),
})

/**
 * What a screen shows for a failed server call.
 *
 * The server's own message only when it was written for a person; otherwise the
 * caller's general sentence, naming the system and the impact. Any other
 * message can carry a driver error, a column or a hostname, and the detail is
 * already in the server log `logFailures` wrote.
 */
export function failureMessage(error: unknown, general: string): string {
  return error instanceof UserFacingError ? error.message : general
}
