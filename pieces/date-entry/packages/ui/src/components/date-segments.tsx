// ui-status: approved
// ui-atom
// ui-behaviour: date-entry.md
"use client"

import * as React from "react"
import { useDateSegment } from "react-aria"
import type { DateFieldState, DateSegment, TimeFieldState } from "react-stately"

import { fieldVariants } from "@design-pack/ui/components/ui/input"
import { cn } from "@design-pack/ui/lib/utils"

/**
 * The typed half of every date and time field: the value as segments in one bordered
 * box, its picker button inside the box's right edge.
 *
 * Typing is React Aria's date field, pinned to `en-US` by the caller so it always reads
 * `mm/dd/yyyy` and `hh:mm AM`. A click selects the segment under it and typing replaces
 * it; digits move on by themselves; ←/→ move between segments, ↑/↓ step one, Backspace
 * clears one. A typed `/`, `-`, `.` or `:` moves on, as it does in a native field.
 *
 * **A partly typed value is shown as invalid**, never dropped quietly: React Aria
 * reports a value with an empty segment as no value at all, so without this a person who
 * typed only the month would save an empty field believing it held a date.
 */
export function SegmentShell({
  fieldRef,
  fieldProps,
  state,
  invalid,
  disabled,
  className,
  minuteStep = 1,
  children,
}: {
  fieldRef: React.RefObject<HTMLDivElement | null>
  fieldProps: React.HTMLAttributes<HTMLDivElement>
  state: DateFieldState | TimeFieldState
  /** The caller refused the value — a range ending before it starts, say. */
  invalid?: boolean
  disabled?: boolean
  className?: string
  /** ↑/↓ on the minute move by this many, onto its multiples. */
  minuteStep?: number
  /** The picker button and anything else inside the box's right edge. */
  children?: React.ReactNode
}) {
  // Whether a digit has been typed into the segment that has focus.
  const typedHere = React.useRef(false)
  const latestState = React.useRef(state)
  latestState.current = state
  const incomplete = state.value === null && state.segments.some((s) => s.isEditable && !s.isPlaceholder)

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: only sends a click on the box's empty space to its first segment; every segment is its own focusable spinbutton, so the keyboard path is complete without it
    <div
      data-disabled={disabled || undefined}
      // A click on the box but not on a segment lands on the first segment, not the
      // nearest — the year, for any click right of the digits.
      // React passes events from the picker's pop-up up to here although it draws
      // elsewhere, so each handler first ignores anything outside this box.
      onMouseDown={(event) => {
        const target = event.target as HTMLElement
        if (!event.currentTarget.contains(target)) return
        if (disabled || target.closest('[role="spinbutton"], button')) return
        const first = fieldRef.current?.querySelector<HTMLElement>('[role="spinbutton"]')
        if (!first) return
        event.preventDefault()
        first.focus()
      }}
      // Leaving the minute moves a minute typed between steps to the nearest, there and
      // then — not while typing it, when "1" is on its way to "15".
      // A typed second digit moves focus on before its minute is stored, so the check
      // waits a frame and reads the field as it is then.
      onBlurCapture={(event) => {
        if (minuteStep <= 1 || (event.target as HTMLElement).dataset.segment !== "minute") return
        requestAnimationFrame(() => {
          const latest = latestState.current
          const value = latest.value
          if (!value || !("minute" in value) || value.minute % minuteStep === 0) return
          const total = value.hour * 60 + Math.round(value.minute / minuteStep) * minuteStep
          latest.setValue(value.set({ hour: Math.floor(total / 60) % 24, minute: total % 60 }))
        })
      }}
      onFocusCapture={(event) => {
        if (!event.currentTarget.contains(event.target as Node)) return
        typedHere.current = false
      }}
      // A separator moves on only after a digit in this segment: `9` already moves on by
      // itself, so a `/` typed after it out of habit must not skip the next segment too.
      onKeyDownCapture={(event) => {
        if (!event.currentTarget.contains(event.target as Node)) return
        if (/^\d$/.test(event.key)) {
          typedHere.current = true
          return
        }
        const target = event.target as HTMLElement
        if (minuteStep > 1 && (event.key === "ArrowUp" || event.key === "ArrowDown") && target.dataset.segment === "minute") {
          event.preventDefault()
          event.stopPropagation()
          const current = state.segments.find((s) => s.type === "minute")
          const at = current && !current.isPlaceholder ? (current.value ?? 0) : 0
          const next = event.key === "ArrowUp" ? (Math.floor(at / minuteStep) + 1) * minuteStep : (Math.ceil(at / minuteStep) - 1) * minuteStep
          state.setSegment("minute", (next + 60) % 60)
          return
        }
        if (!SEPARATORS.has(event.key)) return
        const segments = [...(fieldRef.current?.querySelectorAll<HTMLElement>('[role="spinbutton"]') ?? [])]
        const at = segments.indexOf(event.target as HTMLElement)
        if (at === -1) return
        event.preventDefault()
        if (typedHere.current) segments[at + 1]?.focus()
      }}
      className={cn(fieldVariants({ part: "shell" }), "flex h-control items-center gap-1 pr-1 pl-field-inset", className)}
    >
      <div
        {...fieldProps}
        ref={fieldRef}
        aria-invalid={incomplete || invalid || undefined}
        className="flex min-w-0 flex-1 items-center tabular-nums outline-none"
      >
        {state.segments.map((segment, index) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: a segment's place in the locale's fixed format is its identity; the list is never reordered or filtered
          <Segment key={index} segment={segment} state={state} />
        ))}
      </div>
      {disabled ? null : children}
    </div>
  )
}

const SEPARATORS = new Set(["/", "-", ".", ":"])

/** An empty time reads `hh:mm`, as an empty date reads `mm/dd/yyyy`; React Aria draws dashes. */
const PLACEHOLDER: Partial<Record<DateSegment["type"], string>> = { hour: "hh", minute: "mm" }

function Segment({ segment, state }: { segment: DateSegment; state: DateFieldState | TimeFieldState }) {
  const ref = React.useRef<HTMLSpanElement>(null)
  const { segmentProps } = useDateSegment(segment, state, ref)
  return (
    <span
      {...segmentProps}
      ref={ref}
      data-segment={segment.type}
      className={cn(
        "rounded-stamp outline-none",
        // A literal is the `/` or `:` between two parts, with a little room either side.
        segment.type === "literal" && "px-px",
        segment.isPlaceholder && "text-muted-foreground",
        // The selected segment is the one typing replaces, so it reads as selected text does.
        "focus:bg-primary focus:text-primary-foreground" // design-accepted — the approved look, reviewed in the running app
      )}
    >
      {segment.isPlaceholder ? (PLACEHOLDER[segment.type] ?? segment.text) : segment.text}
    </span>
  )
}

/**
 * The zone "today" is read in. Each app gives it once at its root, so a Today button
 * pressed late in the evening west of the company's zone never stamps tomorrow or
 * yesterday. Without one, the browser's own zone.
 */
const TimeZoneContext = React.createContext<string | null>(null)

export function DateTimeZone({ zone, children }: { zone: string; children: React.ReactNode }) {
  return <TimeZoneContext.Provider value={zone}>{children}</TimeZoneContext.Provider>
}

export function useDateTimeZone(): string {
  return React.useContext(TimeZoneContext) ?? Intl.DateTimeFormat().resolvedOptions().timeZone
}

/** Every date and time field reads and writes in this one format, whatever the browser's language. */
export const ENTRY_LOCALE = "en-US"
