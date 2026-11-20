// ui-status: approved
// ui-atom
// ui-behaviour: date-entry.md
import * as React from "react"
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
} from "lucide-react"
import {
  DayPicker,
  getDefaultClassNames,
  type DayButton,
  useDayPicker,
} from "react-day-picker"

import { Button } from "@design-pack/ui/components/ui/button"
import { IconButton } from "@design-pack/ui/components/icon-button"
import { cn } from "@design-pack/ui/lib/utils"

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "label",
  navLayout,
  yearNavigation = false,
  buttonVariant = "ghost",
  formatters,
  components,
  ...props
}: React.ComponentProps<typeof DayPicker> & {
  buttonVariant?: React.ComponentProps<typeof Button>["variant"]
  /** « and » beside ‹ and ›, a year back and forward. */
  yearNavigation?: boolean
}) {
  const defaultClassNames = getDefaultClassNames()

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn(
        "group/calendar bg-background p-3 [--cell-size:--spacing(8)] [[data-slot=card-content]_&]:bg-transparent [[data-slot=popover-content]_&]:bg-transparent",
        String.raw`rtl:**:[.rdp-button\_next>svg]:rotate-180`,
        String.raw`rtl:**:[.rdp-button\_previous>svg]:rotate-180`,
        className
      )}
      captionLayout={captionLayout}
      navLayout={navLayout}
      formatters={{
        formatMonthDropdown: (date) =>
          date.toLocaleString("default", { month: "short" }),
        ...formatters,
      }}
      classNames={{
        root: cn("w-fit", defaultClassNames.root),
        months: cn(
          "relative flex flex-col gap-4 md:flex-row",
          defaultClassNames.months
        ),
        // `around` puts ‹ and › either side of the caption, in one row above the days.
        month: cn(
          navLayout === "around"
            ? "grid grid-cols-[auto_1fr_auto] items-center gap-x-1 gap-y-4"
            : "flex w-full flex-col gap-4",
          defaultClassNames.month
        ),
        nav: cn(
          "absolute inset-x-0 top-0 flex w-full items-center justify-between gap-1",
          defaultClassNames.nav
        ),
        month_caption: cn(
          "flex h-(--cell-size) w-full items-center justify-center",
          navLayout !== "around" && "px-(--cell-size)",
          defaultClassNames.month_caption
        ),
        dropdowns: cn(
          "flex h-(--cell-size) w-full items-center justify-center gap-2 type-body font-emphasis",
          defaultClassNames.dropdowns
        ),
        dropdown_root: cn(
          "relative rounded-control border-line border-input has-focus:border-ring has-focus:ring-3 has-focus:ring-ring/50",
          defaultClassNames.dropdown_root
        ),
        dropdown: cn(
          "absolute inset-0 bg-popover opacity-0",
          defaultClassNames.dropdown
        ),
        caption_label: cn(
          "type-body font-emphasis select-none",
          captionLayout === "label"
            ? ""
            : "flex h-8 items-center gap-1 rounded-control pr-1 pl-2 [&>svg]:size-4 [&>svg]:text-muted-foreground",
          defaultClassNames.caption_label
        ),
        month_grid: cn("w-full border-collapse", navLayout === "around" && "col-span-3", defaultClassNames.month_grid),
        weekdays: cn("flex", defaultClassNames.weekdays),
        weekday: cn(
          "flex-1 rounded-control type-metadata text-muted-foreground select-none",
          defaultClassNames.weekday
        ),
        week: cn("mt-2 flex w-full", defaultClassNames.week),
        week_number_header: cn(
          "w-(--cell-size) select-none",
          defaultClassNames.week_number_header
        ),
        week_number: cn(
          "type-metadata text-muted-foreground select-none",
          defaultClassNames.week_number
        ),
        day: cn(
          "group/day relative aspect-square h-full w-full p-0 text-center select-none [&:last-child[data-selected=true]_button]:rounded-r-control",
          props.showWeekNumber
            ? "[&:nth-child(2)[data-selected=true]_button]:rounded-l-control"
            : "[&:first-child[data-selected=true]_button]:rounded-l-control",
          defaultClassNames.day
        ),
        range_start: cn(
          "rounded-l-control bg-accent",
          defaultClassNames.range_start
        ),
        range_middle: cn("rounded-none", defaultClassNames.range_middle),
        range_end: cn("rounded-r-control bg-accent", defaultClassNames.range_end),
        today: cn(
          "rounded-control bg-accent text-accent-foreground data-[selected=true]:rounded-none",
          defaultClassNames.today
        ),
        outside: cn(
          "text-muted-foreground aria-selected:text-muted-foreground",
          defaultClassNames.outside
        ),
        disabled: cn(
          "text-disabled-foreground",
          defaultClassNames.disabled
        ),
        hidden: cn("invisible", defaultClassNames.hidden),
        ...classNames,
      }}
      components={{
        Root: ({ className, rootRef, ...props }) => {
          return (
            <div
              data-slot="calendar"
              ref={rootRef}
              className={cn(className)}
              {...props}
            />
          )
        },
        // The month arrows are icon-only, so they go through IconButton: the
        // label DayPicker supplies becomes both the name and the tooltip.
        PreviousMonthButton: ({ "aria-label": label, children: _chevron, className: _class, ...props }) => {
          const month = <IconButton label={label ?? "Previous month"} icon={ChevronLeftIcon} {...props} />
          return yearNavigation ? (
            <span className="flex items-center">
              <YearStep step={-1} />
              {month}
            </span>
          ) : (
            month
          )
        },
        NextMonthButton: ({ "aria-label": label, children: _chevron, className: _class, ...props }) => {
          const month = <IconButton label={label ?? "Next month"} icon={ChevronRightIcon} {...props} />
          return yearNavigation ? (
            <span className="flex items-center">
              {month}
              <YearStep step={1} />
            </span>
          ) : (
            month
          )
        },
        Chevron: ({ className, orientation, ...props }) => {
          if (orientation === "left") {
            return (
              <ChevronLeftIcon className={cn("size-4", className)} {...props} />
            )
          }

          if (orientation === "right") {
            return (
              <ChevronRightIcon
                className={cn("size-4", className)}
                {...props}
              />
            )
          }

          return (
            <ChevronDownIcon className={cn("size-4", className)} {...props} />
          )
        },
        DayButton: CalendarDayButton,
        WeekNumber: ({ children, ...props }) => {
          return (
            <td {...props}>
              <div className="flex size-(--cell-size) items-center justify-center text-center">
                {children}
              </div>
            </td>
          )
        },
        ...components,
      }}
      {...props}
    />
  )
}

/** A year back or forward from the month shown, held within the calendar's first and last month. */
function YearStep({ step }: { step: -1 | 1 }) {
  const { months, goToMonth, dayPickerProps } = useDayPicker()
  const shown = months[0]?.date
  if (!shown) return null
  const first = dayPickerProps.startMonth
  const last = dayPickerProps.endMonth
  let target = new Date(shown.getFullYear() + step, shown.getMonth())
  if (first && target < first) target = new Date(first.getFullYear(), first.getMonth())
  if (last && target > last) target = new Date(last.getFullYear(), last.getMonth())
  return (
    <IconButton
      label={step < 0 ? "Go to the Previous Year" : "Go to the Next Year"}
      icon={step < 0 ? ChevronsLeftIcon : ChevronsRightIcon}
      disabled={target.getTime() === new Date(shown.getFullYear(), shown.getMonth()).getTime()}
      onClick={() => goToMonth(target)}
    />
  )
}

function CalendarDayButton({
  className,
  day,
  modifiers,
  ...props
}: React.ComponentProps<typeof DayButton>) {
  const defaultClassNames = getDefaultClassNames()

  const ref = React.useRef<HTMLButtonElement>(null)
  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus()
  }, [modifiers.focused])

  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      data-day={day.date.toLocaleDateString()}
      data-selected-single={
        modifiers.selected &&
        !modifiers.range_start &&
        !modifiers.range_end &&
        !modifiers.range_middle
      }
      data-range-start={modifiers.range_start}
      data-range-end={modifiers.range_end}
      data-range-middle={modifiers.range_middle}
      className={cn(
        "flex aspect-square size-auto w-full min-w-(--cell-size) flex-col gap-1 type-body group-data-[focused=true]/day:relative group-data-[focused=true]/day:z-10 group-data-[focused=true]/day:border-ring group-data-[focused=true]/day:ring-3 group-data-[focused=true]/day:ring-ring/50 data-[range-end=true]:rounded-control data-[range-end=true]:rounded-r-control data-[range-end=true]:bg-primary data-[range-end=true]:text-primary-foreground data-[range-middle=true]:rounded-none data-[range-middle=true]:bg-accent data-[range-middle=true]:text-accent-foreground data-[range-start=true]:rounded-control data-[range-start=true]:rounded-l-control data-[range-start=true]:bg-primary data-[range-start=true]:text-primary-foreground data-[selected-single=true]:bg-primary data-[selected-single=true]:text-primary-foreground hover:text-accent-foreground [&>span]:type-metadata [&>span]:text-muted-foreground",
        defaultClassNames.day,
        className
      )}
      {...props}
    />
  )
}

export { Calendar, CalendarDayButton }
