// ui-status: approved
// ui-block: Chart
import type * as React from "react"

import {
  axisTop,
  ChartGridlines,
  ChartLegend,
  ChartTable,
  ChartValueAxis,
  foldSeries,
  SERIES_FILL,
  SERIES_SWATCH,
} from "@design-pack/ui/lib/chart"
import { cn } from "@design-pack/ui/lib/utils"

type BarChartSeries = { name: string; values: number[] }

/**
 * Bars are chosen only one series stack at a time: a chart with a `comparison` draws
 * paired bars that cannot be selected, so it takes neither `selected` nor `onSelect`.
 */
type BarChartSelection =
  | { comparison?: undefined; selected?: number; onSelect?: (index: number) => void }
  | { comparison: { name: string; values: (number | null)[] }; selected?: undefined; onSelect?: undefined }

/**
 * A bar chart: one bar per category — a month, a document — on a 200px plot with a value axis
 * down its left, three gridlines and the categories along the bottom (below a tablet,
 * every other one hidden, counting back from the newest so it always shows).
 *
 * `series` stack within each bar, coloured `--chart-1` … `--chart-5` in the order given,
 * never cycled: a sixth series and later fold into one "Other". `comparison` draws a
 * quieter bar beside the first series' bar — last year beside this year.
 *
 * `selected` makes one bar stand out and fades the rest; `onSelect` lets a click choose it.
 * `aside` sits beside the chart from a laptop up and above it below — what the selected bar
 * is, laid out by `BarChartAside`. Every chart carries a legend, and a table of the same
 * figures for screen readers.
 */
function BarChart({
  label,
  categories,
  series: seriesProp,
  comparison,
  selected,
  onSelect,
  formatValue = String,
  legendLabel,
  otherLabel = "Other",
  aside,
  className,
  ...props
}: {
  /** What the chart shows, for screen readers — "The last 12 months, by category". */
  label: string
  categories: string[]
  series: BarChartSeries[]
  formatValue?: (value: number) => string
  /** Names the legend's list — "Categories". */
  legendLabel?: string
  otherLabel?: string
  /** Beside the chart: what the selected bar is — a `BarChartAside`. */
  aside?: React.ReactNode
} & BarChartSelection &
  Omit<React.ComponentProps<"div">, "onSelect">) {
  const series = foldSeries(seriesProp, otherLabel)
  const n = categories.length
  const slot = 120 / n
  const totals = categories.map((_, i) => series.reduce((sum, s) => sum + (s.values[i] ?? 0), 0))
  const top = axisTop(Math.max(...totals, ...(comparison?.values ?? []).map((v) => v ?? 0)))
  const y = (v: number) => (v / top) * 100

  const plot = (
      <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-2 [grid-area:chart]">
        <ChartValueAxis top={top} formatValue={formatValue} />
        <svg
          className="block h-chart-plot w-full"
          viewBox="0 0 120 100"
          preserveAspectRatio="none"
          role="img"
          aria-label={label}
        >
          <ChartGridlines width={120} />
          {categories.map((category, i) => {
            const title = [category, ...series.map((s) => `${s.name} ${formatValue(s.values[i] ?? 0)}`)]
            const prev = comparison?.values[i]
            if (comparison) {
              const cur = series[0]?.values[i] ?? 0
              if (prev != null) title.push(`${comparison.name} ${formatValue(prev)}`)
              return (
                <g key={category}>
                  <title>{title.join(" · ")}</title>
                  {prev != null ? (
                    <rect className="fill-chart-comparison" x={i * slot + slot * 0.12} y={100 - y(prev)} width={slot * 0.36} height={y(prev)} />
                  ) : null}
                  <rect className="fill-chart-1" x={i * slot + slot * 0.52} y={100 - y(cur)} width={slot * 0.36} height={y(cur)} />
                </g>
              )
            }
            let base = 100
            return (
              <g
                key={category}
                className={cn(
                  selected !== undefined && selected !== i && "opacity-35 hover:opacity-100 focus-visible:opacity-100",
                  // The focus mark is the ring rect below, never an outline: an outline on an SVG
                  // group draws in the stretched viewBox and is clipped at the plot's edges.
                  onSelect && "group/bar cursor-pointer outline-none"
                )}
                {...(onSelect
                  ? {
                      role: "button",
                      tabIndex: 0,
                      "aria-pressed": selected === i,
                      "aria-label": title.join(" · "),
                      onClick: () => onSelect(i),
                      onKeyDown: (e: React.KeyboardEvent) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault()
                          onSelect(i)
                        }
                      },
                    }
                  : {})}
              >
                <title>{title.join(" · ")}</title>
                <rect className="fill-transparent" x={i * slot} y="0" width={slot} height="100" />
                {series.map((s, si) => {
                  const h = y(s.values[i] ?? 0)
                  base -= h
                  return <rect key={s.name} className={SERIES_FILL[si]} x={i * slot + slot * 0.2} y={base} width={slot * 0.6} height={h} />
                })}
                {onSelect ? (
                  <rect
                    aria-hidden
                    className="fill-none stroke-ring opacity-0 group-focus-visible/bar:opacity-100"
                    strokeWidth={2}
                    vectorEffect="non-scaling-stroke"
                    x={i * slot + slot * 0.1}
                    y={0.5}
                    width={slot * 0.8}
                    height={99}
                  />
                ) : null}
              </g>
            )
          })}
        </svg>
        <span />
        <div
          aria-hidden
          className="grid justify-items-center type-metadata text-muted-foreground"
          style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}
        >
          {categories.map((category, i) => (
            <span key={category} className={cn((n - 1 - i) % 2 === 1 && "max-md:invisible")}>
              {category}
            </span>
          ))}
        </div>
      </div>
  )

  return (
    <div data-slot="bar-chart" className={cn("flex flex-col gap-4", className)} {...props}>
      {aside ? (
        <div className="grid grid-cols-1 gap-x-6 gap-y-4 [grid-template-areas:'aside'_'chart'] lg:grid-cols-[minmax(0,1fr)_minmax(0,var(--size-chart-aside))] lg:items-start lg:[grid-template-areas:'chart_aside']">
          <div className="min-w-0 [grid-area:aside]">{aside}</div>
          {plot}
        </div>
      ) : (
        plot
      )}
      <ChartLegend
        label={legendLabel}
        entries={[
          ...series.map((s, si) => ({ name: s.name, swatch: SERIES_SWATCH[si] as string })),
          ...(comparison ? [{ name: comparison.name, swatch: "bg-chart-comparison" }] : []),
        ]}
      />
      <ChartTable
        label={label}
        heading={legendLabel}
        columns={[...series.map((s) => s.name), ...(comparison ? [comparison.name] : [])]}
        rows={categories.map((category, i) => ({
          key: category,
          label: category,
          cells: [
            ...series.map((s) => formatValue(s.values[i] ?? 0)),
            ...(comparison ? [comparison.values[i] == null ? "—" : formatValue(comparison.values[i] as number)] : []),
          ],
        }))}
      />
    </div>
  )
}

// What the selected bar is, beside the chart: a `heading` (a `StatReadout`) with its
// `controls` (previous and next) on the same line, then the detail beneath.
function BarChartAside({
  heading,
  controls,
  children,
  className,
  ...props
}: { heading: React.ReactNode; controls?: React.ReactNode } & React.ComponentProps<"div">) {
  return (
    <div data-slot="bar-chart-aside" className={cn("flex flex-col items-start gap-2", className)} {...props}>
      <div className="flex w-full items-start justify-between gap-2">
        {heading}
        {controls ? <div className="flex items-center gap-2">{controls}</div> : null}
      </div>
      {children}
    </div>
  )
}

export { BarChart, BarChartAside, type BarChartSeries }
