// ui-behaviour-code: browse-filtering.md
import { z } from 'zod'

/**
 * A list's advanced filter, declared once and read by its dialog, its chips and its
 * server function alike. Each kind has one fixed match, which the person never chooses:
 * text contains, a pick-list equals, a multi-pick matches any value it holds, a date or
 * number range is from–to inclusive with either end optional, a switch narrows to the
 * rows it names. Every field set narrows the list further (AND).
 */
export type FilterField = FieldOf<
  | { kind: 'text'; placeholder?: string }
  | {
      kind: 'select'
      options: readonly FilterOption[]
      /**
       * A Combobox, typed into to narrow its options, for a list too long to read as a
       * Select (`lookup-fields.md`); it clears back to its unset value.
       */
      searchable?: boolean
      /** The options are still on their way, or could not be read — never shown as an empty list. */
      loading?: boolean
      failed?: boolean
      /** What the list shows while nothing is chosen — "Any" unless the list narrows by default. */
      unsetLabel?: string
      /**
       * The option that narrows nothing, for a field whose unset value narrows the list —
       * `unsetLabel` says how. The default then shows as a chip, and its × chooses this
       * option; this option itself shows none.
       */
      widest?: string
    }
  | {
      kind: 'multi'
      options: readonly FilterOption[]
      /**
       * What applies while nothing is chosen, for a field whose unset value narrows the list:
       * ticked as the dialog opens, shown as a chip, and widened to every option by its ×.
       */
      defaults?: readonly string[]
    }
  | { kind: 'dateRange' }
  | { kind: 'numberRange' }
  /** An on/off switch (`boolean-fields.md`): its label names what the list is narrowed to while it is on. */
  | { kind: 'switch' }
>

/** Every field's id, label and group, on its own kind. */
type FieldOf<K> = K extends unknown
  ? K & {
      id: string
      label: string
      /**
       * The heading of the group the field sits in, as a form groups its fields — a name
       * together, an address together. Fields of a group are declared together; the
       * first fields may have none.
       */
      group?: string
      /** Across the whole row rather than one column — a name that wants the room, so a city and state can share the row below. */
      wide?: boolean
      /** In the second column, below the field above it there — a pair of switches kept together. */
      secondColumn?: boolean
    }
  : never

export interface FilterOption {
  value: string
  label: string
}

export interface DateRange {
  /** `YYYY-MM-DD`, inclusive. */
  from?: string
  /** `YYYY-MM-DD`, inclusive. */
  to?: string
}

export interface NumberRange {
  min?: number
  max?: number
}

export type FilterValue = string | string[] | DateRange | NumberRange | true

/** The filter a list is narrowed by: a value for each field that is set, and nothing else. */
export type FilterState = Record<string, FilterValue>

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

/** What a server function accepts as this list's filter: only its fields, each in its own shape. */
export function filterSchema(fields: readonly FilterField[]): z.ZodType<FilterState, FilterState> {
  const shape: Record<string, z.ZodType> = {}
  for (const field of fields) {
    switch (field.kind) {
      case 'text':
        shape[field.id] = z.string().trim().min(1).max(200).optional()
        break
      case 'select':
        // A type-to-search list's options come from elsewhere at run time — every record of a long list —
        // so the server takes any short value and its query matches it exactly.
        shape[field.id] = field.searchable
          ? z.string().trim().min(1).max(50).optional()
          : z.enum(field.options.map((o) => o.value) as [string, ...string[]]).optional()
        break
      case 'multi':
        shape[field.id] = z.array(z.enum(field.options.map((o) => o.value) as [string, ...string[]])).min(1).optional()
        break
      case 'dateRange':
        shape[field.id] = z.object({ from: z.string().regex(ISO_DATE).optional(), to: z.string().regex(ISO_DATE).optional() }).optional()
        break
      case 'numberRange':
        shape[field.id] = z.object({ min: z.number().optional(), max: z.number().optional() }).optional()
        break
      case 'switch':
        shape[field.id] = z.literal(true).optional()
        break
    }
  }
  // Each field's schema produces that field's value shape, so the object is a FilterState.
  return z.object(shape).strict() as unknown as z.ZodType<FilterState, FilterState>
}

/** The filter with every unset field taken out, so an empty field is never part of a query or a chip. */
export function cleanFilter(filter: FilterState): FilterState {
  const out: FilterState = {}
  for (const [id, value] of Object.entries(filter)) {
    if (value === undefined || value === '') continue
    if (Array.isArray(value) && value.length === 0) continue
    if (typeof value === 'object' && !Array.isArray(value) && Object.values(value).every((v) => v === undefined || v === '')) continue
    out[id] = value
  }
  return out
}

const shortDate = (iso: string) => {
  const [y, m, d] = iso.split('-')
  return `${m}/${d}/${y}`
}

/** What a set field says on its chip after its label: `Status: Open, Closed`, `Created: 01/01/2026 – 03/31/2026`; nothing for a switch, whose label says it all. */
export function describeFilterValue(field: FilterField, value: FilterValue): string {
  const label = (options: readonly FilterOption[], v: string) => options.find((o) => o.value === v)?.label ?? v
  switch (field.kind) {
    case 'text':
      return `"${String(value)}"`
    case 'select':
      return label(field.options, String(value))
    case 'multi':
      return (value as string[]).map((v) => label(field.options, v)).join(', ')
    case 'dateRange': {
      const { from, to } = value as DateRange
      if (from && to) return `${shortDate(from)} – ${shortDate(to)}`
      return from ? `from ${shortDate(from)}` : `to ${shortDate(to ?? '')}`
    }
    case 'numberRange': {
      const { min, max } = value as NumberRange
      if (min !== undefined && max !== undefined) return `${min} – ${max}`
      return min !== undefined ? `${min} or more` : `${max} or less`
    }
    case 'switch':
      return ''
  }
}

/** One chip of a list's filter: what narrows it, and how to stop it narrowing. */
export interface FilterChipData {
  key: string
  label: string
  value: string
  onRemove: () => void
}

/**
 * A chip for everything narrowing the list: each field that is set, and each field whose
 * unset default narrows (`widest`). × on a set field clears it, back to its default; × on
 * a narrowing default chooses the option that narrows nothing. A field set to that option
 * narrows nothing and has no chip.
 */
export function filterChips(fields: readonly FilterField[], filter: FilterState, apply: (next: FilterState) => void): FilterChipData[] {
  return fields.flatMap((field) => {
    const value = filter[field.id]
    const widest = field.kind === 'select' ? field.widest : undefined
    const every = field.kind === 'multi' ? field.options.map((o) => o.value) : []
    if (value === undefined) {
      if (field.kind === 'select' && widest !== undefined) {
        return [{ key: field.id, label: field.label, value: field.unsetLabel ?? '', onRemove: () => apply({ ...filter, [field.id]: widest }) }]
      }
      if (field.kind === 'multi' && field.defaults?.length) {
        return [{ key: field.id, label: field.label, value: describeFilterValue(field, [...field.defaults]), onRemove: () => apply({ ...filter, [field.id]: every }) }]
      }
      return []
    }
    if (widest !== undefined && value === widest) return []
    // Every option ticked narrows nothing.
    if (field.kind === 'multi' && Array.isArray(value) && every.every((v) => value.includes(v))) return []
    return [
      {
        key: field.id,
        label: field.label,
        value: describeFilterValue(field, value),
        onRemove: () => {
          const { [field.id]: _, ...rest } = filter
          apply(rest)
        },
      },
    ]
  })
}
