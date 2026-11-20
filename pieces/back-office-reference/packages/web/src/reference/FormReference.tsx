// ui-status: pending
// ui-recipe: form-layout.md
import { Combobox, type ComboboxOption } from '@design-pack/ui/components/combobox'
import { ConfirmDialog } from '@design-pack/ui/components/confirm-dialog'
import { DateField, DateRange } from '@design-pack/ui/components/date-field'
import { EntityModal } from '@design-pack/ui/components/entity-modal'
import { Field, FieldError } from '@design-pack/ui/components/field'
import { FieldCard, FieldCardGrid } from '@design-pack/ui/components/field-card'
import { HelpPopover } from '@design-pack/ui/components/help-popover'
import { ModalSection } from '@design-pack/ui/components/modal-shell'
import { PickerDialog } from '@design-pack/ui/components/picker-dialog'
import { PromptDialog } from '@design-pack/ui/components/prompt-dialog'
import { ReadOnlyField } from '@design-pack/ui/components/read-only-field'
import { ReviewDialog } from '@design-pack/ui/components/review-dialog'
import { StatReadout } from '@design-pack/ui/components/stat-readout'
import { StatRow } from '@design-pack/ui/components/stat-row'
import { Subsection } from '@design-pack/ui/components/subsection'
import { SummaryList } from '@design-pack/ui/components/summary-list'
import { TableFrame } from '@design-pack/ui/components/table-frame'
import { DateTimeField, TimeField } from '@design-pack/ui/components/time-field'
import { Alert, AlertDescription } from '@design-pack/ui/components/ui/alert'
import { Badge } from '@design-pack/ui/components/ui/badge'
import { Button } from '@design-pack/ui/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@design-pack/ui/components/ui/card'
import { Checkbox } from '@design-pack/ui/components/ui/checkbox'
import { Label } from '@design-pack/ui/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@design-pack/ui/components/ui/table'
import { useForm } from '@tanstack/react-form'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Building2, LayoutDashboard, MapPin, Moon, Plus, Settings, UserRound } from 'lucide-react'
import { type ComponentProps, type ReactElement, type ReactNode, useEffect, useState } from 'react'
import { FormActions } from '../components/FormActions'
import { FormRow, FormSection, FormShell } from '../components/FormShell'
import { RowActions, RowActionsHead } from '../components/RowActions'
import {
  ComboboxField,
  DateInputField,
  FigureField,
  OptionSwitchField,
  SelectField,
  SwitchField,
  TextAreaField,
  TextField,
} from '../components/fields'
import { UnsavedChangesGuard } from '../form/UnsavedChangesGuard'
import { BackOfficeShell } from './BackOfficeShell'

/**
 * The reference form screen: one customer edited on a full-width form, inside the
 * assembled back office, then cards that lay out the form's pieces in each of their states. Its sections hold each kind of field, its other addresses are
 * edited in a dialog beside their list, and each of the account's actions opens the
 * dialog that asks for it. Every name, figure and date here is invented, and saving
 * writes nothing. It is what the recipe is approved against, and what an app's first real
 * form is compared with.
 */

const MODULES = [
  { key: 'home', label: 'Home', icon: LayoutDashboard, items: [{ key: 'overview', label: 'Overview', href: '#overview' }] },
  {
    key: 'accounts',
    label: 'Accounts',
    icon: Building2,
    items: [
      { key: 'customers', label: 'Customers', href: '#customers' },
      { key: 'invoices', label: 'Invoices', href: '#invoices' },
      { key: 'payments', label: 'Payments', href: '#payments' },
    ],
  },
  {
    key: 'admin',
    label: 'Administration',
    icon: Settings,
    items: [
      { key: 'users', label: 'Users', href: '#users' },
      { key: 'settings', label: 'Settings', href: '#settings' },
    ],
  },
]

const STATES = [
  { value: 'ST', label: 'ST' },
  { value: 'NR', label: 'NR' },
  { value: 'WE', label: 'WE' },
]

const CYCLES = [
  { value: '1', label: 'The 1st of each month' },
  { value: '15', label: 'The 15th of each month' },
  { value: 'quarter', label: 'The 1st of each quarter' },
]

const MANAGERS: ComboboxOption[] = [
  { value: 'u-101', label: 'Sam Rivera', description: 'Accounts' },
  { value: 'u-102', label: 'Riley Brooks', description: 'Accounts' },
  { value: 'u-103', label: 'Casey Castillo', description: 'Collections' },
  { value: 'u-104', label: 'Morgan Dunmore', description: 'Collections' },
  { value: 'u-105', label: 'Quinn Fairbanks', description: 'Accounts', badge: 'Inactive', disabled: true },
]

const PARENTS = [
  { id: 'C-100210', name: 'Avery Holdings', place: 'Springfield, ST' },
  { id: 'C-100355', name: 'Brooks Property Group', place: 'Riverton, ST' },
  { id: 'C-100871', name: 'Castillo Family Trust', place: 'Lakeside, NR' },
  { id: 'C-101044', name: 'Dunmore Partners', place: 'Fairview, NR' },
]

interface Address {
  id: string
  name: string
  street: string
  city: string
  state: string
  zip: string
}

const ADDRESSES: Address[] = [
  { id: 'a-1', name: 'Workshop', street: '7 Example Shore Road', city: 'Lakeside', state: 'NR', zip: '00000' },
  { id: 'a-2', name: 'Storage', street: '300 Example Avenue, Unit 4', city: 'Springfield', state: 'ST', zip: '00000' },
]

const CUSTOMER = {
  active: true,
  name: 'Jordan Avery',
  email: 'jordan.avery@example.com',
  notes: 'Prefers a call before any visit. Gate code is kept by the front office.',
  street: '12 Example Street',
  street2: '',
  city: 'Springfield',
  state: 'ST',
  zip: '00000',
  service: { from: '2021-06-01' } as { from?: string; to?: string },
  cycle: '1',
  manager: 'u-101',
  nextInvoice: '2026-06-01' as string | null,
  creditLimit: '500.00',
  emailStatements: false,
  autopay: true,
  contactName: 'Jordan Avery',
  contactPhone: '555-0142',
  afterHoursPhone: '555-0187',
  afterHoursCalls: false,
  billingContact: 'Avery Holdings',
  billingEmail: 'accounts@example.com',
  reminders: true,
  followUp: '2026-06-03T09:30',
  bestTime: '14:30',
  lateFee: '12.00',
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
const email = ({ value }: { value: string }) => (/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value) ? undefined : 'Enter an email address, such as name@example.com.')
const filledIn =
  (message: string) =>
  ({ value }: { value: string }) =>
    value.trim() ? undefined : message

type Asking = 'statements' | 'link' | 'statement' | 'parent' | 'close' | 'delete'

function CustomerForm() {
  const [saved, setSaved] = useState(false)
  const [asking, setAsking] = useState<Asking | null>(null)
  const [addresses, setAddresses] = useState(ADDRESSES)
  const [editing, setEditing] = useState<Address | 'new' | null>(null)
  const [parent, setParent] = useState<string | null>(null)
  const done = () => setAsking(null)

  const form = useForm({
    defaultValues: CUSTOMER,
    onSubmit: async ({ value }) => {
      setSaved(false)
      await delay(1200)
      form.reset(value)
      setSaved(true)
    },
  })

  return (
    <form.Subscribe selector={(s) => [s.isDefaultValue, s.canSubmit, s.isSubmitting] as const}>
      {([isDefault, canSubmit, isSubmitting]) => (
        <>
          <UnsavedChangesGuard when={!isDefault} />
          <FormShell
            heading="identity"
            width="full"
            icon={UserRound}
            title="Jordan Avery"
            description="Account 100482 · Customer since 2021"
            badges={<Badge variant="muted">Customer</Badge>}
            state={<form.Field name="active">{(field) => <SwitchField field={field} label="Active" />}</form.Field>}
            onSubmit={() => form.handleSubmit()}
            footer={
              <FormActions
                label="Save"
                busyLabel="Saving the customer"
                canSubmit={canSubmit}
                isSubmitting={isSubmitting}
                isDirty={!isDefault}
                succeeded={saved}
                onClose={() => {}}
                secondary={
                  <Button variant="ghost-destructive" onClick={() => setAsking('delete')}>
                    Delete Customer
                  </Button>
                }
              />
            }
          >
            <FormSection first>
              <FormRow columns={3}>
                <form.Field name="name" validators={{ onChange: filledIn('Enter the customer’s name.') }}>
                  {(field) => <TextField field={field} label="Name" />}
                </form.Field>
                <form.Field name="email" validators={{ onChange: email }}>
                  {(field) => <TextField field={field} label="Email" type="email" hint="Invoices and reminders are sent here." />}
                </form.Field>
                <ReadOnlyField label="Account Number" value="100482" />
              </FormRow>
              <form.Field name="notes">{(field) => <TextAreaField field={field} label="Notes" hint="Seen by staff only." />}</form.Field>
            </FormSection>

            <FormSection title="Service Address" description="Where the service is delivered.">
              <FormRow columns={2}>
                <form.Field name="street">{(field) => <TextField field={field} label="Address" />}</form.Field>
                <form.Field name="street2">{(field) => <TextField field={field} label="Address 2" />}</form.Field>
              </FormRow>
              <FormRow columns={3}>
                <form.Field name="city">{(field) => <TextField field={field} label="City" />}</form.Field>
                <form.Field name="state">{(field) => <SelectField field={field} label="State" options={STATES} />}</form.Field>
                <form.Field name="zip">{(field) => <TextField field={field} label="ZIP" maxLength={10} />}</form.Field>
              </FormRow>
              <form.Field name="service">
                {(field) => (
                  <DateRange
                    idPrefix="service"
                    label="Service"
                    ends={{ from: 'Service Began', to: 'Service Ends', reversed: 'Service ends before it began.' }}
                    clearable={{ from: false, to: true }}
                    toHint="Leave empty while the service continues."
                    from={field.state.value.from}
                    to={field.state.value.to}
                    onChange={(next) => field.handleChange(next)}
                  />
                )}
              </form.Field>
            </FormSection>

            <FormSection title="Billing" columns={3}>
              <form.Field name="cycle">{(field) => <SelectField field={field} label="Invoiced On" options={CYCLES} />}</form.Field>
              <form.Field name="manager">
                {(field) => <ComboboxField field={field} label="Account Manager" options={MANAGERS} placeholder="Name or team" />}
              </form.Field>
              <form.Field name="nextInvoice">{(field) => <DateInputField field={field} label="Next Invoice" />}</form.Field>
              <form.Field name="creditLimit">{(field) => <FigureField field={field} label="Credit Limit" money />}</form.Field>
              <ReadOnlyField label="Balance" value="398.15" money hint="Changed by invoices and payments." />
              <form.Field name="emailStatements">
                {(field) => (
                  <OptionSwitchField
                    field={field}
                    caption="Statements"
                    offLabel="On paper"
                    onLabel="By email"
                    confirmOn={() => setAsking('statements')}
                  />
                )}
              </form.Field>
              <form.Field name="autopay">{(field) => <SwitchField field={field} caption="Autopay" label="Charge the card on file" />}</form.Field>
            </FormSection>

            <FormSection title="Contacts" description="Who to reach, and when.">
              <FieldCardGrid>
                <FieldCard title="Primary Contact" icon={UserRound}>
                  <form.Field name="contactName">{(field) => <TextField field={field} label="Name" />}</form.Field>
                  <form.Field name="contactPhone">{(field) => <TextField field={field} label="Phone" type="tel" />}</form.Field>
                </FieldCard>
                <FieldCard title="After Hours" icon={Moon}>
                  <form.Field name="afterHoursPhone">{(field) => <TextField field={field} label="Phone" type="tel" />}</form.Field>
                  <form.Field name="afterHoursCalls">{(field) => <SwitchField field={field} label="Call after 9 PM" />}</form.Field>
                </FieldCard>
                <FieldCard title="Invoices Sent To" icon={Building2}>
                  <form.Field name="billingContact">{(field) => <TextField field={field} label="Name" />}</form.Field>
                  <form.Field name="billingEmail" validators={{ onChange: email }}>
                    {(field) => <TextField field={field} label="Email" type="email" />}
                  </form.Field>
                </FieldCard>
              </FieldCardGrid>
            </FormSection>

            <FormSection title="Reminders">
              <form.Field name="reminders">
                {(field) => <SwitchField field={field} label="Send payment reminders" hint="An email a week after an invoice falls due, then weekly." />}
              </form.Field>
              <Subsection heading="Follow-up Call" aside={<span className="type-metadata text-muted-foreground">Sam Rivera</span>}>
                <FormRow columns={2}>
                  <form.Field name="followUp">
                    {(field) => (
                      <Field>
                        <Label htmlFor="followUp-date">Next Call</Label>
                        <DateTimeField
                          idPrefix="followUp"
                          label="Next Call"
                          minuteStep={15}
                          value={field.state.value || undefined}
                          onChange={(next) => field.handleChange(next ?? '')}
                        />
                      </Field>
                    )}
                  </form.Field>
                  <form.Field name="bestTime">
                    {(field) => (
                      <Field>
                        <Label htmlFor="bestTime">Best Time to Call</Label>
                        <TimeField
                          id="bestTime"
                          label="Best Time to Call"
                          minuteStep={15}
                          value={field.state.value || undefined}
                          onChange={(next) => field.handleChange(next ?? '')}
                        />
                      </Field>
                    )}
                  </form.Field>
                </FormRow>
              </Subsection>
            </FormSection>

            <FormSection title="Other Addresses" description="Each is added and changed on its own, apart from this form's Save.">
              <TableFrame>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Address</TableHead>
                      <TableHead>City</TableHead>
                      <RowActionsHead />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {addresses.map((address) => (
                      <TableRow key={address.id}>
                        <TableCell kind="title">{address.name}</TableCell>
                        <TableCell>{address.street}</TableCell>
                        <TableCell>
                          {address.city}, {address.state} {address.zip}
                        </TableCell>
                        <RowActions subject={address.name} edit={{ onClick: () => setEditing(address) }} />
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableFrame>
              <div className="flex flex-wrap gap-related">
                <Button variant="outline" onClick={() => setEditing('new')}>
                  <Plus />
                  Add Address
                </Button>
              </div>
            </FormSection>

            <FormSection title="Parent Account" description="A customer billed through another: its invoices go on the parent's statement.">
              <p className="type-body text-card-foreground">{parent ?? 'None'}</p>
              <div className="flex flex-wrap gap-related">
                <Button variant="outline" onClick={() => setAsking('parent')}>
                  Choose Parent Account
                </Button>
              </div>
            </FormSection>

            <FormSection title="Account Actions">
              <div className="flex flex-wrap gap-related">
                <Button variant="outline" onClick={() => setAsking('link')}>
                  Send Sign-in Link
                </Button>
                <Button variant="outline" onClick={() => setAsking('statement')}>
                  Statement
                </Button>
                <Button variant="outline" onClick={() => setAsking('close')}>
                  Close Account
                </Button>
              </div>
            </FormSection>

            <FormSection title="Late Fees" collapsible summary={<Badge variant="muted">$12.00 a month</Badge>}>
              <FormRow columns={3}>
                <form.Field name="lateFee">{(field) => <FigureField field={field} label="Monthly Late Fee" money />}</form.Field>
              </FormRow>
              <HelpPopover label="How late fees are charged" title="Late Fees">
                A fee is added once for each month an invoice stays unpaid past its due date, on the day the next invoice is made.
              </HelpPopover>
            </FormSection>
          </FormShell>

          <div className="flex flex-col gap-default px-page-edge pb-6">
            <FieldStatesCard />
            <EntryStatesCard />
            <FormStatesCard />
            <DialogStatesCard />
          </div>

          {asking === 'statements' ? (
            <ConfirmDialog
              title="Send statements by email?"
              description="Paper statements stop. Each statement is emailed to jordan.avery@example.com instead."
              confirmLabel="Email Statements"
              busyLabel="Changing how statements are sent"
              onConfirm={() => {
                form.setFieldValue('emailStatements', true)
                done()
              }}
              onCancel={done}
            />
          ) : null}
          {asking === 'delete' ? (
            <ConfirmDialog
              title="Delete Jordan Avery?"
              description="Their invoices and payments are deleted with them. This reference deletes nothing."
              confirmLabel="Delete Customer"
              cancelLabel="Keep Customer"
              busyLabel="Deleting the customer"
              destructive
              onConfirm={done}
              onCancel={done}
            />
          ) : null}
          {asking === 'link' ? <SignInLink onClose={done} /> : null}
          {asking === 'statement' ? <StatementPrompt onClose={done} /> : null}
          {asking === 'parent' ? (
            <ParentPicker
              onChosen={(name) => {
                setParent(name)
                done()
              }}
              onClose={done}
            />
          ) : null}
          {asking === 'close' ? <CloseAccountReview onClose={done} /> : null}
          {editing ? (
            <AddressModal
              address={editing === 'new' ? null : editing}
              onSaved={(next) => setAddresses((list) => (list.some((a) => a.id === next.id) ? list.map((a) => (a.id === next.id ? next : a)) : [...list, next]))}
              onRemoved={(id) => setAddresses((list) => list.filter((a) => a.id !== id))}
              onClose={() => setEditing(null)}
            />
          ) : null}
        </>
      )}
    </form.Subscribe>
  )
}

/** One of the customer's other addresses, added or changed beside their list. */
function AddressModal({
  address,
  onSaved,
  onRemoved,
  onClose,
}: {
  /** The address being changed, or null for a new one. */
  address: Address | null
  onSaved: (address: Address) => void
  onRemoved: (id: string) => void
  onClose: () => void
}) {
  const [saved, setSaved] = useState(false)
  const form = useForm({
    defaultValues: {
      siteName: address?.name ?? '',
      siteStreet: address?.street ?? '',
      siteCity: address?.city ?? '',
      siteState: address?.state ?? 'ST',
      siteZip: address?.zip ?? '',
    },
    onSubmit: async ({ value }) => {
      setSaved(false)
      await delay(1200)
      onSaved({
        id: address?.id ?? crypto.randomUUID(),
        name: value.siteName,
        street: value.siteStreet,
        city: value.siteCity,
        state: value.siteState,
        zip: value.siteZip,
      })
      // A new address is in the list now: the dialog closes rather than create it twice.
      if (!address) return onClose()
      form.reset(value)
      setSaved(true)
    },
  })

  return (
    <form.Subscribe selector={(s) => [s.isDefaultValue, s.canSubmit, s.isSubmitting] as const}>
      {([isDefault, canSubmit, isSubmitting]) => (
        <EntityModal
          icon={MapPin}
          title={address ? address.name : 'New Address'}
          description="Another place this customer is served."
          saveLabel={address ? 'Save' : 'Create Address'}
          busyLabel="Saving the address"
          isDirty={!isDefault}
          canSave={!isDefault && canSubmit}
          saving={isSubmitting}
          saved={saved}
          onSubmit={() => form.handleSubmit()}
          onClose={onClose}
          remove={
            address
              ? {
                  label: 'Delete Address',
                  question: 'Delete this address?',
                  consequence: 'Its past invoices keep the address they were sent to.',
                  busyLabel: 'Deleting the address',
                  onConfirm: async () => {
                    await delay(1200)
                    onRemoved(address.id)
                    onClose()
                  },
                }
              : undefined
          }
        >
          <ModalSection>
            <form.Field name="siteName" validators={{ onChange: filledIn('Give the address a name.') }}>
              {(field) => <TextField field={field} label="Name" />}
            </form.Field>
            <form.Field name="siteStreet" validators={{ onChange: filledIn('Enter the street address.') }}>
              {(field) => <TextField field={field} label="Address" />}
            </form.Field>
            <FormRow columns={3}>
              <form.Field name="siteCity">{(field) => <TextField field={field} label="City" />}</form.Field>
              <form.Field name="siteState">{(field) => <SelectField field={field} label="State" options={STATES} />}</form.Field>
              <form.Field name="siteZip">{(field) => <TextField field={field} label="ZIP" maxLength={10} />}</form.Field>
            </FormRow>
          </ModalSection>
        </EntityModal>
      )}
    </form.Subscribe>
  )
}

/** One value asked for before an action: where the sign-in link goes. */
function SignInLink({ onClose }: { onClose: () => void }) {
  const [sentTo, setSentTo] = useState<string | null>(null)
  const form = useForm({
    defaultValues: { linkEmail: 'jordan.avery@example.com' },
    onSubmit: async ({ value }) => {
      await delay(1200)
      setSentTo(value.linkEmail)
    },
  })
  return (
    <form.Subscribe selector={(s) => s.isSubmitting}>
      {(isSubmitting) => (
        <PromptDialog
          open
          onOpenChange={(open) => !open && onClose()}
          title="Send a Sign-in Link"
          description="We'll email a link that signs them in once."
          confirmLabel="Send Link"
          busyLabel="Sending the link"
          busy={isSubmitting}
          onSubmit={() => form.handleSubmit()}
          outcome={sentTo ? { title: 'Link Sent', description: `It went to ${sentTo} and works for 30 minutes.` } : undefined}
        >
          <form.Field name="linkEmail" validators={{ onChange: email }}>
            {(field) => <TextField field={field} label="Email" type="email" autoComplete="off" />}
          </form.Field>
        </PromptDialog>
      )}
    </form.Subscribe>
  )
}

/** A report its one choice makes: the statement for a month, opened as a PDF. */
function StatementPrompt({ onClose }: { onClose: () => void }) {
  const [month, setMonth] = useState<string | undefined>('2026-05-01')
  return (
    <PromptDialog
      open
      onOpenChange={(open) => !open && onClose()}
      title="Statement"
      description="Every invoice and payment in the month, as a PDF."
      report={{ href: month ? `#statement-${month}` : null }}
    >
      <Field>
        <Label htmlFor="statement-month">Month Starting</Label>
        <DateField id="statement-month" label="Month Starting" value={month} onChange={setMonth} />
      </Field>
    </PromptDialog>
  )
}

/** One chosen from a list that is searched: the customer this one is billed through. */
function ParentPicker({ onChosen, onClose }: { onChosen: (name: string) => void; onClose: () => void }) {
  const [query, setQuery] = useState('')
  const [choosing, setChoosing] = useState(false)
  const term = query.trim().toLowerCase()
  const shown = PARENTS.filter((p) => `${p.name} ${p.place} ${p.id}`.toLowerCase().includes(term))
  return (
    <PickerDialog
      open
      onOpenChange={(open) => !open && onClose()}
      title="Choose a Parent Account"
      description="The customer whose statement carries this one's invoices."
      searchLabel="Filter customers"
      searchPlaceholder="Name, city or account"
      query={query}
      onQueryChange={setQuery}
      busy={choosing}
      busyLabel="Setting the parent account"
      emptyMessage={shown.length === 0 ? 'No customer matches.' : undefined}
    >
      {shown.map((p) => (
        <li key={p.id}>
          <Button
            variant="row"
            onClick={() => {
              if (choosing) return
              setChoosing(true)
              void delay(800).then(() => onChosen(p.name))
            }}
          >
            <Building2 aria-hidden />
            <span className="flex flex-col">
              <span className="type-row-title">{p.name}</span>
              <span className="type-metadata text-muted-foreground">
                {p.id} · {p.place}
              </span>
            </span>
          </Button>
        </li>
      ))}
    </PickerDialog>
  )
}

/** What closing the account would do, reported before it is done. */
function CloseAccountReview({ onClose }: { onClose: () => void }) {
  const [closing, setClosing] = useState(false)
  const [closed, setClosed] = useState(false)
  return (
    <ReviewDialog
      title="Close Account 100482"
      description={closed ? 'Closed on 05/20/2026. The final invoice is INV-11610.' : 'Nothing has changed yet — this is what closing the account would do.'}
      preview={!closed}
      previewLabel="Not closed yet"
      confirmLabel="Close Account — Final Invoice $398.15"
      busyLabel="Closing the account"
      confirming={closing}
      onConfirm={() => {
        if (closing) return
        setClosing(true)
        void delay(1200).then(() => {
          setClosing(false)
          setClosed(true)
        })
      }}
      onClose={onClose}
    >
      <ModalSection>
        <StatRow columns={3}>
          <StatReadout label="Open Invoices" value="2" />
          <StatReadout label="Balance" value="$398.15" />
          <StatReadout label="Service Ends" value="05/31/2026" />
        </StatRow>
      </ModalSection>
      <ModalSection heading={closed ? 'Done' : 'Needs a Look'}>
        <SummaryList
          rows={[
            { label: 'Autopay', value: closed ? 'Turned off' : 'Turns off' },
            { label: 'Other addresses', value: closed ? '2 ended' : '2 end with the account' },
            { label: 'Reminders', value: closed ? 'Continuing until paid' : 'Continue until the balance is paid' },
          ]}
        />
      </ModalSection>
    </ReviewDialog>
  )
}

/* ---------------------------------------------------------------------------------------
 * Beneath the form: its pieces in each of their states, side by side.
 * ------------------------------------------------------------------------------------- */

/** One piece in a card of states: its name, then each of its states. */
function PieceRow({ caption, children }: { caption: string; children: ReactNode }) {
  return (
    <div className="grid gap-related">
      <span className="type-readout-caption text-muted-foreground">{caption}</span>
      {children}
    </div>
  )
}

/** One state of a piece, named above it. */
function State({ name, children }: { name: string; children: ReactNode }) {
  return (
    <div className="grid gap-tight">
      <span className="type-readout-caption text-muted-foreground">{name}</span>
      {children}
    </div>
  )
}

/** The states of one piece, side by side. */
function StateGrid({ children }: { children: ReactNode }) {
  return <div className="grid items-start gap-default md:grid-cols-2 xl:grid-cols-3">{children}</div>
}

const STATE_VALUES = {
  textIdle: '',
  textFilled: 'jordan.avery@example.com',
  textInvalid: 'jordan.avery@',
  textDisabled: 'jordan.avery@example.com',
  areaIdle: '',
  areaFilled: 'Prefers a call before any visit.\nGate code is kept by the front office.',
  areaInvalid: '',
  areaDisabled: 'Prefers a call before any visit.',
  selectIdle: '',
  selectFilled: '15',
  selectInvalid: '',
  selectDisabled: '15',
  figureIdle: '',
  figureFilled: '500.00',
  figureInvalid: 'five hundred',
  figureDisabled: '500.00',
  switchOff: false,
  switchOn: true,
  switchHint: false,
  switchDisabled: true,
  optionOff: false,
  optionOn: true,
  optionDisabled: false,
}

const INVALID: (keyof typeof STATE_VALUES)[] = ['textInvalid', 'areaInvalid', 'selectInvalid', 'figureInvalid']
const amount = ({ value }: { value: string }) => (/^\d+(\.\d{1,2})?$/.test(value.trim()) ? undefined : 'Enter an amount, such as 45.00.')

/** Each bound field, idle, holding a value, refused and disabled, and a value that is read only. */
function FieldStatesCard() {
  const form = useForm({ defaultValues: STATE_VALUES })

  // A field shows its error once the person has been in it: mark the refused ones so.
  useEffect(() => {
    for (const name of INVALID) form.setFieldMeta(name, (meta) => ({ ...meta, isTouched: true }))
  }, [form])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Field States</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={(event) => event.preventDefault()} className="grid gap-default">
          <PieceRow caption="Text">
            <StateGrid>
              <form.Field name="textIdle">{(field) => <State name="Idle"><TextField field={field} label="Email" type="email" placeholder="name@example.com" /></State>}</form.Field>
              <form.Field name="textFilled">
                {(field) => <State name="With a value and a hint"><TextField field={field} label="Email" type="email" hint="Invoices and reminders are sent here." /></State>}
              </form.Field>
              <form.Field name="textInvalid" validators={{ onMount: email, onChange: email }}>
                {(field) => <State name="With an error"><TextField field={field} label="Email" type="email" /></State>}
              </form.Field>
              <form.Field name="textDisabled">{(field) => <State name="Disabled"><TextField field={field} label="Email" type="email" disabled /></State>}</form.Field>
            </StateGrid>
          </PieceRow>

          <PieceRow caption="Text area">
            <StateGrid>
              <form.Field name="areaIdle">{(field) => <State name="Idle"><TextAreaField field={field} label="Notes" /></State>}</form.Field>
              <form.Field name="areaFilled">{(field) => <State name="With a value and a hint"><TextAreaField field={field} label="Notes" hint="Seen by staff only." /></State>}</form.Field>
              <form.Field name="areaInvalid" validators={{ onMount: filledIn('Say why the account is on hold.'), onChange: filledIn('Say why the account is on hold.') }}>
                {(field) => <State name="With an error"><TextAreaField field={field} label="Notes" /></State>}
              </form.Field>
              <form.Field name="areaDisabled">{(field) => <State name="Disabled"><TextAreaField field={field} label="Notes" disabled /></State>}</form.Field>
            </StateGrid>
          </PieceRow>

          <PieceRow caption="Select">
            <StateGrid>
              <form.Field name="selectIdle">{(field) => <State name="Idle"><SelectField field={field} label="Invoiced On" options={CYCLES} /></State>}</form.Field>
              <form.Field name="selectFilled">{(field) => <State name="With a value"><SelectField field={field} label="Invoiced On" options={CYCLES} /></State>}</form.Field>
              <form.Field name="selectInvalid" validators={{ onMount: filledIn('Choose when invoices are made.'), onChange: filledIn('Choose when invoices are made.') }}>
                {(field) => <State name="With an error"><SelectField field={field} label="Invoiced On" options={CYCLES} /></State>}
              </form.Field>
              <form.Field name="selectDisabled">{(field) => <State name="Disabled"><SelectField field={field} label="Invoiced On" options={CYCLES} disabled /></State>}</form.Field>
            </StateGrid>
          </PieceRow>

          <PieceRow caption="Figure">
            <StateGrid>
              <form.Field name="figureIdle">{(field) => <State name="Idle"><FigureField field={field} label="Credit Limit" money /></State>}</form.Field>
              <form.Field name="figureFilled">{(field) => <State name="With a value"><FigureField field={field} label="Credit Limit" money /></State>}</form.Field>
              <form.Field name="figureInvalid" validators={{ onMount: amount, onChange: amount }}>
                {(field) => <State name="With an error"><FigureField field={field} label="Credit Limit" money /></State>}
              </form.Field>
              <form.Field name="figureDisabled">{(field) => <State name="Disabled"><FigureField field={field} label="Credit Limit" money disabled /></State>}</form.Field>
            </StateGrid>
          </PieceRow>

          <PieceRow caption="Read-only">
            <StateGrid>
              <State name="A value">
                <ReadOnlyField label="Account Number" value="100482" />
              </State>
              <State name="With a hint">
                <ReadOnlyField label="Customer Since" value="06/01/2021" hint="Set when the first service began." />
              </State>
              <State name="A value given as lines — read on one line">
                <ReadOnlyField label="Service Address" value={['12 Example Street', 'Springfield, ST 00000']} />
              </State>
              <State name="Money">
                <ReadOnlyField label="Balance" value="398.15" money />
              </State>
              <State name="Empty">
                <ReadOnlyField label="Parent Account" value={null} />
              </State>
            </StateGrid>
          </PieceRow>

          <PieceRow caption="Switch">
            <StateGrid>
              <form.Field name="switchOff">{(field) => <State name="Off"><SwitchField field={field} label="Send payment reminders" /></State>}</form.Field>
              <form.Field name="switchOn">{(field) => <State name="On, with a caption"><SwitchField field={field} caption="Reminders" label="Send payment reminders" /></State>}</form.Field>
              <form.Field name="switchHint">
                {(field) => <State name="With a hint"><SwitchField field={field} label="Send payment reminders" hint="An email a week after an invoice falls due." /></State>}
              </form.Field>
              <form.Field name="switchDisabled">{(field) => <State name="Disabled"><SwitchField field={field} label="Send payment reminders" disabled /></State>}</form.Field>
            </StateGrid>
          </PieceRow>

          <PieceRow caption="Option switch">
            <StateGrid>
              <form.Field name="optionOff">{(field) => <State name="First option"><OptionSwitchField field={field} offLabel="On paper" onLabel="By email" /></State>}</form.Field>
              <form.Field name="optionOn">
                {(field) => (
                  <State name="Second option, with a caption and a hint">
                    <OptionSwitchField field={field} caption="Statements" offLabel="On paper" onLabel="By email" onHint="Sent to the email above." />
                  </State>
                )}
              </form.Field>
              <form.Field name="optionDisabled">{(field) => <State name="Disabled"><OptionSwitchField field={field} offLabel="On paper" onLabel="By email" disabled /></State>}</form.Field>
            </StateGrid>
          </PieceRow>

          <PieceRow caption="Checkbox">
            <StateGrid>
              <State name="Unchecked">
                <div className="flex items-center gap-2">
                  <Checkbox id="state-check-off" />
                  <Label htmlFor="state-check-off" kind="option">
                    Current
                  </Label>
                </div>
              </State>
              <State name="Checked">
                <div className="flex items-center gap-2">
                  <Checkbox id="state-check-on" defaultChecked />
                  <Label htmlFor="state-check-on" kind="option">
                    Past Due
                  </Label>
                </div>
              </State>
              <State name="With an error">
                <div className="flex items-center gap-2">
                  <Checkbox id="state-check-invalid" aria-invalid />
                  <Label htmlFor="state-check-invalid" kind="option">
                    New
                  </Label>
                </div>
              </State>
              <State name="Disabled">
                <div className="flex items-center gap-2">
                  <Checkbox id="state-check-disabled" defaultChecked disabled />
                  <Label htmlFor="state-check-disabled" kind="option">
                    Archived
                  </Label>
                </div>
              </State>
            </StateGrid>
          </PieceRow>
        </form>
      </CardContent>
    </Card>
  )
}

/** A labelled lookup outside a form: the label follows the input the lookup creates. */
function LookupState({ id, error, ...props }: { id: string; error?: string } & Omit<ComponentProps<typeof Combobox>, 'label' | 'onInputId' | 'describedBy'>) {
  const [inputId, setInputId] = useState<string>()
  return (
    <Field>
      <Label htmlFor={inputId}>Account Manager</Label>
      <Combobox label="Account Manager" onInputId={setInputId} describedBy={error ? `${id}-error` : undefined} {...props} />
      {error ? <FieldError id={`${id}-error`}>{error}</FieldError> : null}
    </Field>
  )
}

/** The date, time and lookup fields, empty, holding a value, refused and disabled. */
function EntryStatesCard() {
  const [held, setHeld] = useState<Record<string, string | undefined>>({
    date: '2026-06-01',
    time: '14:30',
    when: '2026-06-03T09:30',
    manager: 'u-102',
  })
  const hold = (key: string) => (next: string | undefined) => setHeld((prev) => ({ ...prev, [key]: next }))
  const [range, setRange] = useState<{ from?: string; to?: string }>({ from: '2026-03-01', to: '2026-03-31' })
  const [reversed, setReversed] = useState<{ from?: string; to?: string }>({ from: '2026-03-31', to: '2026-03-01' })
  const nothing = () => {}

  return (
    <Card>
      <CardHeader>
        <CardTitle>Date, Time and Lookup Field States</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-default">
          <PieceRow caption="Date field">
            <StateGrid>
              <State name="Empty">
                <Field>
                  <Label htmlFor="state-date-empty">Next Invoice</Label>
                  <DateField id="state-date-empty" label="Next Invoice" value={held.dateEmpty} onChange={hold('dateEmpty')} />
                </Field>
              </State>
              <State name="With a value, clearable">
                <Field>
                  <Label htmlFor="state-date-filled">Next Invoice</Label>
                  <DateField id="state-date-filled" label="Next Invoice" value={held.date} onChange={hold('date')} />
                </Field>
              </State>
              <State name="Required — no clear">
                <Field>
                  <Label htmlFor="state-date-required">Service Began</Label>
                  <DateField id="state-date-required" label="Service Began" value="2021-06-01" clearable={false} onChange={nothing} />
                </Field>
              </State>
              <State name="With an error">
                <Field>
                  <Label htmlFor="state-date-invalid">Service Began</Label>
                  <DateField id="state-date-invalid" label="Service Began" invalid describedBy="state-date-invalid-error" onChange={nothing} />
                  <FieldError id="state-date-invalid-error">Enter the date service began.</FieldError>
                </Field>
              </State>
              <State name="Disabled">
                <Field>
                  <Label htmlFor="state-date-disabled">Service Began</Label>
                  <DateField id="state-date-disabled" label="Service Began" value="2021-06-01" disabled onChange={nothing} />
                </Field>
              </State>
            </StateGrid>
          </PieceRow>

          <PieceRow caption="Date range">
            <div className="grid items-start gap-default md:grid-cols-2">
              <State name="With both ends">
                <DateRange idPrefix="state-range" label="Invoiced" from={range.from} to={range.to} onChange={setRange} />
              </State>
              <State name="The second end before the first — both refused">
                <DateRange idPrefix="state-range-reversed" label="Invoiced" from={reversed.from} to={reversed.to} onChange={setReversed} />
              </State>
              <State name="Ends named by the record, only the last clearable, with a hint">
                <DateRange
                  idPrefix="state-range-named"
                  label="Service"
                  ends={{ from: 'Service Began', to: 'Service Ends', reversed: 'Service ends before it began.' }}
                  clearable={{ from: false, to: true }}
                  toHint="Leave empty while the service continues."
                  from="2021-06-01"
                  onChange={nothing}
                />
              </State>
              <State name="Disabled">
                <DateRange idPrefix="state-range-disabled" label="Invoiced" from="2026-03-01" to="2026-03-31" disabled onChange={nothing} />
              </State>
            </div>
          </PieceRow>

          <PieceRow caption="Time field">
            <StateGrid>
              <State name="Empty">
                <Field>
                  <Label htmlFor="state-time-empty">Best Time to Call</Label>
                  <TimeField id="state-time-empty" label="Best Time to Call" value={held.timeEmpty} onChange={hold('timeEmpty')} />
                </Field>
              </State>
              <State name="With a value, on 15-minute steps">
                <Field>
                  <Label htmlFor="state-time-filled">Best Time to Call</Label>
                  <TimeField id="state-time-filled" label="Best Time to Call" minuteStep={15} value={held.time} onChange={hold('time')} />
                </Field>
              </State>
              <State name="With an error">
                <Field>
                  <Label htmlFor="state-time-invalid">Best Time to Call</Label>
                  <TimeField id="state-time-invalid" label="Best Time to Call" invalid describedBy="state-time-invalid-error" onChange={nothing} />
                  <FieldError id="state-time-invalid-error">Enter a time between 8 AM and 6 PM.</FieldError>
                </Field>
              </State>
              <State name="Disabled">
                <Field>
                  <Label htmlFor="state-time-disabled">Best Time to Call</Label>
                  <TimeField id="state-time-disabled" label="Best Time to Call" value="08:00" disabled onChange={nothing} />
                </Field>
              </State>
            </StateGrid>
          </PieceRow>

          <PieceRow caption="Date with its time">
            <StateGrid>
              <State name="With a value">
                <Field>
                  <Label htmlFor="state-when-date">Next Call</Label>
                  <DateTimeField idPrefix="state-when" label="Next Call" minuteStep={15} value={held.when} onChange={hold('when')} />
                </Field>
              </State>
              <State name="With an error">
                <Field>
                  <Label htmlFor="state-when-invalid-date">Next Call</Label>
                  <DateTimeField idPrefix="state-when-invalid" label="Next Call" invalid describedBy="state-when-invalid-error" onChange={nothing} />
                  <FieldError id="state-when-invalid-error">Choose when the call is.</FieldError>
                </Field>
              </State>
              <State name="Disabled">
                <Field>
                  <Label htmlFor="state-when-disabled-date">Next Call</Label>
                  <DateTimeField idPrefix="state-when-disabled" label="Next Call" value="2026-06-03T09:30" disabled onChange={nothing} />
                </Field>
              </State>
            </StateGrid>
          </PieceRow>

          <PieceRow caption="Lookup">
            <StateGrid>
              <State name="Empty">
                <LookupState id="state-lookup-empty" value={held.managerEmpty ?? ''} onValueChange={hold('managerEmpty')} options={MANAGERS} placeholder="Name or team" />
              </State>
              <State name="With a value, clearable">
                <LookupState id="state-lookup-chosen" value={held.manager ?? ''} onValueChange={hold('manager')} options={MANAGERS} />
              </State>
              <State name="Loading its choices">
                <LookupState id="state-lookup-loading" value="" onValueChange={nothing} options={[]} isLoading />
              </State>
              <State name="Its choices could not be read">
                <LookupState id="state-lookup-failed" value="" onValueChange={nothing} options={[]} isError />
              </State>
              <State name="With an error">
                <LookupState id="state-lookup-invalid" value="" onValueChange={nothing} options={MANAGERS} invalid error="Choose an account manager." />
              </State>
              <State name="Disabled">
                <LookupState id="state-lookup-disabled" value="u-103" onValueChange={nothing} options={MANAGERS} disabled />
              </State>
            </StateGrid>
          </PieceRow>
        </div>
      </CardContent>
    </Card>
  )
}

const ACTION_STATES: { caption: string; props: ComponentProps<typeof FormActions> }[] = [
  { caption: 'Clean — nothing to save', props: { label: 'Save', busyLabel: 'Saving the customer', canSubmit: true, isSubmitting: false, isDirty: false, succeeded: false, onClose: () => {} } },
  { caption: 'Changed — unsaved changes', props: { label: 'Save', busyLabel: 'Saving the customer', canSubmit: true, isSubmitting: false, isDirty: true, succeeded: false, onClose: () => {} } },
  { caption: 'Saving', props: { label: 'Save', busyLabel: 'Saving the customer', canSubmit: true, isSubmitting: true, isDirty: true, succeeded: false, onClose: () => {} } },
  { caption: 'Saved', props: { label: 'Save', busyLabel: 'Saving the customer', canSubmit: true, isSubmitting: false, isDirty: false, succeeded: true, onClose: () => {} } },
  {
    caption: 'Failed — the failure above the buttons',
    props: {
      label: 'Save',
      busyLabel: 'Saving the customer',
      canSubmit: true,
      isSubmitting: false,
      isDirty: true,
      succeeded: false,
      onClose: () => {},
      failure: "Trouble saving — your changes weren't applied. Try again.",
    },
  },
  {
    caption: 'Creating, with a further action after Close',
    props: {
      label: 'Create Customer',
      busyLabel: 'Creating the customer',
      canSubmit: true,
      isSubmitting: false,
      isDirty: true,
      succeeded: false,
      onClose: () => {},
      secondary: <Button variant="ghost-destructive">Delete Draft</Button>,
    },
  },
  { caption: 'An action — no unsaved-changes gate', props: { label: 'Send Test Reminder', busyLabel: 'Sending the test reminder', mode: 'action', canSubmit: true, isSubmitting: false, isDirty: false, succeeded: false } },
  { caption: 'An action, running', props: { label: 'Send Test Reminder', busyLabel: 'Sending the test reminder', mode: 'action', canSubmit: true, isSubmitting: true, isDirty: false, succeeded: false } },
]

/** The form's action bar in each state, then the form's own frame while loading and failed. */
function FormStatesCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Form States</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-default">
          {ACTION_STATES.map((row) => (
            <PieceRow key={row.caption} caption={row.caption}>
              <form onSubmit={(event) => event.preventDefault()}>
                <FormActions {...row.props} />
              </form>
            </PieceRow>
          ))}
          <PieceRow caption="The form while it loads — placeholders, after a short delay">
            <FormShell heading="identity" title="Jordan Avery" isPending skeletonRows={3} />
          </PieceRow>
          <PieceRow caption="The form when it could not be loaded">
            <FormShell heading="identity" title="Jordan Avery" isError />
          </PieceRow>
        </div>
      </CardContent>
    </Card>
  )
}

type DialogState =
  | 'address-saving'
  | 'address-failed'
  | 'confirm-busy'
  | 'review-blocked'
  | 'review-confirming'
  | 'review-done'
  | 'prompt-busy'
  | 'prompt-failed'
  | 'report-unavailable'
  | 'picker-loading'
  | 'picker-none'
  | 'picker-failed'
  | 'picker-busy'

const DIALOG_STATES: { caption: string; buttons: { key: DialogState; label: string }[] }[] = [
  {
    caption: 'Address dialog',
    buttons: [
      { key: 'address-saving', label: 'Saving' },
      { key: 'address-failed', label: 'Save Failed' },
    ],
  },
  { caption: 'Confirmation', buttons: [{ key: 'confirm-busy', label: 'Confirming' }] },
  {
    caption: 'Close Account review',
    buttons: [
      { key: 'review-blocked', label: 'Blocked' },
      { key: 'review-confirming', label: 'Confirming' },
      { key: 'review-done', label: 'Done' },
    ],
  },
  {
    caption: 'Sign-in link and statement prompts',
    buttons: [
      { key: 'prompt-busy', label: 'Sending' },
      { key: 'prompt-failed', label: 'Send Failed' },
      { key: 'report-unavailable', label: 'Report Unavailable' },
    ],
  },
  {
    caption: 'Parent account picker',
    buttons: [
      { key: 'picker-loading', label: 'Loading' },
      { key: 'picker-none', label: 'Nothing Matches' },
      { key: 'picker-failed', label: 'Choice Failed' },
      { key: 'picker-busy', label: 'Acting on a Choice' },
    ],
  },
]

/** The dialog states a person cannot reach by opening one: each button opens its dialog already in that state. */
function DialogStatesCard() {
  const [open, setOpen] = useState<DialogState | null>(null)
  return (
    <Card>
      <CardHeader>
        <CardTitle>Dialog States</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-default">
          {DIALOG_STATES.map((row) => (
            <PieceRow key={row.caption} caption={row.caption}>
              <div className="flex flex-wrap items-center gap-related">
                {row.buttons.map((button) => (
                  <Button key={button.key} variant="outline" onClick={() => setOpen(button.key)}>
                    {button.label}
                  </Button>
                ))}
              </div>
            </PieceRow>
          ))}
        </div>
        {open ? <DialogInState which={open} onClose={() => setOpen(null)} /> : null}
      </CardContent>
    </Card>
  )
}

function DialogInState({ which, onClose }: { which: DialogState; onClose: () => void }) {
  const shut = (open: boolean) => !open && onClose()
  switch (which) {
    case 'address-saving':
    case 'address-failed':
      return <AddressInState failed={which === 'address-failed'} onClose={onClose} />
    case 'confirm-busy':
      return (
        <ConfirmDialog
          title="Delete Jordan Avery?"
          description="Their invoices and payments are deleted with them."
          confirmLabel="Delete Customer"
          cancelLabel="Keep Customer"
          busyLabel="Deleting the customer"
          destructive
          confirming
          onConfirm={() => {}}
          onCancel={onClose}
        />
      )
    case 'review-blocked':
    case 'review-confirming':
    case 'review-done':
      return (
        <ReviewDialog
          title="Close Account 100482"
          description={which === 'review-done' ? 'Closed on 05/20/2026. The final invoice is INV-11610.' : 'Nothing has changed yet — this is what closing the account would do.'}
          preview={which !== 'review-done'}
          previewLabel="Not closed yet"
          confirmLabel="Close Account — Final Invoice $398.15"
          busyLabel="Closing the account"
          confirming={which === 'review-confirming'}
          confirmDisabled={which === 'review-blocked'}
          onConfirm={() => {}}
          onClose={onClose}
        >
          <ModalSection>
            <StatRow columns={3}>
              <StatReadout label="Open Invoices" value="2" />
              <StatReadout label="Balance" value="$398.15" />
              <StatReadout label="Service Ends" value="05/31/2026" />
            </StatRow>
          </ModalSection>
          {which === 'review-blocked' ? (
            <ModalSection heading="Fix Before Closing">
              <Alert variant="destructive">
                <AlertDescription>A payment is still being processed, so the account can't be closed yet.</AlertDescription>
              </Alert>
              <SummaryList rows={[{ label: 'PMT-77402', value: '$201.75', error: 'Wait for this payment to clear, or cancel it.' }]} />
            </ModalSection>
          ) : (
            <ModalSection heading={which === 'review-done' ? 'Done' : 'Needs a Look'}>
              <SummaryList
                rows={[
                  { label: 'Autopay', value: which === 'review-done' ? 'Turned off' : 'Turns off' },
                  { label: 'Other addresses', value: which === 'review-done' ? '2 ended' : '2 end with the account' },
                ]}
              />
            </ModalSection>
          )}
        </ReviewDialog>
      )
    case 'prompt-busy':
    case 'prompt-failed':
      return <LinkInState failed={which === 'prompt-failed'} onClose={onClose} />
    case 'report-unavailable':
      return (
        <PromptDialog
          open
          onOpenChange={shut}
          title="Statement"
          description="Every invoice and payment in the month, as a PDF."
          report={{ href: null }}
          failure="June has no invoices or payments yet, so there is no statement to open."
        >
          <Field>
            <Label htmlFor="state-statement-month">Month Starting</Label>
            <DateField id="state-statement-month" label="Month Starting" value="2026-06-01" onChange={() => {}} />
          </Field>
        </PromptDialog>
      )
    default:
      return (
        <PickerDialog
          open
          onOpenChange={shut}
          title="Choose a Parent Account"
          description="The customer whose statement carries this one's invoices."
          searchLabel="Filter customers"
          searchPlaceholder="Name, city or account"
          query={which === 'picker-none' ? 'zz' : ''}
          onQueryChange={() => {}}
          busy={which === 'picker-busy'}
          busyLabel="Setting the parent account"
          banner={
            which === 'picker-failed' ? (
              <Alert variant="destructive">
                <AlertDescription>That customer couldn't be set as the parent. Try again.</AlertDescription>
              </Alert>
            ) : null
          }
          emptyMessage={which === 'picker-loading' ? 'Loading…' : which === 'picker-none' ? 'No customer matches.' : undefined}
        >
          {PARENTS.map((p) => (
            <li key={p.id}>
              <Button variant="row">
                <Building2 aria-hidden />
                <span className="flex flex-col">
                  <span className="type-row-title">{p.name}</span>
                  <span className="type-metadata text-muted-foreground">
                    {p.id} · {p.place}
                  </span>
                </span>
              </Button>
            </li>
          ))}
        </PickerDialog>
      )
  }
}

/** The address dialog held while it saves, or after a save that failed. */
function AddressInState({ failed, onClose }: { failed: boolean; onClose: () => void }) {
  const form = useForm({ defaultValues: { siteName: 'Workshop', siteStreet: '7 Example Shore Road', siteCity: 'Lakeside' } })
  return (
    <EntityModal
      icon={MapPin}
      title="Workshop"
      description="Another place this customer is served."
      busyLabel="Saving the address"
      isDirty
      canSave
      saving={!failed}
      saved={false}
      failure={failed ? "Trouble saving — your changes weren't applied. Try again." : null}
      onSubmit={() => {}}
      onClose={onClose}
    >
      <ModalSection>
        <form.Field name="siteName">{(field) => <TextField field={field} label="Name" />}</form.Field>
        <form.Field name="siteStreet">{(field) => <TextField field={field} label="Address" />}</form.Field>
        <form.Field name="siteCity">{(field) => <TextField field={field} label="City" />}</form.Field>
      </ModalSection>
    </EntityModal>
  )
}

/** The sign-in link prompt held while it sends, or after a send that failed. */
function LinkInState({ failed, onClose }: { failed: boolean; onClose: () => void }) {
  const form = useForm({ defaultValues: { linkEmail: 'jordan.avery@example.com' } })
  return (
    <PromptDialog
      open
      onOpenChange={(open) => !open && onClose()}
      title="Send a Sign-in Link"
      description="We'll email a link that signs them in once."
      confirmLabel="Send Link"
      busyLabel="Sending the link"
      busy={!failed}
      onSubmit={() => {}}
      failure={failed ? "That link didn't send. Check the address and try again." : null}
    >
      <form.Field name="linkEmail">{(field) => <TextField field={field} label="Email" type="email" autoComplete="off" />}</form.Field>
    </PromptDialog>
  )
}

/**
 * The whole reference: mount it on a temporary route of the back-office app. Pass `brand`
 * the app's own home link and product mark, so the top bar is judged with it.
 */
export function FormReference({ brand }: { brand?: ReactElement }) {
  const [queryClient] = useState(() => new QueryClient())
  return (
    <QueryClientProvider client={queryClient}>
      <BackOfficeShell
        brand={
          brand ?? (
            <a href="#overview" aria-label="Home" className="type-row-title text-card-foreground">
              Back Office
            </a>
          )
        }
        modules={MODULES}
        activeSection="accounts"
        activeKey="accounts/customers"
        person={{ name: 'Sam Rivera', detail: 'sam.rivera@example.com' }}
        signOut={{ leave: () => {}, leaving: false, problem: null }}
      >
        <CustomerForm />
      </BackOfficeShell>
    </QueryClientProvider>
  )
}
