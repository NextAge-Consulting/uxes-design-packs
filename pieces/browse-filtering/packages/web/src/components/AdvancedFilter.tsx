// ui-status: approved
// ui-block: FilterDialog
// ui-behaviour: browse-filtering.md
import { DateRange as DateRangeFields } from '@design-pack/ui/components/date-field'
import { Field, FieldRow } from '@design-pack/ui/components/field'
import { Combobox } from '@design-pack/ui/components/combobox'
import { ModalBody, ModalFooter, ModalHeader, ModalSection } from '@design-pack/ui/components/modal-shell'
import { Button } from '@design-pack/ui/components/ui/button'
import { Checkbox } from '@design-pack/ui/components/ui/checkbox'
import { Dialog, DialogContent } from '@design-pack/ui/components/ui/dialog'
import { Input } from '@design-pack/ui/components/ui/input'
import { Label } from '@design-pack/ui/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@design-pack/ui/components/ui/select'
import { Switch } from '@design-pack/ui/components/ui/switch'
import { type ReactNode, useId, useRef, useState } from 'react'
import {
  cleanFilter,
  type DateRange,
  type FilterField,
  type FilterState,
  type FilterValue,
  type NumberRange,
} from '../browse/advancedFilter'

const ANY = '__any__'

/** The fields in their groups, in the order declared; fields with no group lead, unheaded. */
function groupsOf(fields: readonly FilterField[]) {
  const groups: Array<{ key: string; heading?: string; fields: FilterField[] }> = []
  for (const field of fields) {
    const last = groups.at(-1)
    if (last && last.heading === field.group) last.fields.push(field)
    else groups.push({ key: field.group ?? field.id, heading: field.group, fields: [field] })
  }
  return groups
}

/** One group of the filter's fields, two to a row; headed and ruled off, except the leading fields. */
function FilterGroup({ heading, children }: { heading?: string; children: ReactNode }) {
  const grid = <div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2">{children}</div>
  return heading ? <ModalSection heading={heading}>{grid}</ModalSection> : grid
}

/** A pick-list too long to read, typed into to narrow it; clearing it returns it to its unset value. */
function SearchableSelect({
  field,
  value,
  onChange,
}: {
  field: Extract<FilterField, { kind: 'select' }>
  value: FilterValue | undefined
  onChange: (next: FilterValue | undefined) => void
}) {
  const [inputId, setInputId] = useState<string | undefined>(undefined)
  return (
    <Field>
      <Label htmlFor={inputId}>{field.label}</Label>
      <Combobox
        onInputId={setInputId}
        label={field.label}
        value={typeof value === 'string' ? value : ''}
        onValueChange={(next) => onChange(next || undefined)}
        options={field.options}
        placeholder={field.unsetLabel ?? 'Any'}
        isLoading={field.loading}
        isError={field.failed}
      />
    </Field>
  )
}

/**
 * A list's advanced filter, laid out as a form of the fields the list offers. Search
 * applies what is filled in and closes; Clear empties the form, and the list stays as it
 * is until Search. It opens on the filter the list is showing.
 */
export function AdvancedFilter({
  title,
  fields,
  value,
  onApply,
  onClose,
}: {
  /** The list's name: the dialog reads "Filter <title>". */
  title: string
  fields: readonly FilterField[]
  value: FilterState
  onApply: (next: FilterState) => void
  onClose: () => void
}) {
  const [draft, setDraft] = useState<FilterState>(value)
  const formRef = useRef<HTMLFormElement>(null)
  const set = (id: string, next: FilterValue | undefined) =>
    setDraft((prev) => {
      const out = { ...prev }
      if (next === undefined) delete out[id]
      else out[id] = next
      return out
    })

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        size="report"
        // Focus starts on the form, not its first field: a Combobox there would open its list unasked.
        onOpenAutoFocus={(event) => {
          event.preventDefault()
          formRef.current?.focus()
        }}
      >
        <ModalHeader title={`Filter ${title}`} description="Every field filled in narrows the list." />
        <form
          ref={formRef}
          tabIndex={-1}
          onSubmit={(event) => {
            event.preventDefault()
            onApply(cleanFilter(draft))
            onClose()
          }}
          className="flex min-h-0 flex-1 flex-col gap-4 outline-none">
          <ModalBody>
            <div className="flex flex-col gap-4">
              {groupsOf(fields).map((group) => (
                <FilterGroup key={group.key} heading={group.heading}>
                  {group.fields.map((field) =>
                    field.wide || field.secondColumn ? (
                      <div key={field.id} className={field.wide ? 'md:col-span-2' : 'md:col-start-2'}>
                        <FilterControl field={field} value={draft[field.id]} onChange={(next) => set(field.id, next)} />
                      </div>
                    ) : (
                      <FilterControl key={field.id} field={field} value={draft[field.id]} onChange={(next) => set(field.id, next)} />
                    ),
                  )}
                </FilterGroup>
              ))}
            </div>
          </ModalBody>
          <ModalFooter>
            <Button type="button" variant="outline" onClick={() => setDraft({})}>
              Clear
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Search</Button>
          </ModalFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function FilterControl({
  field,
  value,
  onChange,
}: {
  field: FilterField
  value: FilterValue | undefined
  onChange: (next: FilterValue | undefined) => void
}) {
  const id = useId()
  switch (field.kind) {
    case 'text':
      return (
        <Field>
          <Label htmlFor={id}>{field.label}</Label>
          <Input
            id={id}
            value={typeof value === 'string' ? value : ''}
            placeholder={field.placeholder}
            onChange={(e) => onChange(e.target.value || undefined)}
          />
        </Field>
      )
    case 'select':
      if (field.searchable) return <SearchableSelect field={field} value={value} onChange={onChange} />
      return (
        <Field>
          <Label htmlFor={id}>{field.label}</Label>
          <Select value={typeof value === 'string' ? value : ANY} onValueChange={(next) => onChange(next === ANY ? undefined : next)}>
            <SelectTrigger id={id} className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ANY}>{field.unsetLabel ?? 'Any'}</SelectItem>
              {field.options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      )
    case 'multi': {
      // Unset, a field that narrows by default shows its defaults ticked.
      const chosen = Array.isArray(value) ? value : [...(field.defaults ?? [])]
      return (
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-2 type-field-label">{field.label}</legend>
          {field.options.map((option) => {
            const optionId = `${id}-${option.value}`
            return (
              <div key={option.value} className="flex items-center gap-2">
                <Checkbox
                  id={optionId}
                  checked={chosen.includes(option.value)}
                  onCheckedChange={(on) => {
                    const next = on === true ? [...chosen, option.value] : chosen.filter((v) => v !== option.value)
                    onChange(next.length ? next : undefined)
                  }}
                />
                <Label htmlFor={optionId} kind="option">
                  {option.label}
                </Label>
              </div>
            )
          })}
        </fieldset>
      )
    }
    case 'dateRange': {
      const range = (value as DateRange | undefined) ?? {}
      return (
        <DateRangeFields
          idPrefix={id}
          label={field.label}
          from={range.from}
          to={range.to}
          onChange={(next) => onChange(next.from || next.to ? next : undefined)}
        />
      )
    }
    case 'numberRange': {
      const range = (value as NumberRange | undefined) ?? {}
      const num = (text: string) => (text.trim() === '' || Number.isNaN(Number(text)) ? undefined : Number(text))
      const put = (next: NumberRange) => onChange(next.min !== undefined || next.max !== undefined ? next : undefined)
      return (
        // Named once, on the first end — "Amount From | To" — as a date range is (`date-entry.md`).
        <fieldset>
          <legend className="sr-only">{field.label}</legend>
          <FieldRow layout="short">
            <Field>
              <Label htmlFor={`${id}-min`}>{field.label} From</Label>
              <Input id={`${id}-min`} inputMode="decimal" value={range.min ?? ''} onChange={(e) => put({ ...range, min: num(e.target.value) })} />
            </Field>
            <Field>
              <Label htmlFor={`${id}-max`}>To</Label>
              <Input id={`${id}-max`} inputMode="decimal" value={range.max ?? ''} onChange={(e) => put({ ...range, max: num(e.target.value) })} />
            </Field>
          </FieldRow>
        </fieldset>
      )
    }
    case 'switch':
      return (
        <div className="flex items-center gap-2">
          <Switch id={id} checked={value === true} onCheckedChange={(on) => onChange(on ? true : undefined)} />
          <Label htmlFor={id} kind="option">
            {field.label}
          </Label>
        </div>
      )
  }
}
