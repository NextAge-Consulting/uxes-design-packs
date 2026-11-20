// ui-status: approved
// ui-atom
// ui-behaviour: date-entry.md
"use client"

import * as React from "react"
import { type CalendarDate, createCalendar, parseDate, today } from "@internationalized/date"
import { CalendarDays, X } from "lucide-react"
import { I18nProvider, useDateField, useLocale } from "react-aria"
import { useDateFieldState } from "react-stately"

import { DateTimeZone, ENTRY_LOCALE, SegmentShell, useDateTimeZone } from "@design-pack/ui/components/date-segments"
import { IconButton } from "@design-pack/ui/components/icon-button"
import { Button } from "@design-pack/ui/components/ui/button"
import { Calendar } from "@design-pack/ui/components/ui/calendar"
import { Label } from "@design-pack/ui/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@design-pack/ui/components/ui/popover"
import { cn } from "@design-pack/ui/lib/utils"

export { DateTimeZone }

/** How far back and ahead the calendar's year list reaches. Typing reaches any year. */
const YEARS_BACK = 100
const YEARS_AHEAD = 10

/** `YYYY-MM-DD` → the date React Aria holds, or null for none or an impossible one. */
export function isoToCalendarDate(value: string | undefined): CalendarDate | null {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value.slice(0, 10))) return null
  try {
    return parseDate(value.slice(0, 10))
  } catch {
    return null
  }
}

/**
 * `YYYY-MM-DD` → a Date at LOCAL midnight, for the calendar. Never `new Date(value)`,
 * which reads a bare date as UTC and lands on the previous day west of Greenwich.
 */
function isoToLocalDate(value: string | undefined): Date | undefined {
  const date = isoToCalendarDate(value)
  return date ? new Date(date.year, date.month - 1, date.day) : undefined
}

function localDateToIso(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
}

/**
 * A calendar date, typed as `mm/dd/yyyy` or picked from a calendar.
 *
 * Typing is the main way in: a date years back is quicker typed than paged to. The
 * calendar button opens a month with ‹ › for the month either side, a month list and a
 * year list for a longer jump, and Clear and Today beneath; Today is the company's
 * today (`DateTimeZone`). A partly typed date shows as invalid.
 *
 * The value in and out is `YYYY-MM-DD`, or undefined for none — a calendar date, never
 * a `Date`, which carries a time and a zone and shifts the day west of Greenwich.
 */
function DateField({
  id,
  label,
  value,
  onChange,
  clearable = true,
  disabled,
  invalid = false,
  describedBy,
  className,
}: {
  id?: string
  /** The field's name for assistive technology — its visible label's words. */
  label: string
  /** `YYYY-MM-DD`, or empty for no date. */
  value?: string
  /** Receives `YYYY-MM-DD`, or undefined when cleared or only partly typed. */
  onChange: (value: string | undefined) => void
  /** A filter bound clears; a required record field does not. */
  clearable?: boolean
  disabled?: boolean
  /** The value was refused: the field draws its invalid look and says so to assistive tech. */
  invalid?: boolean
  /** The ids of the hint and error that describe the field. */
  describedBy?: string
  className?: string
}) {
  return (
    <I18nProvider locale={ENTRY_LOCALE}>
      <DateSegments
        id={id}
        label={label}
        value={value}
        onChange={onChange}
        clearable={clearable}
        disabled={disabled}
        invalid={invalid}
        describedBy={describedBy}
        className={className}
      />
    </I18nProvider>
  )
}

function DateSegments({
  id,
  label,
  value,
  onChange,
  clearable,
  disabled,
  invalid,
  describedBy,
  className,
}: React.ComponentProps<typeof DateField>) {
  const [open, setOpen] = React.useState(false)
  const zone = useDateTimeZone()
  const { locale } = useLocale()
  const date = React.useMemo(() => isoToCalendarDate(value), [value])
  const options = {
    "aria-label": label,
    "aria-describedby": describedBy,
    id,
    isDisabled: disabled,
    value: date,
    onChange: (next: CalendarDate | null) => onChange(next ? next.toString() : undefined),
    shouldForceLeadingZeros: true,
  }
  const state = useDateFieldState({ ...options, locale, createCalendar })
  const ref = React.useRef<HTMLDivElement>(null)
  const { fieldProps } = useDateField(options, state, ref)

  const now = today(zone)
  const pick = (next: string | undefined) => {
    onChange(next)
    setOpen(false)
  }

  return (
    <SegmentShell fieldRef={ref} fieldProps={fieldProps} state={state} invalid={invalid} disabled={disabled} className={className}>
      {clearable && value ? (
        // Named for what it clears, so a row of these does not announce "Clear" alike.
        <IconButton label={`Clear ${label}`} icon={<X aria-hidden className="size-3.5" />} size="icon-affix" onClick={() => onChange(undefined)} />
      ) : null}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <IconButton label={`Choose ${label}`} icon={CalendarDays} size="icon-affix" />
        </PopoverTrigger>
        <PopoverContent inset="flush" align="end" className="w-auto">
          <Calendar
            mode="single"
            captionLayout="dropdown"
            // Keyboard order follows the screen: ‹, the month and year lists, ›.
            navLayout="around"
            yearNavigation
            startMonth={new Date(now.year - YEARS_BACK, 0)}
            endMonth={new Date(now.year + YEARS_AHEAD, 11)}
            // `defaultMonth`, not `month`: paging away to look must not be dragged back.
            defaultMonth={isoToLocalDate(value) ?? new Date(now.year, now.month - 1)}
            selected={isoToLocalDate(value)}
            onSelect={(picked) => picked && pick(localDateToIso(picked))}
            autoFocus
          />
          <div className="flex items-center justify-between gap-2 border-t-line border-border px-3 py-2">
            {clearable ? (
              <Button variant="link" onClick={() => pick(undefined)}>
                Clear
              </Button>
            ) : (
              <span />
            )}
            <Button variant="link" onClick={() => pick(now.toString())}>
              Today
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </SegmentShell>
  )
}

/**
 * A from–to pair of dates, each its own `DateField` — typed or picked, either end
 * optional unless the caller says otherwise. A To before its From is refused in place,
 * under the pair, and the caller is told so through `onChange`'s second argument.
 */
function DateRange({
  idPrefix,
  label,
  from,
  to,
  onChange,
  ends = FROM_TO,
  clearable = true,
  toHint,
  disabled,
  className,
}: {
  idPrefix: string
  /** What the range is of — "Started" — which names both ends for assistive tech. */
  label: string
  from?: string
  to?: string
  onChange: (next: { from?: string; to?: string }) => void
  /** The ends' own names, and what is said when the second is before the first: From and To unless the record names them. */
  ends?: { from: string; to: string; reversed: string }
  /** Either end may be emptied — or, per end, only the one that may. */
  clearable?: boolean | { from: boolean; to: boolean }
  /** A line under the second end — what leaving it empty means. */
  toHint?: string
  disabled?: boolean
  className?: string
}) {
  const reversed = !!from && !!to && to < from
  const errorId = `${idPrefix}-error`
  const hintId = `${idPrefix}-to-hint`
  const clears = typeof clearable === "boolean" ? { from: clearable, to: clearable } : clearable
  return (
    // The pair's name is said once, on the first end — "Started From | To" — and the group
    // carries it for a screen reader, which hears it on the second end too.
    <fieldset className={cn("flex flex-col gap-1", className)}>
      <legend className="sr-only">{label}</legend>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <Label htmlFor={`${idPrefix}-from`}>{ends === FROM_TO ? `${label} From` : ends.from}</Label>
          <DateField
            id={`${idPrefix}-from`}
            label={ends === FROM_TO ? `${label} from` : ends.from}
            value={from}
            clearable={clears.from}
            disabled={disabled}
            invalid={reversed}
            describedBy={reversed ? errorId : undefined}
            onChange={(next) => onChange({ from: next, to })}
          />
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor={`${idPrefix}-to`}>{ends.to}</Label>
          <DateField
            id={`${idPrefix}-to`}
            label={ends === FROM_TO ? `${label} to` : ends.to}
            value={to}
            clearable={clears.to}
            disabled={disabled}
            invalid={reversed}
            describedBy={[reversed ? errorId : null, toHint ? hintId : null].filter(Boolean).join(" ") || undefined}
            onChange={(next) => onChange({ from, to: next })}
          />
          {toHint ? (
            <p id={hintId} className="type-metadata text-muted-foreground">
              {toHint}
            </p>
          ) : null}
        </div>
      </div>
      {reversed ? (
        <p id={errorId} className="type-body text-feedback-danger">
          {ends.reversed}
        </p>
      ) : null}
    </fieldset>
  )
}

const FROM_TO = { from: "From", to: "To", reversed: "The To date is before the From date." }

export { DateField, DateRange }
