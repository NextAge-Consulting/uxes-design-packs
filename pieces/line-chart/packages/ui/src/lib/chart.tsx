// ui-content
import type * as React from "react"

/**
 * The plot construction the charts share — `BarChart` and `LineChart` draw their own
 * marks on it. One source for the series colours and their order, the fold into
 * "Other", the value axis, the gridlines, the legend and the screen-reader table, so
 * a fix to any of them reaches every chart.
 */

/** Series colours, `--chart-1` … `--chart-5`, in the order a chart's series are given — never cycled. */
export const SERIES_FILL = ["fill-chart-1", "fill-chart-2", "fill-chart-3", "fill-chart-4", "fill-chart-5"]
export const SERIES_STROKE = ["stroke-chart-1", "stroke-chart-2", "stroke-chart-3", "stroke-chart-4", "stroke-chart-5"]
export const SERIES_SWATCH = ["bg-chart-1", "bg-chart-2", "bg-chart-3", "bg-chart-4", "bg-chart-5"]

/** A series of a chart; `null` is no value at that point. */
export type ChartSeries = { name: string; values: (number | null)[] }

/**
 * A sixth series and later folded into one, named `otherLabel`: at each point the sum
 * of the values there, or `null` where none of them has one.
 */
export function foldSeries<S extends ChartSeries>(series: S[], otherLabel: string): (S | ChartSeries)[] {
  if (series.length <= SERIES_SWATCH.length) return series
  const kept = series.slice(0, SERIES_SWATCH.length - 1)
  const rest = series.slice(SERIES_SWATCH.length - 1)
  const values = (rest[0]?.values ?? []).map((_, i) => {
    const present = rest.map((s) => s.values[i]).filter((v): v is number => v != null)
    return present.length === 0 ? null : present.reduce((sum, v) => sum + v, 0)
  })
  return [...kept, { name: otherLabel, values }]
}

/** The axis top: the largest value, rounded up to a figure that halves cleanly. */
export function axisTop(max: number) {
  if (max <= 0) return 1
  const step = 10 ** Math.floor(Math.log10(max))
  return [1, 2, 2.5, 5, 10].map((m) => m * step).find((n) => n >= max) ?? 10 * step
}

/** The value axis down the plot's left: the top, half of it, and zero. */
export function ChartValueAxis({ top, formatValue }: { top: number; formatValue: (value: number) => string }) {
  return (
    <div aria-hidden className="flex flex-col items-end justify-between type-metadata text-muted-foreground">
      <span>{formatValue(top)}</span>
      <span>{formatValue(top / 2)}</span>
      <span>{formatValue(0)}</span>
    </div>
  )
}

/** The three gridlines — top, half and the baseline — inside a plot `width` units wide and 100 high. */
export function ChartGridlines({ width }: { width: number }) {
  return (
    <>
      <line className="stroke-border-subtle" x1="0" x2={width} y1="0.5" y2="0.5" vectorEffect="non-scaling-stroke" />
      <line className="stroke-border-subtle" x1="0" x2={width} y1="50" y2="50" vectorEffect="non-scaling-stroke" />
      <line className="stroke-border" x1="0" x2={width} y1="99.5" y2="99.5" vectorEffect="non-scaling-stroke" />
    </>
  )
}

/** The legend: each entry's swatch and name, `label` naming the list. */
export function ChartLegend({ label, entries }: { label?: string; entries: { name: string; swatch: string }[] }) {
  return (
    <ul aria-label={label} className="m-0 flex list-none flex-wrap gap-x-4 gap-y-2 p-0">
      {entries.map((entry) => (
        <li key={entry.name} className="flex items-center gap-2 type-metadata text-muted-foreground">
          <span aria-hidden className={`size-chart-swatch rounded-stamp ${entry.swatch}`} />
          {entry.name}
        </li>
      ))}
    </ul>
  )
}

/**
 * The chart's figures as a table, for screen readers: one row per point, one column per
 * series. `heading` heads the row labels.
 */
export function ChartTable({
  label,
  heading,
  columns,
  rows,
}: {
  label: string
  heading?: string
  columns: string[]
  rows: { key: string; label: React.ReactNode; cells: string[] }[]
}) {
  return (
    // sr-only on a wrapper: a table ignores the 1px box and would widen the page
    <div className="sr-only">
      <table>
        <caption>{label}</caption>
        <thead>
          <tr>
            <th scope="col">{heading ?? ""}</th>
            {columns.map((name) => (
              <th key={name} scope="col">
                {name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.key}>
              <th scope="row">{row.label}</th>
              {row.cells.map((cell, c) => (
                <td key={columns[c]}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
