// ui-status: approved
// ui-block: FormActions
// ui-behaviour: loading-states.md, saving.md
import type { ReactNode } from 'react'
import { BusySlot, BusyStatus } from '@design-pack/ui/components/busy-status'
import { Alert, AlertDescription } from '@design-pack/ui/components/ui/alert'
import { Button } from '@design-pack/ui/components/ui/button'

/**
 * The submit control for every form, with the project's save rules built in
 * rather than restated per screen.
 *
 * Pattern and sources: `.claude/skills/ui-patterns/references/saving.md`.
 *
 * ## Left-aligned, primary first
 *
 * `Save` then `Close`, aligned to the form's left edge. GOV.UK aligns the
 * primary to the left edge of the form; Norway's Designsystemet gives the reason
 * that decides it — left placement is easier to find for users with reduced
 * visual fields or screen magnification, and a right-aligned group forces them
 * to read past the lesser options to reach the primary. Primer agrees.
 *
 * **Dialogs invert this** (right-aligned, `Cancel` first) and that convention
 * must not be carried onto a page — doing so is what produced `Close` at the far
 * left and `Save` pushed to the far right, which is negative-path-first AND
 * primary-last.
 *
 * ## It is always a submit, inside a real form
 *
 * Every editable surface in this app is a TanStack Form inside a `<form>`, so
 * this is unconditionally `type="submit"` and takes no "how does the save fire"
 * flag. A screen that would need one is a screen that has drifted off the app's
 * form library — fix that, not this component.
 *
 * ## Three rules a hand-written button has already got wrong here
 *
 * - **Disabled means "nothing to do", never "working."** A disabled control
 *   leaves the accessibility tree, so disabling on submit drops focus mid-save.
 *   Working is a spinner in the reserved icon slot plus a `BusyStatus` live
 *   region — never `aria-busy`, which reads inconsistently and can silence the
 *   button's own contents. The control stays clickable, so a second click is
 *   refused in the handler. The LABEL does not change: swapping it resizes the
 *   button mid-click and rewrites its accessible name.
 * - **An edit form gates on the VALUE COMPARISON, not just validity.**
 *   `canSubmit` says the values are valid, which is true the moment the form
 *   loads. And the gate must be `!isDefaultValue`, never TanStack Form's
 *   `isDirty` — that flag is PERSISTENT, so a field edited and then put back
 *   leaves the form "dirty" forever and this control claims unsaved changes that
 *   do not exist.
 * - **The state is stated in words** beside the control: unsaved / saving /
 *   saved. `mode="action"` drops the dirty gate and the unsaved-changes line for
 *   a panel that performs something rather than editing a record (send a test,
 *   change a password) — there, "unsaved changes" is meaningless.
 *
 * ## `Close`, never `Cancel`
 *
 * `Close` navigates and writes nothing. `Cancel` must always mean *discard*, so
 * labelling it Cancel owes the user a discard — incoherent on a form that has
 * already saved once this session. Unsaved work is protected by the navigation
 * guard, not by this label.
 */
export function FormActions({
  label,
  busyLabel,
  canSubmit,
  isSubmitting,
  isDirty,
  succeeded,
  mode = 'edit',
  variant = 'default',
  onClose,
  closeLabel = 'Close',
  secondary,
  failure,
}: {
  label: string
  /** Spoken to a screen reader while submitting. Never shown on the button. */
  busyLabel: string
  canSubmit: boolean
  isSubmitting: boolean
  isDirty: boolean
  succeeded: boolean
  /** `edit` gates on dirty and reports unsaved changes; `action` does neither. */
  mode?: 'edit' | 'action'
  variant?: React.ComponentProps<typeof Button>['variant']
  /**
   * Navigate away. Resolve this to the parent route STATICALLY — never
   * `history.back()`, which does the wrong thing for a bookmarked record.
   */
  onClose?: () => void
  closeLabel?: string
  /** Further object actions, placed after Close. */
  secondary?: ReactNode
  /** Why the last save or action failed, in words for the person — shown in place of the
   *  state line. */
  failure?: string | null
}) {
  const gated = mode === 'edit' ? !isDirty || !canSubmit : !canSubmit

  return (
    <div className="flex flex-col gap-related">
      {failure && !isSubmitting ? (
        <Alert variant="destructive">
          <AlertDescription>{failure}</AlertDescription>
        </Alert>
      ) : null}
      <div className="flex flex-wrap items-center gap-related">
      <Button type="submit" variant={variant} disabled={gated}>
        {/* The icon slot is always present so the button never changes width
            when the spinner appears. */}
        <BusySlot busy={isSubmitting} />
        {label}
      </Button>
      <BusyStatus busy={isSubmitting}>{busyLabel}</BusyStatus>

      {onClose ? (
        <Button type="button" variant="outline" onClick={onClose}>
          {closeLabel}
        </Button>
      ) : null}

      {secondary}

      <p className="type-body text-muted-foreground" aria-live="polite">
        {isSubmitting
          ? null
          : mode === 'edit' && isDirty
            ? 'You have unsaved changes.'
            : succeeded
              ? 'Saved.'
              : null}
      </p>
      </div>
    </div>
  )
}
