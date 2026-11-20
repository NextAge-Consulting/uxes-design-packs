// ui-status: approved
// ui-block: Chart
"use client"

import * as React from "react"

import { tooltipSurface } from "@design-pack/ui/components/ui/tooltip"
import {
  axisTop,
  type ChartSeries,
  ChartGridlines,
  ChartLegend,
  ChartTable,
  ChartValueAxis,
  foldSeries,
  SERIES_STROKE,
  SERIES_SWATCH,
} from "@design-pack/ui/lib/chart"
import { cn } from "@design-pack/ui/lib/utils"

/**
 * A line chart: a value over a run of points — hours of a day, minutes of an hour — on
 * the plot construction `BarChart` shares (`lib/chart`): its value axis,
 * gridlines, legend and screen-reader table.
 *
 * `series` draw `--chart-1` … `--chart-5` in the order given, never cycled; a sixth and
 * later fold into one "Other". A `null` value is no reading and breaks the line there.
 * `categories` label the bottom; an empty string leaves that point unlabelled, so a long
 * run labels only where it says to. Labels are thinned to the plot's width so none
 * collide — every second, third or more is drawn as the room needs.
 *
 * Pointing at the plot draws a crosshair at the nearest point with a readout of every
 * series there (`pointLabel` names the point), on the tooltip's surface. The plot is
 * also a slider: Tab reaches it, the arrow keys move the crosshair point by point and
 * Home and End go to either end, and the readout is its value. Every chart with more
 * than one series carries a legend, and a table of the same figures for screen readers.
 */

/** The width, in px, one label along the bottom needs to stand clear of the next. */
const LABEL_ROOM = 56

type LineChartSeries = ChartSeries

/** The runs of consecutive readings in a series — each one polyline. */
function runs(values: (number | null)[]): { start: number; values: number[] }[] {
  const out: { start: number; values: number[] }[] = []
  values.forEach((v, i) => {
    if (v == null) return
    const last = out[out.length - 1]
    if (last && last.start + last.values.length === i) last.values.push(v)
    else out.push({ start: i, values: [v] })
  })
  return out
}

function LineChart({
  label,
  categories,
  series: seriesProp,
  pointLabel = (i) => categories[i] ?? "",
  formatValue = String,
  legendLabel,
  otherLabel = "Other",
  className,
  ...props
}: {
  /** What the chart shows, for screen readers — "Requests on 03/02/26, by hour". */
  label: string
  /** One per point; an empty string leaves the point unlabelled along the bottom. */
  categories: string[]
  series: LineChartSeries[]
  /** What a point is, in full, for the readout and the table — "03/02/26 8 AM". */
  pointLabel?: (index: number) => string
  formatValue?: (value: number) => string
  /** Names the legend's list — "Days". */
  legendLabel?: string
  otherLabel?: string
} & React.ComponentProps<"div">) {
  const series = foldSeries(seriesProp, otherLabel)
  const n = Math.max(1, categories.length)
  const values = series.flatMap((s) => s.values.filter((v): v is number => v != null))
  const top = axisTop(Math.max(0, ...values))
  const y = (v: number) => 100 - (v / top) * 100
  const [hover, setHover] = React.useState<number | null>(null)

  // The plot's width, so the labels along the bottom can be thinned to fit it.
  const labelsRef = React.useRef<HTMLDivElement>(null)
  const [width, setWidth] = React.useState(0)
  React.useEffect(() => {
    const el = labelsRef.current
    if (!el) return
    const observer = new ResizeObserver(([entry]) => setWidth(entry?.contentRect.width ?? 0))
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const readout = (i: number) =>
    [
      pointLabel(i),
      ...series.map((s) => `${series.length > 1 ? `${s.name}: ` : ""}${s.values[i] == null ? "No reading" : formatValue(s.values[i] as number)}`),
    ].join(" · ")
  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const from = hover ?? n - 1
    const to =
      event.key === "ArrowLeft" || event.key === "ArrowDown"
        ? from - 1
        : event.key === "ArrowRight" || event.key === "ArrowUp"
          ? from + 1
          : event.key === "Home"
            ? 0
            : event.key === "End"
              ? n - 1
              : null
    if (to === null) return
    event.preventDefault()
    setHover(Math.min(n - 1, Math.max(0, to)))
  }

  const pointAt = (event: React.PointerEvent<HTMLDivElement>) => {
    const box = event.currentTarget.getBoundingClientRect()
    const i = Math.floor(((event.clientX - box.left) / box.width) * n)
    setHover(Math.min(n - 1, Math.max(0, i)))
  }
  const x = (i: number) => `${((i + 0.5) / n) * 100}%`
  const labelled = categories.map((c, i) => [c, i] as const).filter(([c]) => c !== "")
  // Room for a label: about the width of "12 AM" with a gap either side.
  const every = width > 0 ? Math.max(1, Math.ceil((labelled.length * LABEL_ROOM) / width)) : 1

  return (
    <div data-slot="line-chart" className={cn("flex flex-col gap-4", className)} {...props}>
      <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-2">
        <ChartValueAxis top={top} formatValue={formatValue} />
        <div
          role="slider"
          tabIndex={0}
          aria-label={label}
          aria-valuemin={0}
          aria-valuemax={n - 1}
          aria-valuenow={hover ?? n - 1}
          aria-valuetext={readout(hover ?? n - 1)}
          className="relative h-chart-plot outline-none focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-ring"
          onPointerMove={pointAt}
          onPointerLeave={() => setHover(null)}
          onFocus={() => setHover((h) => h ?? n - 1)}
          onBlur={() => setHover(null)}
          onKeyDown={onKeyDown}
        >
          <svg aria-hidden className="block size-full" viewBox={`0 0 ${n} 100`} preserveAspectRatio="none">
            <ChartGridlines width={n} />
            {hover !== null ? (
              <line className="stroke-muted-foreground" x1={hover + 0.5} x2={hover + 0.5} y1="0" y2="100" vectorEffect="non-scaling-stroke" />
            ) : null}
            {series.map((s, si) =>
              runs(s.values).map((run) =>
                run.values.length === 1 ? (
                  // A lone reading between gaps: a short tick, since a one-point line draws nothing.
                  <line
                    key={`${s.name}-${run.start}`}
                    className={cn("fill-none stroke-2", SERIES_STROKE[si])}
                    x1={run.start + 0.3}
                    x2={run.start + 0.7}
                    y1={y(run.values[0] as number)}
                    y2={y(run.values[0] as number)}
                    vectorEffect="non-scaling-stroke"
                  />
                ) : (
                  <polyline
                    key={`${s.name}-${run.start}`}
                    className={cn("fill-none stroke-2 [stroke-linejoin:round]", SERIES_STROKE[si])}
                    points={run.values.map((v, k) => `${run.start + k + 0.5},${y(v)}`).join(" ")}
                    vectorEffect="non-scaling-stroke"
                  />
                )
              )
            )}
          </svg>
          {hover !== null
            ? series.map((s, si) => {
                const v = s.values[hover]
                return v == null ? null : (
                  <span
                    key={s.name}
                    aria-hidden
                    className={cn("pointer-events-none absolute size-2 -translate-1/2 rounded-pill ring-2 ring-card", SERIES_SWATCH[si])}
                    style={{ left: x(hover), top: `${y(v)}%` }}
                  />
                )
              })
            : null}
          {hover !== null ? (
            <div
              aria-hidden
              className={cn(
                tooltipSurface,
                "pointer-events-none absolute top-0 flex flex-col gap-tight whitespace-nowrap",
                hover / n < 0.5 ? "translate-x-related" : "-translate-x-[calc(100%+var(--spacing-related))]"
              )}
              style={{ left: x(hover) }}
            >
              <span className="font-strong">{pointLabel(hover)}</span>
              {series.map((s, si) => (
                <span key={s.name} className="flex items-center gap-related">
                  {series.length > 1 ? <span className={cn("size-chart-swatch rounded-stamp", SERIES_SWATCH[si])} /> : null}
                  {series.length > 1 ? `${s.name}: ` : null}
                  {s.values[hover] == null ? "No reading" : formatValue(s.values[hover] as number)}
                </span>
              ))}
            </div>
          ) : null}
        </div>
        <span />
        <div ref={labelsRef} aria-hidden className="relative h-[1lh] type-metadata text-muted-foreground">
          {labelled.map(([c, i], k) =>
            k % every === 0 ? (
              <span key={i} className="absolute -translate-x-1/2 whitespace-nowrap" style={{ left: x(i) }}>
                {c}
              </span>
            ) : null
          )}
        </div>
      </div>
      {series.length > 1 ? (
        <ChartLegend label={legendLabel} entries={series.map((s, si) => ({ name: s.name, swatch: SERIES_SWATCH[si] as string }))} />
      ) : null}
      <ChartTable
        label={label}
        heading={legendLabel}
        columns={series.map((s) => s.name)}
        rows={categories.flatMap((_, i) =>
          series.every((s) => s.values[i] == null)
            ? []
            : [
                {
                  // A point's position is its identity — the categories may repeat or be empty.
                  key: String(i),
                  label: pointLabel(i),
                  cells: series.map((s) => (s.values[i] == null ? "—" : formatValue(s.values[i] as number))),
                },
              ],
        )}
      />
    </div>
  )
}

export { LineChart, type LineChartSeries }
