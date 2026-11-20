// ui-status: approved
// ui-atom
// ui-behaviour: boolean-fields.md, loading-states.md
import { type ReactNode, useId } from "react"

import { BusySlot, BusyStatus } from "@design-pack/ui/components/busy-status"
import { Switch } from "@design-pack/ui/components/ui/switch"
import { cn } from "@design-pack/ui/lib/utils"

/**
 * A choice between two named options, both always on screen: the off option's
 * name, the switch, the on option's name. The current option reads strong and the
 * other muted; clicking a name chooses it. `offHint` and `onHint` say something
 * about the current option under the switch, for a fact its name cannot carry.
 *
 * Where choosing writes at once, with no Save, pass `busyLabel` and set `busy` while
 * the write is in flight: a spinner shows after the names in a slot that is always
 * there, the choice holds still, and the label is announced.
 */
export function OptionSwitch({
  id,
  checked,
  onCheckedChange,
  offLabel,
  onLabel,
  offHint,
  onHint,
  disabled,
  busy = false,
  busyLabel,
}: {
  id?: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  offLabel: string
  onLabel: string
  offHint?: ReactNode
  onHint?: ReactNode
  disabled?: boolean
  busy?: boolean
  /** What a screen reader hears while it is busy — "Changing notifications". Given only where the choice writes at once. */
  busyLabel?: string
}) {
  const generated = useId()
  const switchId = id ?? generated
  const onId = `${switchId}-on`
  const hintId = `${switchId}-hint`
  const hint = checked ? onHint : offHint
  const choose = (value: boolean) => {
    if (!busy && checked !== value) onCheckedChange(value)
  }

  // The names are a pointer's shortcut to an option; the switch is the keyboard's control.
  const name = (value: boolean, text: string) => (
    <button
      type="button"
      id={value ? onId : undefined}
      tabIndex={-1}
      disabled={disabled}
      onClick={() => choose(value)}
      className={cn(
        "type-body disabled:cursor-not-allowed disabled:text-disabled-foreground",
        checked === value ? "font-strong" : "text-muted-foreground",
      )}
    >
      {text}
    </button>
  )

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        {name(false, offLabel)}
        <Switch
          id={switchId}
          checked={checked}
          onCheckedChange={choose}
          disabled={disabled}
          aria-labelledby={onId}
          aria-describedby={hint ? hintId : undefined}
        />
        {name(true, onLabel)}
        {busyLabel ? (
          <>
            <BusySlot busy={busy} />
            <BusyStatus busy={busy}>{busyLabel}</BusyStatus>
          </>
        ) : null}
      </div>
      {hint ? (
        <p id={hintId} className="type-hint text-muted-foreground">
          {hint}
        </p>
      ) : null}
    </div>
  )
}
