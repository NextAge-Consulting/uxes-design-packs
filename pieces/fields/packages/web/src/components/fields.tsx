// ui-status: approved
// ui-atom
// ui-behaviour: boolean-fields.md, lookup-fields.md, saving.md
import { type ReactNode, useState } from 'react'
import type { AnyFieldApi } from '@tanstack/react-form'
import { Field, FieldError } from '@design-pack/ui/components/field'
import { Combobox, type ComboboxOption } from '@design-pack/ui/components/combobox'
import { DateField } from '@design-pack/ui/components/date-field'
import { OptionSwitch } from '@design-pack/ui/components/option-switch'
import { FigureInput, Input } from '@design-pack/ui/components/ui/input'
import { Label } from '@design-pack/ui/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@design-pack/ui/components/ui/select'
import { Switch } from '@design-pack/ui/components/ui/switch'
import { tidyTypedAmount } from '../payments/amount'
import { Textarea } from '@design-pack/ui/components/ui/textarea'

/**
 * TanStack Form field components.
 *
 * They live in the web package, the front-end tier the apps share, so that the UI package
 * stays independent of any form library. They compose the plain atoms — `Input`,
 * `Label`, `Select` — and add only the binding.
 *
 * Never shadcn's `form` atom in their place: it is built on React Hook Form, a
 * second form library.
 *
 * They take `AnyFieldApi` rather than the fully-generic field type. The generic
 * signature is ~23 type parameters; threading it through shared components buys
 * nothing at the call site because `form.Field` has already inferred the value
 * type from the form's shape by the time the render prop runs.
 */

/**
 * Whether the field shows an error — only once the user has been in it — and the ids
 * of the hint and error that describe its control.
 */
function fieldState(field: AnyFieldApi, hint: ReactNode) {
  const invalid = field.state.meta.isTouched && field.state.meta.errors.length > 0
  const describedBy = [hint ? `${field.name}-hint` : null, invalid ? `${field.name}-error` : null].filter(Boolean).join(' ') || undefined
  return { invalid, describedBy }
}

/** The field's errors, under it. */
function FieldErrors({ field }: { field: AnyFieldApi }) {
  if (!fieldState(field, null).invalid) return null
  return (
    <FieldError id={`${field.name}-error`}>
      {field.state.meta.errors
        .map((e) => (typeof e === 'string' ? e : (e?.message ?? 'Invalid')))
        .join(', ')}
    </FieldError>
  )
}

/** The hint under a field's control. */
function FieldHint({ field, hint }: { field: AnyFieldApi; hint: ReactNode }) {
  return hint ? (
    <p id={`${field.name}-hint`} className="type-hint text-muted-foreground">
      {hint}
    </p>
  ) : null
}

/**
 * The label / control / hint / error frame every bound field renders in.
 */
function FieldShell({
  field,
  label,
  hint,
  htmlFor,
  children,
}: {
  field: AnyFieldApi
  label: string
  hint?: ReactNode
  /**
   * Override what the label points at.
   *
   * Defaults to the field name, which is the id every control here sets on
   * itself. A field built on `Combobox` needs this because cmdk generates its
   * input's id and will not take one.
   */
  htmlFor?: string
  children: ReactNode
}) {
  return (
    <Field>
      <Label htmlFor={htmlFor ?? field.name}>{label}</Label>
      {children}
      <FieldHint field={field} hint={hint} />
      <FieldErrors field={field} />
    </Field>
  )
}

type TextFieldProps = {
  field: AnyFieldApi
  label: string
  hint?: ReactNode
  type?: 'text' | 'email' | 'tel' | 'password' | 'number'
  maxLength?: number
  required?: boolean
  disabled?: boolean
  placeholder?: string
  className?: string
  /** Password managers and browser autofill need this — never omit it on a
   *  credential field (`current-password` / `new-password`). */
  autoComplete?: string
}

export function TextField({
  field,
  label,
  hint,
  type = 'text',
  maxLength,
  required,
  disabled,
  placeholder,
  className,
  autoComplete,
}: TextFieldProps) {
  const { invalid, describedBy } = fieldState(field, hint)
  return (
    <FieldShell field={field} label={label} hint={hint}>
      <Input
        id={field.name}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        name={field.name}
        type={type}
        required={required}
        disabled={disabled}
        maxLength={maxLength}
        placeholder={placeholder}
        className={className}
        autoComplete={autoComplete}
        value={(field.state.value as string | number | undefined) ?? ''}
        // onBlur drives isTouched — without it errors never surface, because
        // FieldErrors gates on touched. Easy to drop and hard to notice.
        onBlur={field.handleBlur}
        onChange={(e) => {
          if (type !== 'number') {
            field.handleChange(e.target.value)
            return
          }
          // valueAsNumber is NaN for an empty or partial input ("-", "1e").
          // Letting that reach the draft would send NaN to the server on save,
          // where it lands as null or blows up the insert. 0 is what the
          // hand-rolled version coerced to; keep that.
          const n = e.target.valueAsNumber
          field.handleChange(Number.isFinite(n) ? n : 0)
        }}
      />
    </FieldShell>
  )
}

export function SelectField({
  field,
  label,
  hint,
  options,
  placeholder = 'Select…',
  disabled,
}: {
  field: AnyFieldApi
  label: string
  hint?: ReactNode
  options: ReadonlyArray<{ value: string; label: string }>
  placeholder?: string
  disabled?: boolean
}) {
  const { invalid, describedBy } = fieldState(field, hint)
  return (
    <FieldShell field={field} label={label} hint={hint}>
      <Select
        value={(field.state.value as string | undefined) ?? ''}
        disabled={disabled}
        onValueChange={(v) => {
          field.handleChange(v)
          // Radix Select has no blur event of its own, so a picked value would
          // never mark the field touched and its errors would stay invisible.
          field.handleBlur()
        }}
      >
        <SelectTrigger id={field.name} aria-invalid={invalid || undefined} aria-describedby={describedBy} className="w-full">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FieldShell>
  )
}

/**
 * A form-bound lookup that filters as you type — a list too long for a `SelectField`
 * (`lookup-fields.md`: a `Combobox` above fifteen rows). The label points at the
 * input cmdk creates, whose id it reports once mounted.
 */
export function ComboboxField({
  field,
  label,
  hint,
  options,
  placeholder,
  emptyMessage,
  isLoading,
  isError,
  errorMessage,
  disabled,
}: {
  field: AnyFieldApi
  label: string
  hint?: ReactNode
  options: readonly ComboboxOption[]
  placeholder?: string
  emptyMessage?: string
  isLoading?: boolean
  isError?: boolean
  errorMessage?: string
  disabled?: boolean
}) {
  const [inputId, setInputId] = useState<string | undefined>(undefined)
  const { invalid, describedBy } = fieldState(field, hint)
  return (
    <FieldShell field={field} label={label} hint={hint} htmlFor={inputId}>
      <Combobox
        onInputId={setInputId}
        invalid={invalid}
        describedBy={describedBy}
        label={label}
        value={(field.state.value as string | undefined) ?? ''}
        onValueChange={(v) => {
          field.handleChange(v)
          // A pick has no blur of its own; touched is what shows the field's errors.
          field.handleBlur()
        }}
        options={options}
        placeholder={placeholder}
        emptyMessage={emptyMessage}
        isLoading={isLoading}
        isError={isError}
        errorMessage={errorMessage}
        disabled={disabled}
      />
    </FieldShell>
  )
}

/**
 * A form-bound on/off switch (`boolean-fields.md`): the switch, then its one label,
 * which names what is so while it is on and never changes.
 */
export function SwitchField({
  field,
  label,
  caption,
  hint,
  bare = false,
  disabled,
  confirmOn,
}: {
  field: AnyFieldApi
  label: string
  /** Shown above the switch, as every other field's caption — in a row of captioned fields. */
  caption?: string
  hint?: ReactNode
  /** The switch alone, `label` its spoken name — in a grid, where the column heading is the label. */
  bare?: boolean
  disabled?: boolean
  /** Turning it on asks first: this is called instead, and the caller sets the value once it is agreed. */
  confirmOn?: () => void
}) {
  const { describedBy } = fieldState(field, hint)
  const input = (
    <Switch
      id={field.name}
      disabled={disabled}
      checked={Boolean(field.state.value)}
      onCheckedChange={(next) => {
        if (next && confirmOn) return confirmOn()
        field.handleChange(next)
        field.handleBlur()
      }}
      aria-label={bare ? label : undefined}
      aria-describedby={describedBy}
    />
  )
  if (bare) return input
  const control = (
    <div className="flex items-center gap-2">
      {input}
      <Label htmlFor={field.name} kind="option">
        {label}
      </Label>
    </div>
  )
  if (!caption && !hint) return control
  return (
    <Field>
      {caption ? <Label htmlFor={field.name}>{caption}</Label> : null}
      {control}
      <FieldHint field={field} hint={hint} />
    </Field>
  )
}

/**
 * A form-bound choice between two named options (`boolean-fields.md`), both on screen
 * either side of the switch. The value is true while the on option is chosen.
 */
export function OptionSwitchField({
  field,
  offLabel,
  onLabel,
  offHint,
  onHint,
  caption,
  disabled,
  confirmOn,
}: {
  field: AnyFieldApi
  offLabel: string
  onLabel: string
  /** Said under the switch while that option is chosen — a fact its name cannot carry. */
  offHint?: ReactNode
  onHint?: ReactNode
  /** Shown above the switch, as every other field's caption — in a row of captioned fields. */
  caption?: string
  disabled?: boolean
  /** Choosing the on option asks first: this is called instead, and the caller sets the value once it is agreed. */
  confirmOn?: () => void
}) {
  const control = (
    <OptionSwitch
      id={field.name}
      checked={Boolean(field.state.value)}
      onCheckedChange={(next) => {
        if (next && confirmOn) return confirmOn()
        field.handleChange(next)
        field.handleBlur()
      }}
      offLabel={offLabel}
      onLabel={onLabel}
      offHint={offHint}
      onHint={onHint}
      disabled={disabled}
    />
  )
  if (!caption) return control
  return (
    <Field>
      <Label htmlFor={field.name}>{caption}</Label>
      {control}
    </Field>
  )
}

/** Text of several lines — a message, a note. The box grows with its text. */
export function TextAreaField({
  field,
  label,
  hint,
  maxLength,
  disabled,
}: {
  field: AnyFieldApi
  label: string
  hint?: ReactNode
  maxLength?: number
  disabled?: boolean
}) {
  const { invalid, describedBy } = fieldState(field, hint)
  return (
    <FieldShell field={field} label={label} hint={hint}>
      <Textarea
        id={field.name}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        name={field.name}
        maxLength={maxLength}
        disabled={disabled}
        value={(field.state.value as string | undefined) ?? ''}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
      />
    </FieldShell>
  )
}

/**
 * A calendar date, held as `YYYY-MM-DD` — or null when `clearable` and cleared, for a
 * date that may be left open.
 */
export function DateInputField({
  field,
  label,
  hint,
  clearable = false,
  disabled,
}: {
  field: AnyFieldApi
  label: string
  hint?: ReactNode
  clearable?: boolean
  disabled?: boolean
}) {
  const { invalid, describedBy } = fieldState(field, hint)
  return (
    <FieldShell field={field} label={label} hint={hint}>
      <DateField
        id={field.name}
        invalid={invalid}
        describedBy={describedBy}
        value={(field.state.value as string | null) ?? undefined}
        label={label}
        clearable={clearable}
        disabled={disabled}
        onChange={(next) => {
          field.handleChange(next ?? null)
          field.handleBlur()
        }}
      />
    </FieldShell>
  )
}

/**
 * A figure typed as text, right-aligned in tabular digits. The value stays the text
 * typed; the caller reads the figure from it. `money` sets the $ before the box and tidies
 * the amount as the box is left — "50" reads "50.00" (`tidyTypedAmount`).
 */
export function FigureField({
  field,
  label,
  hint,
  unit,
  money = false,
  disabled,
}: {
  field: AnyFieldApi
  label: string
  hint?: ReactNode
  /** The unit before the box, for a figure that is not money. */
  unit?: ReactNode
  money?: boolean
  disabled?: boolean
}) {
  const { invalid, describedBy } = fieldState(field, hint)
  return (
    <FieldShell field={field} label={label} hint={hint}>
      <FigureInput
        id={field.name}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        name={field.name}
        unit={money ? '$' : unit}
        disabled={disabled}
        autoComplete="off"
        spellCheck={false}
        value={(field.state.value as string | undefined) ?? ''}
        onBlur={() => {
          field.handleBlur()
          if (money) field.handleChange(tidyTypedAmount((field.state.value as string | undefined) ?? ''))
        }}
        onChange={(e) => field.handleChange(e.target.value)}
      />
    </FieldShell>
  )
}
