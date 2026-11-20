// ui-status: approved
// ui-block: ErrorState
import type { ErrorComponentProps } from '@tanstack/react-router'
import { Alert, AlertDescription } from '@design-pack/ui/components/ui/alert'
import { failureMessage } from '../serverFn/userFacingError'

/**
 * A failure shown in place of what could not be loaded — a region of a screen, or with
 * `fill="screen"` the whole screen, in the page's gutter. A refusal written for a
 * person (`UserFacingError`) is shown in its own words; anything else as the caller's
 * general sentence, which names what failed and what it costs — the detail is in the
 * server log already (constitution §X).
 */
export function ErrorState({
  error,
  general,
  fill = 'region',
}: {
  /** What failed, if anything was thrown — or nothing, when the caller knows only that it failed. */
  error?: unknown
  general: string
  fill?: 'region' | 'screen'
}) {
  const alert = (
    <Alert variant="destructive">
      <AlertDescription>{failureMessage(error, general)}</AlertDescription>
    </Alert>
  )
  return fill === 'screen' ? <div className="p-page-edge">{alert}</div> : alert
}

/** Every app router's `defaultErrorComponent`: a screen that could not be loaded. */
export function ScreenError({ error }: ErrorComponentProps) {
  return <ErrorState fill="screen" error={error} general="This screen couldn't be shown. Reload the page to try again." />
}
