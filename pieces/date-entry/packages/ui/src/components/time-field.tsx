// ui-status: approved
// ui-atom
// ui-behaviour: date-entry.md
"use client"

import * as React from "react"
import { Time, now } from "@internationalized/date"
import { Clock, X } from "lucide-react"
import { I18nProvider, useListBox, useLocale, useOption, useTimeField } from "react-aria"
import { Item, type ListState, type Node, type Selection, useListState, useTimeFieldState } from "react-stately"

import { DateField } from "@design-pack/ui/components/date-field"
import { ENTRY_LOCALE, SegmentShell, useDateTimeZone } from "@design-pack/ui/components/date-segments"
import { IconButton } from "@design-pack/ui/components/icon-button"
import { Button } from "@design-pack/ui/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@design-pack/ui/components/ui/popover"
import { cn } from "@design-pack/ui/lib/utils"

/** `HH:MM` (24-hour) → the time React Aria holds, or null. */
function isoToTime(value: string | undefined): Time | null {
  const match = /^(\d{2}):(\d{2})/.exec(value ?? "")
  if (!match) return null
  const hour = Number(match[1])
  const minute = Number(match[2])
  return hour < 24 && minute < 60 ? new Time(hour, minute) : null
}

const two = (n: number) => String(n).padStart(2, "0")
const timeToIso = (time: Time) => `${two(time.hour)}:${two(time.minute)}`

/**
 * A time of day, typed as `hh:mm AM` or picked from hour, minute and AM/PM columns.
 *
 * The value in and out is `HH:MM` on the 24-hour clock, or undefined for none — what a
 * database holds; the field shows it on the 12-hour clock US readers use. A partly typed
 * time shows as invalid. With `minuteStep`, the minutes offered and stepped through are
 * its multiples, and a typed minute between them moves to the nearest as the minute is left.
 */
function TimeField({
  id,
  label,
  value,
  onChange,
  minuteStep = 1,
  clearable = true,
  disabled,
  invalid = false,
  describedBy,
  className,
}: {
  id?: string
  /** The field's name for assistive technology — its visible label's words. */
  label: string
  /** `HH:MM`, 24-hour, or empty for none. */
  value?: string
  onChange: (value: string | undefined) => void
  /** The minutes a time may fall on: 1, 5, 10, 15 or 30. */
  minuteStep?: MinuteStep
  clearable?: boolean
  disabled?: boolean
  invalid?: boolean
  describedBy?: string
  className?: string
}) {
  return (
    <I18nProvider locale={ENTRY_LOCALE}>
      <TimeSegments
        id={id}
        label={label}
        value={value}
        onChange={onChange}
        minuteStep={minuteStep}
        clearable={clearable}
        disabled={disabled}
        invalid={invalid}
        describedBy={describedBy}
        className={className}
      />
    </I18nProvider>
  )
}

export type MinuteStep = 1 | 5 | 10 | 15 | 30

function TimeSegments({
  id,
  label,
  value,
  onChange,
  minuteStep = 1,
  clearable,
  disabled,
  invalid,
  describedBy,
  className,
}: React.ComponentProps<typeof TimeField>) {
  const [open, setOpen] = React.useState(false)
  const zone = useDateTimeZone()
  const { locale } = useLocale()
  const time = React.useMemo(() => isoToTime(value), [value])
  const options = {
    "aria-label": label,
    "aria-describedby": describedBy,
    id,
    isDisabled: disabled,
    value: time,
    onChange: (next: Time | null) => onChange(next ? timeToIso(next) : undefined),
    hourCycle: 12 as const,
    shouldForceLeadingZeros: true,
  }
  const state = useTimeFieldState({ ...options, locale })
  const ref = React.useRef<HTMLDivElement>(null)
  const { fieldProps } = useTimeField(options, state, ref)
  // Every pick in the columns writes through, so Escape puts back the time it opened on.
  const atOpen = React.useRef(value)
  const nowOnStep = () => {
    const at = now(zone)
    return timeToIso(new Time(at.hour, Math.floor(at.minute / minuteStep) * minuteStep))
  }

  return (
    <SegmentShell
      fieldRef={ref}
      fieldProps={fieldProps}
      state={state}
      invalid={invalid}
      disabled={disabled}
      className={className}
      minuteStep={minuteStep}
    >
      {clearable && value ? (
        <IconButton label={`Clear ${label}`} icon={<X aria-hidden className="size-3.5" />} size="icon-affix" onClick={() => onChange(undefined)} />
      ) : null}
      <Popover
        open={open}
        onOpenChange={(next) => {
          if (next) atOpen.current = value
          setOpen(next)
        }}
      >
        <PopoverTrigger asChild>
          <IconButton label={`Choose ${label}`} icon={Clock} size="icon-affix" />
        </PopoverTrigger>
        <PopoverContent
          inset="flush"
          align="end"
          className="w-auto"
          // The hour column focuses its own chosen hour.
          onOpenAutoFocus={(event) => event.preventDefault()}
          onEscapeKeyDown={() => {
            if (value !== atOpen.current) onChange(atOpen.current)
          }}
        >
          <TimePicker value={value} label={label} minuteStep={minuteStep} onPick={onChange} onDone={() => setOpen(false)} />
          {/* Clear at the left, Now in the middle, Done at the right — each in its place whether or not Clear is offered. */}
          <div className="grid grid-cols-3 items-center border-t-line border-border px-3 py-2 [&>:nth-child(2)]:justify-self-center [&>:nth-child(3)]:justify-self-end">
            {clearable ? (
              <Button
                variant="link"
                onClick={() => {
                  onChange(undefined)
                  setOpen(false)
                }}
              >
                Clear
              </Button>
            ) : (
              <span />
            )}
            <Button variant="link" onClick={() => onChange(nowOnStep())}>
              Now
            </Button>
            <Button variant="link" onClick={() => setOpen(false)}>
              Done
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </SegmentShell>
  )
}

const HOURS = ["12", ...Array.from({ length: 11 }, (_, i) => String(i + 1))]
const PERIODS = ["AM", "PM"]

/**
 * Hour, minute and AM/PM, each a headed column. A pick writes through at once and the
 * picker stays open, since an hour alone is not a time. It opens on the hour; ↑/↓ move
 * in a column and the time follows once one is set, ←/→ cross between columns, Enter
 * closes keeping the time, Escape closes putting back the time it opened on. Opening it
 * on an empty field writes nothing.
 */
function TimePicker({
  value,
  label,
  minuteStep,
  onPick,
  onDone,
}: {
  value: string | undefined
  label: string
  minuteStep: number
  onPick: (next: string) => void
  onDone: () => void
}) {
  const time = isoToTime(value)
  const hour12 = time ? String(time.hour % 12 === 0 ? 12 : time.hour % 12) : null
  const minute = time ? two(time.minute) : null
  const period = time ? (time.hour < 12 ? "AM" : "PM") : null
  const minutes = React.useMemo(() => Array.from({ length: 60 / minuteStep }, (_, i) => two(i * minuteStep)), [minuteStep])
  const hourRef = React.useRef<HTMLUListElement>(null)
  const minuteRef = React.useRef<HTMLUListElement>(null)
  const periodRef = React.useRef<HTMLUListElement>(null)
  const columns = [hourRef, minuteRef, periodRef]

  // A pick in one column fills the others from the time already set, else 12:00 AM's parts.
  const write = (h: string, m: string, p: string) => {
    const hour = (Number(h) % 12) + (p === "PM" ? 12 : 0)
    onPick(`${two(hour)}:${m}`)
  }

  return (
    <fieldset
      className="grid grid-cols-3 gap-x-1 p-1"
      onKeyDownCapture={(event) => {
        if (event.key === "Enter") {
          onDone()
          return
        }
        if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return
        const at = columns.findIndex((c) => c.current?.contains(event.target as globalThis.Node))
        const next = columns[at + (event.key === "ArrowRight" ? 1 : -1)]?.current
        if (!next) return
        event.preventDefault()
        event.stopPropagation()
        next.focus()
      }}
    >
      <legend className="sr-only">{label}</legend>
      <span aria-hidden className="py-1 text-center type-metadata text-muted-foreground"> {/* design-accepted — the calendar's weekday-heading style, approved */}
        Hour
      </span>
      <span aria-hidden className="py-1 text-center type-metadata text-muted-foreground"> {/* design-accepted — the calendar's weekday-heading style, approved */}
        Minute
      </span>
      <span aria-hidden className="py-1 text-center type-metadata text-muted-foreground">
        AM/PM
      </span>
      <TimeColumn ref={hourRef} label="Hour" values={HOURS} selected={hour12} autoFocus onPick={(h) => write(h, minute ?? "00", period ?? "AM")} />
      <TimeColumn ref={minuteRef} label="Minute" values={minutes} selected={minute} onPick={(m) => write(hour12 ?? "12", m, period ?? "AM")} />
      <TimeColumn ref={periodRef} label="AM or PM" values={PERIODS} selected={period} onPick={(p) => write(hour12 ?? "12", minute ?? "00", p)} />
    </fieldset>
  )
}

function TimeColumn({
  ref,
  label,
  values,
  selected,
  autoFocus = false,
  onPick,
}: {
  ref: React.RefObject<HTMLUListElement | null>
  label: string
  values: string[]
  selected: string | null
  autoFocus?: boolean
  onPick: (next: string) => void
}) {
  const props = {
    "aria-label": label,
    items: values.map((entry) => ({ entry })),
    children: (item: { entry: string }) => <Item key={item.entry}>{item.entry}</Item>,
    selectionMode: "single" as const,
    // The choice follows the arrows once there is one; until then the arrows only move,
    // so focusing the column as the picker opens never writes a time.
    selectionBehavior: selected ? ("replace" as const) : ("toggle" as const),
    disallowEmptySelection: true,
    selectedKeys: selected ? [selected] : [],
    onSelectionChange: (keys: Selection) => {
      const [next] = keys === "all" ? [] : [...keys]
      if (next !== undefined && next !== selected) onPick(String(next))
    },
    // Escape belongs to the popover, which puts the opening time back.
    escapeKeyBehavior: "none" as const,
    autoFocus: autoFocus ? ("first" as const) : false,
  }
  const state = useListState(props)
  const { listBoxProps } = useListBox(props, state, ref)

  // Open on the chosen value, scrolled to the middle of the column — this container only.
  React.useEffect(() => {
    const list = ref.current
    const row = selected ? list?.querySelector<HTMLElement>(`[data-key="${selected}"]`) : null
    if (list && row) list.scrollTo({ top: row.offsetTop - (list.clientHeight - row.offsetHeight) / 2, behavior: "instant" })
  }, [ref, selected])

  return (
    <ul {...listBoxProps} ref={ref} className="scroll-region h-56 w-18 overscroll-contain p-1 outline-none">
      {[...state.collection].map((item) => (
        <TimeOption key={item.key} item={item} state={state} />
      ))}
    </ul>
  )
}

function TimeOption({ item, state }: { item: Node<object>; state: ListState<object> }) {
  const ref = React.useRef<HTMLLIElement>(null)
  const { optionProps, isSelected, isFocused } = useOption({ key: item.key }, state, ref)
  return (
    <li
      {...optionProps}
      ref={ref}
      data-key={String(item.key)}
      className={cn(
        "flex h-control w-full cursor-default select-none items-center justify-center rounded-control border-line border-transparent type-body font-emphasis tabular-nums outline-none hover:bg-ghost-hover", // design-accepted — the approved look, reviewed in the running app
        isSelected && "bg-primary text-primary-foreground hover:bg-primary-hover", // design-accepted — the approved look, reviewed in the running app
        // The option the keyboard is on shows focus as every field does: its border in
        // the focus colour, and the focus ring around it.
        isFocused && "border-ring ring-3 ring-ring/50"
      )}
    >
      {item.rendered}
    </li>
  )
}

/**
 * A date and a time together, side by side — each typed or picked as on its own. The
 * value in and out is `YYYY-MM-DDTHH:MM`, the company's wall clock, or undefined; one
 * half without the other is not a value, and shows as invalid until both are there.
 */
function DateTimeField({
  idPrefix,
  label,
  value,
  onChange,
  minuteStep = 1,
  clearable = true,
  disabled,
  invalid = false,
  describedBy,
  className,
}: {
  idPrefix: string
  minuteStep?: MinuteStep
  label: string
  /** `YYYY-MM-DDTHH:MM`, or empty for none. */
  value?: string
  onChange: (value: string | undefined) => void
  clearable?: boolean
  disabled?: boolean
  invalid?: boolean
  describedBy?: string
  className?: string
}) {
  // The halves are held here, so a date typed before its time is not lost.
  const [halves, setHalves] = React.useState(() => split(value))
  const [seen, setSeen] = React.useState(value)
  if (seen !== value) {
    setSeen(value)
    const joined = halves.date && halves.time ? `${halves.date}T${halves.time}` : undefined
    if (joined !== value) setHalves(split(value))
  }
  const put = (next: { date?: string; time?: string }) => {
    setHalves(next)
    onChange(next.date && next.time ? `${next.date}T${next.time}` : undefined)
  }
  const half = !!halves.date !== !!halves.time

  return (
    <div className={cn("grid grid-cols-[3fr_2fr] gap-3", className)}>
      <DateField
        id={`${idPrefix}-date`}
        label={`${label} date`}
        value={halves.date}
        clearable={clearable}
        disabled={disabled}
        invalid={invalid || (half && !halves.date)}
        describedBy={describedBy}
        onChange={(date) => put({ ...halves, date })}
      />
      <TimeField
        id={`${idPrefix}-time`}
        label={`${label} time`}
        value={halves.time}
        clearable={clearable}
        disabled={disabled}
        minuteStep={minuteStep}
        invalid={invalid || (half && !halves.time)}
        describedBy={describedBy}
        onChange={(time) => put({ ...halves, time })}
      />
    </div>
  )
}

function split(value: string | undefined): { date?: string; time?: string } {
  const match = /^(\d{4}-\d{2}-\d{2})[T ](\d{2}:\d{2})/.exec(value ?? "")
  return match ? { date: match[1], time: match[2] } : {}
}

export { DateTimeField, TimeField }
