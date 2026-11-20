// ui-status: pending
// ui-recipe: browse-layout.md
import { BrowseToolbar } from '@design-pack/ui/components/browse-toolbar'
import { BusySlot } from '@design-pack/ui/components/busy-status'
import { ConfirmDialog } from '@design-pack/ui/components/confirm-dialog'
import { DetailPanel } from '@design-pack/ui/components/detail-panel'
import { EmptyState } from '@design-pack/ui/components/empty-state'
import { ExpandableRow } from '@design-pack/ui/components/expandable-row'
import { FacetChecklist } from '@design-pack/ui/components/facet-checklist'
import { type FilterChip, FilterChips } from '@design-pack/ui/components/filter-chips'
import { ModalShell } from '@design-pack/ui/components/modal-shell'
import { RestrictedValue } from '@design-pack/ui/components/restricted-value'
import { RowActionsMenu } from '@design-pack/ui/components/row-actions-menu'
import { Subsection } from '@design-pack/ui/components/subsection'
import { SummaryList } from '@design-pack/ui/components/summary-list'
import { Badge } from '@design-pack/ui/components/ui/badge'
import { Button } from '@design-pack/ui/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@design-pack/ui/components/ui/card'
import { DropdownMenuItem } from '@design-pack/ui/components/ui/dropdown-menu'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@design-pack/ui/components/ui/table'
import { type ViewTab, ViewTabs } from '@design-pack/ui/components/view-tabs'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Building2, Eye, LayoutDashboard, Mail, Plus, Printer, Settings, Users } from 'lucide-react'
import { type ReactElement, type ReactNode, useEffect, useMemo, useState } from 'react'
import { type FilterField, type FilterState, type FilterValue, filterChips } from '../browse/advancedFilter'
import { blockInMemory } from '../browse/browseRows'
import type { BrowseSettings, BrowseSort } from '../browse/browseSettings'
import { type BrowseSource, useBrowseData } from '../browse/useBrowseData'
import { type BrowsePagerProps, useBrowsePaging } from '../browse/useBrowsePaging'
import { type BrowseSettingsStore, useBrowseSettings } from '../browse/useBrowseSettings'
import { FIT } from '../browse/useFitPageSize'
import { AdvancedFilter } from '../components/AdvancedFilter'
import { BrowsePager } from '../components/BrowsePager'
import { BrowseScreen } from '../components/BrowseScreen'
import { type BrowseColumn, BrowseTable } from '../components/BrowseTable'
import { IconLink } from '../components/IconLink'
import { RowActions } from '../components/RowActions'
import { BackOfficeShell } from './BackOfficeShell'

/**
 * The reference browse: a list of customers inside the assembled back office, searched,
 * filtered, sorted and paged, each row read in place and acted on from its own actions,
 * then cards that lay out the browse's pieces in each of their variants and states.
 * Every name, address, amount and date here is invented, and nothing is read from a
 * server. It is what the recipe is approved against, and what an app's first real browse
 * is compared with.
 */

// ── Invented customers ──────────────────────────────────────────────────────────────

type Plan = 'basic' | 'standard' | 'plus'
type Standing = 'current' | 'pastdue' | 'new'
type View = 'active' | 'review' | 'archived'

interface Customer {
  id: string
  account: string
  name: string
  email: string
  city: string
  state: string
  plan: Plan
  standing: Standing
  /** Cents. */
  balance: number
  /** `YYYY-MM-DD`. */
  joined: string
  /** `YYYY-MM-DD`. */
  lastInvoice: string
  paperless: boolean
  autopay: boolean
  archived: boolean
  review: boolean
}

const FIRST = ['Jordan', 'Riley', 'Casey', 'Morgan', 'Avery', 'Quinn', 'Harper', 'Rowan', 'Emerson', 'Sage', 'Parker', 'Reese', 'Dakota', 'Hayden', 'Skyler', 'Finley']
const LAST = ['Avery', 'Brooks', 'Castillo', 'Dunmore', 'Ellison', 'Fairbanks', 'Greer', 'Holloway', 'Ingram', 'Jaramillo', 'Kessler', 'Lindqvist', 'Marlowe', 'Nakamura', 'Okafor']
const PLACES: ReadonlyArray<readonly [string, string]> = [
  ['Springfield', 'ST'],
  ['Riverton', 'ST'],
  ['Lakeside', 'NR'],
  ['Fairview', 'NR'],
  ['Maple Grove', 'ST'],
  ['Oak Hollow', 'WE'],
  ['Cedar Bluff', 'WE'],
  ['Pinecrest', 'NR'],
  ['Brookfield', 'ST'],
  ['Willow Bend', 'WE'],
]
const PLANS: Plan[] = ['basic', 'standard', 'plus']
const STANDINGS: Standing[] = ['current', 'current', 'pastdue', 'new']
const pad = (n: number) => String(n).padStart(2, '0')

const CUSTOMERS: Customer[] = Array.from({ length: 120 }, (_, i) => {
  const first = FIRST[i % FIRST.length] ?? 'Jordan'
  const last = LAST[(i * 7) % LAST.length] ?? 'Avery'
  const [city, state] = PLACES[(i * 3) % PLACES.length] ?? ['Springfield', 'ST']
  const standing = STANDINGS[(i * 5) % 4] ?? 'current'
  return {
    id: String(1000 + i),
    account: `C-${100400 + i * 13}`,
    name: `${first} ${last}`,
    email: `${first}.${last}${i}`.toLowerCase().concat('@example.com'),
    city,
    state,
    plan: PLANS[i % 3] ?? 'basic',
    standing,
    balance: standing === 'new' ? 0 : (i * 7919) % 64000,
    joined: `20${pad(18 + (i % 8))}-${pad(1 + (i % 12))}-${pad(1 + ((i * 3) % 28))}`,
    lastInvoice: `2026-${pad(1 + ((i * 5) % 10))}-${pad(1 + ((i * 11) % 28))}`,
    paperless: i % 2 === 0,
    autopay: i % 3 !== 0,
    archived: i % 9 === 4,
    review: i % 11 === 3,
  }
})

const PLAN_LABEL: Record<Plan, string> = { basic: 'Basic', standard: 'Standard', plus: 'Plus' }
const PLAN_FEE: Record<Plan, number> = { basic: 4500, standard: 9000, plus: 16200 }
const STANDING_LABEL: Record<Standing, string> = { current: 'Current', pastdue: 'Past Due', new: 'New' }
const STANDING_BADGE: Record<Standing, 'success' | 'warning' | 'data'> = { current: 'success', pastdue: 'warning', new: 'data' }

const money = (cents: number) => (cents / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD' })
/** `YYYY-MM-DD` as the back office writes a date, with no clock or zone involved. */
const shortDate = (iso: string) => {
  const [y, m, d] = iso.split('-')
  return `${m}/${d}/${y}`
}

const sortValue = (row: Customer, id: string): string | number | null => {
  switch (id) {
    case 'name':
      return row.name
    case 'account':
      return row.account
    case 'city':
      return row.city
    case 'lastInvoice':
      return row.lastInvoice
    case 'balance':
      return row.balance
    case 'joined':
      return row.joined
    default:
      return null
  }
}

// ── The list's filter ───────────────────────────────────────────────────────────────

const FIELDS: readonly FilterField[] = [
  { id: 'email', kind: 'text', label: 'Email', placeholder: 'Part of an email address' },
  { id: 'plan', kind: 'select', label: 'Plan', options: PLANS.map((p) => ({ value: p, label: PLAN_LABEL[p] })) },
  {
    id: 'standing',
    kind: 'multi',
    label: 'Standing',
    options: (['current', 'pastdue', 'new'] as const).map((s) => ({ value: s, label: STANDING_LABEL[s] })),
    defaults: ['current', 'pastdue'],
  },
  {
    id: 'billing',
    kind: 'select',
    label: 'Statements',
    options: [
      { value: 'paper', label: 'On paper' },
      { value: 'email', label: 'By email' },
    ],
  },
  {
    id: 'city',
    kind: 'select',
    label: 'City',
    group: 'Address',
    searchable: true,
    options: PLACES.map(([city]) => ({ value: city, label: city })),
  },
  {
    id: 'state',
    kind: 'select',
    label: 'State',
    group: 'Address',
    options: [...new Set(PLACES.map(([, state]) => state))].map((s) => ({ value: s, label: s })),
  },
  { id: 'balance', kind: 'numberRange', label: 'Balance', group: 'Account', wide: true },
  { id: 'joined', kind: 'dateRange', label: 'Joined', group: 'Account', wide: true },
  { id: 'paperless', kind: 'switch', label: 'Paperless only', group: 'Account', secondColumn: true },
  { id: 'autopay', kind: 'switch', label: 'On autopay only', group: 'Account', secondColumn: true },
]

interface Query {
  view: View
  fields: FilterState
}

function inView(row: Customer, view: View) {
  if (view === 'archived') return row.archived
  if (view === 'review') return row.review && !row.archived
  return !row.archived
}

function matchesField(row: Customer, field: FilterField, value: FilterValue | undefined): boolean {
  if (value === undefined) {
    // A multi-pick that narrows by default narrows while unset.
    return field.kind === 'multi' && field.defaults ? field.defaults.includes(row.standing) : true
  }
  switch (field.id) {
    case 'email':
      return row.email.includes(String(value).toLowerCase())
    case 'plan':
      return row.plan === value
    case 'standing':
      return Array.isArray(value) && value.includes(row.standing)
    case 'billing':
      return (value === 'email') === row.paperless
    case 'city':
      return row.city === value
    case 'state':
      return row.state === value
    case 'balance': {
      const { min, max } = value as { min?: number; max?: number }
      const dollars = row.balance / 100
      return (min === undefined || dollars >= min) && (max === undefined || dollars <= max)
    }
    case 'joined': {
      const { from, to } = value as { from?: string; to?: string }
      return (!from || row.joined >= from) && (!to || row.joined <= to)
    }
    case 'paperless':
      return row.paperless
    case 'autopay':
      return row.autopay
    default:
      return true
  }
}

function matching(search: string | undefined, query: Query) {
  const term = search?.trim().toLowerCase()
  return CUSTOMERS.filter(
    (row) =>
      inView(row, query.view) &&
      (!term || [row.name, row.email, row.city, row.account].some((v) => v.toLowerCase().includes(term))) &&
      FIELDS.every((field) => matchesField(row, field, query.fields[field.id])),
  )
}

/** A short wait, so the list's loading sign can be seen on a search, a sort or a page. */
const pause = () => new Promise((resolve) => setTimeout(resolve, 400))

const SOURCE: BrowseSource<Customer, Query> = {
  key: ['reference-browse', 'customers'],
  rows: async ({ search, filter, sort, offset, limit }) => {
    await pause()
    return blockInMemory(matching(search, filter), { sort, offset, limit }, sortValue, (row) => row.id)
  },
  count: async ({ search, filter }) => {
    await pause()
    return matching(search, filter).length
  },
}

// ── The list's columns ──────────────────────────────────────────────────────────────

const COLUMNS: BrowseColumn<Customer>[] = [
  { id: 'name', label: 'Customer', width: 170, sortable: true, kind: 'title', cell: (r) => r.name },
  { id: 'account', label: 'Account', width: 100, sortable: true, kind: 'key', cell: (r) => r.account },
  { id: 'email', label: 'Email', width: 220, secondary: true, cell: (r) => r.email },
  { id: 'city', label: 'City', width: 130, sortable: true, cell: (r) => `${r.city}, ${r.state}` },
  { id: 'plan', label: 'Plan', width: 90, cell: (r) => PLAN_LABEL[r.plan] },
  { id: 'standing', label: 'Standing', width: 100, cell: (r) => <Badge variant={STANDING_BADGE[r.standing]}>{STANDING_LABEL[r.standing]}</Badge> },
  { id: 'joined', label: 'Joined', width: 100, sortable: true, kind: 'number', cell: (r) => shortDate(r.joined) },
  { id: 'lastInvoice', label: 'Last Invoiced', width: 110, sortable: true, descendingFirst: true, kind: 'number', cell: (r) => shortDate(r.lastInvoice) },
  { id: 'balance', label: 'Balance', width: 100, sortable: true, descendingFirst: true, kind: 'amount', cell: (r) => money(r.balance) },
  // Withheld from the person signed in: masked in its place, never left out.
  { id: 'credit', label: 'Credit Limit', width: 130, kind: 'amount', cell: () => <RestrictedValue width="8ch" label="Credit limit" /> },
]

const DEFAULTS = {
  columns: COLUMNS.map((c) => c.id),
  hidden: ['email', 'joined'],
  sort: { id: 'name', desc: false },
  sortable: COLUMNS.filter((c) => c.sortable).map((c) => c.id),
}

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

/** A person's layout for the list, kept for the life of the page; an app saves it. */
function memoryStore(): BrowseSettingsStore {
  const saved = new Map<string, BrowseSettings>()
  return {
    get: async ({ data }) => saved.get(data.key) ?? null,
    save: async ({ data }) => {
      saved.set(data.key, data.settings)
    },
  }
}

const noop = () => {}

// ── The browse ──────────────────────────────────────────────────────────────────────

function CustomerBrowse() {
  const [store] = useState(memoryStore)
  const layout = useBrowseSettings('reference-browse-customers', DEFAULTS, store)
  const [view, setView] = useState<View>('active')
  const [search, setSearch] = useState<string | undefined>(undefined)
  // One filter set as the screen arrives, so its chip is there to be judged.
  const [fields, setFields] = useState<FilterState>({ paperless: true })
  const [chosenSort, setChosenSort] = useState<BrowseSort | null>(null)
  const [page, setPage] = useState(1)
  const [size, setSize] = useState<number | undefined>(undefined)
  const [filtering, setFiltering] = useState(false)
  const [deleting, setDeleting] = useState<Customer | null>(null)
  const [invoicesOf, setInvoicesOf] = useState<Customer | null>(null)
  const [reminding, setReminding] = useState<string | null>(null)
  const [downloading, setDownloading] = useState<string | null>(null)

  // Nothing is sent or made here: each stands busy for a moment, then is done.
  useEffect(() => {
    if (!reminding && !downloading) return
    const done = setTimeout(() => {
      setReminding(null)
      setDownloading(null)
    }, 2500)
    return () => clearTimeout(done)
  }, [reminding, downloading])

  const sort = chosenSort ?? layout.settings.sort
  const pageSize = size ?? 20
  const data = useBrowseData(SOURCE, { search, filter: { view, fields }, sort }, page, pageSize)
  const paging = useBrowsePaging<Customer>({
    rows: data.rows ?? [],
    total: data.total,
    pageSize,
    storageKey: 'reference-browse-customers',
    noun: 'customer',
    page,
    size,
    onRefit: setSize,
    onChooseSize: (next) => {
      setSize(next ?? undefined)
      setPage(1)
    },
    onGoToPage: setPage,
  })

  const applyFilter = (next: FilterState) => {
    setFields(next)
    setPage(1)
  }
  const chips = filterChips(FIELDS, fields, applyFilter)
  const counts = useMemo(() => {
    const count = (v: View) => CUSTOMERS.filter((row) => inView(row, v)).length
    return { active: count('active'), review: count('review'), archived: count('archived') }
  }, [])
  const tabs: ViewTab<View>[] = [
    { value: 'active', label: 'Active', count: counts.active },
    { value: 'review', label: 'Needs Review', count: counts.review, attention: true },
    { value: 'archived', label: 'Archived', count: counts.archived },
  ]

  return (
    <BrowseScreen>
      <BrowseToolbar
        icon={Users}
        title="Customers"
        searchPlaceholder="Name, email, city or account"
        searchTerm={search ?? ''}
        searching={data.loading}
        onSearch={(next) => {
          setSearch(next)
          setPage(1)
        }}
        filterCount={chips.length}
        onFilter={() => setFiltering(true)}
        actions={
          <Button>
            <Plus />
            Add Customer
          </Button>
        }
      />
      <ViewTabs
        label="Which customers"
        value={view}
        onChange={(next) => {
          setView(next)
          setPage(1)
        }}
        tabs={tabs}
      />
      <FilterChips chips={chips} />
      <BrowseTable
        columns={COLUMNS}
        rows={data.rows === undefined ? undefined : paging.rows}
        getRowId={(row) => row.id}
        sort={sort}
        onSort={(next) => {
          layout.sortChosen(next)
          setChosenSort(next)
          setPage(1)
        }}
        layout={layout}
        expand={{ label: 'the account summary', detail: (row) => <AccountSummary customer={row} /> }}
        actions={(row) => (
          <RowActions
            subject={row.name}
            edit={{ onClick: noop }}
            report={{ label: `Statement for ${row.name}`, href: `#statement-${row.account}` }}
            download={{
              label: `Download the latest invoice for ${row.name}`,
              onClick: () => setDownloading(row.id),
              busy: downloading === row.id ? `Preparing the invoice for ${row.name}` : undefined,
            }}
            remove={{ onClick: () => setDeleting(row) }}
            menu={
              <>
                <DropdownMenuItem onSelect={() => setInvoicesOf(row)}>Recent Invoices</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setReminding(row.id)}>Send Reminder</DropdownMenuItem>
              </>
            }
            menuBusy={reminding === row.id ? `Sending a reminder to ${row.name}` : undefined}
          />
        )}
        empty={view === 'archived' ? 'No archived customers match.' : 'No customers match. Try part of the name, or fewer filters.'}
        failure={data.failure ? { ...data.failure, general: "The customers couldn't be loaded, so the list can't be shown." } : null}
      />
      <BrowsePager pager={paging.pager} />

      <BrowseStateCards />

      {filtering ? <AdvancedFilter title="Customers" fields={FIELDS} value={fields} onApply={applyFilter} onClose={() => setFiltering(false)} /> : null}
      {invoicesOf ? <RecentInvoices customer={invoicesOf} onClose={() => setInvoicesOf(null)} /> : null}
      {deleting ? (
        <ConfirmDialog
          title={`Delete ${deleting.name}?`}
          description="Their invoices and payments are deleted with them. This reference deletes nothing."
          confirmLabel="Delete Customer"
          cancelLabel="Keep Customer"
          busyLabel="Deleting the customer"
          destructive
          onConfirm={() => setDeleting(null)}
          onCancel={() => setDeleting(null)}
        />
      ) : null}
    </BrowseScreen>
  )
}

/** What a row opens to in place: the account at a glance. */
function AccountSummary({ customer }: { customer: Customer }) {
  return (
    <DetailPanel title="Account Summary">
      <SummaryList
        rows={[
          { label: 'Plan', value: `${PLAN_LABEL[customer.plan]} — ${money(PLAN_FEE[customer.plan])} a month` },
          { label: 'Last invoiced', value: shortDate(customer.lastInvoice) },
          { label: 'Statements', value: customer.paperless ? 'By email' : 'On paper' },
        ]}
        total={{ label: 'Balance', value: money(customer.balance) }}
      />
      <Subsection heading="Contact" aside={<span className="type-metadata text-muted-foreground">Customer since {customer.joined.slice(0, 4)}</span>}>
        <p className="type-body text-card-foreground">
          {customer.email} · {customer.city}, {customer.state}
        </p>
      </Subsection>
    </DetailPanel>
  )
}

/** A customer's last invoices, each opened to the lines that make up its total. */
function RecentInvoices({ customer, onClose }: { customer: Customer; onClose: () => void }) {
  const fee = PLAN_FEE[customer.plan]
  const late = customer.standing === 'pastdue' ? 1200 : 0
  const invoices =
    customer.standing === 'new'
      ? []
      : [
          { number: `INV-${Number(customer.id) + 10500}`, date: '05/01/2026', lines: [{ label: 'Service', amount: fee }, ...(late ? [{ label: 'Late fee', amount: late }] : [])] },
          { number: `INV-${Number(customer.id) + 9980}`, date: '04/01/2026', lines: [{ label: 'Service', amount: fee }] },
          { number: `INV-${Number(customer.id) + 9440}`, date: '03/01/2026', lines: [{ label: 'Service', amount: fee }] },
        ]
  return (
    <ModalShell title={`Recent Invoices — ${customer.name}`} description={`Account ${customer.account}`} width="wide" onClose={onClose}>
      {invoices.length === 0 ? (
        <EmptyState>No invoices yet for this customer.</EmptyState>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead kind="actions">
                <span className="sr-only">Show or hide the lines</span>
              </TableHead>
              <TableHead>Invoice</TableHead>
              <TableHead>Date</TableHead>
              <TableHead kind="amount">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map((invoice, i) => (
              <ExpandableRow
                key={invoice.number}
                colSpan={3}
                label={`the lines of ${invoice.number}`}
                defaultOpen={i === 0}
                breakdown={invoice.lines.map((line) => (
                  <TableRow key={line.label} kind="breakdown">
                    <TableCell />
                    <TableCell>{line.label}</TableCell>
                    <TableCell />
                    <TableCell kind="amount">{money(line.amount)}</TableCell>
                  </TableRow>
                ))}
              >
                <TableCell kind="key">{invoice.number}</TableCell>
                <TableCell kind="number">{invoice.date}</TableCell>
                <TableCell kind="amount">{money(invoice.lines.reduce((sum, line) => sum + line.amount, 0))}</TableCell>
              </ExpandableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </ModalShell>
  )
}

// ── Beneath the browse: its pieces in each of their variants and states ──────────────

/** One variant or state of a piece: what it shows, then the piece. */
function Variant({ caption, children }: { caption: string; children: ReactNode }) {
  return (
    <div className="grid gap-related">
      <span className="type-readout-caption text-muted-foreground">{caption}</span>
      {children}
    </div>
  )
}

/** One family of pieces, in a card. */
function StatesCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-default">{children}</div>
      </CardContent>
    </Card>
  )
}

/** A layout store that cannot be reached: the list keeps its standard layout and says so. */
const unreachableStore: BrowseSettingsStore = {
  get: async () => {
    throw new Error('reference: the layout store is unreachable by design')
  },
  save: async () => {
    throw new Error('reference: the layout store is unreachable by design')
  },
}

interface Line {
  key: string
  name: string
  shows: string
}

const LINE_COLUMNS: BrowseColumn<Line>[] = [
  { id: 'name', label: 'Customer', width: 200, kind: 'title', cell: (r) => r.name },
  { id: 'shows', label: 'What This Row Shows', width: 420, cell: (r) => r.shows },
]
const LINE_DEFAULTS = { columns: ['name', 'shows'], hidden: [], sort: { id: 'name', desc: false }, sortable: [] }
const NO_SORT: BrowseSort = { id: 'name', desc: false }

/** A small browse table, standing in one state. */
function LineTable({
  storeKey,
  store,
  rows,
  failure,
  actions,
}: {
  storeKey: string
  store: BrowseSettingsStore
  rows: Line[] | undefined
  failure?: { error: unknown; general: string; onRetry: () => void } | null
  actions?: (row: Line) => ReactNode
}) {
  const layout = useBrowseSettings(storeKey, LINE_DEFAULTS, store)
  return (
    <BrowseTable
      columns={LINE_COLUMNS}
      rows={rows}
      getRowId={(row) => row.key}
      sort={NO_SORT}
      onSort={noop}
      layout={layout}
      actions={actions}
      empty="No customers match. Try part of the name, or fewer filters."
      failure={failure}
    />
  )
}

const LAYOUT_LINES: Line[] = [
  { key: 'a', name: 'Harper Greer', shows: 'The standard columns, in their standard order' },
  { key: 'b', name: 'Rowan Holloway', shows: 'The line under the rows says why' },
]

const ACTION_LINES: Line[] = [
  { key: 'all', name: 'Jordan Avery', shows: 'Every standard action, then the overflow menu' },
  { key: 'download', name: 'Riley Brooks', shows: 'A download being prepared: its slot spins' },
  { key: 'menu', name: 'Casey Castillo', shows: 'An action from the menu at work: the trigger spins' },
  { key: 'ask', name: 'Morgan Dunmore', shows: 'A report that asks first, and a removal from a group' },
  { key: 'words', name: 'Avery Ellison', shows: 'One-off actions in words, ahead of the icons' },
  { key: 'none', name: 'Quinn Fairbanks', shows: 'A row that offers no actions' },
]

function lineActions(row: Line): ReactNode {
  const menu = (
    <>
      <DropdownMenuItem onSelect={noop}>Recent Invoices</DropdownMenuItem>
      <DropdownMenuItem onSelect={noop}>Send Reminder</DropdownMenuItem>
    </>
  )
  switch (row.key) {
    case 'all':
      return (
        <RowActions
          subject={row.name}
          view={{ onClick: noop }}
          edit={{ onClick: noop }}
          report={{ label: `Statement for ${row.name}`, href: '#statement' }}
          download={{ label: `Download the latest invoice for ${row.name}`, href: '#invoice' }}
          remove={{ onClick: noop }}
          menu={menu}
        />
      )
    case 'download':
      return (
        <RowActions
          subject={row.name}
          edit={{ onClick: noop }}
          download={{ label: `Download the latest invoice for ${row.name}`, onClick: noop, busy: `Preparing the invoice for ${row.name}` }}
          menu={menu}
        />
      )
    case 'menu':
      return <RowActions subject={row.name} edit={{ onClick: noop }} menu={menu} menuBusy={`Sending a reminder to ${row.name}`} />
    case 'ask':
      return (
        <RowActions
          subject={row.name}
          report={{ label: `Activity Report for ${row.name}`, onClick: noop }}
          remove={{ onClick: noop, label: `Remove ${row.name} from this group` }}
        />
      )
    case 'words':
      return (
        <RowActions
          subject={row.name}
          buttons={
            <>
              <Button variant="outline" size="embedded">
                History
              </Button>
              <Button variant="outline" size="embedded">
                <BusySlot busy />
                Imports
              </Button>
            </>
          }
          edit={{ onClick: noop }}
          menu={menu}
        />
      )
    default:
      return <TableCell kind="actions" />
  }
}

const pager = (over: Partial<BrowsePagerProps>): BrowsePagerProps => ({
  page: 1,
  pageCount: 7,
  pageSize: 17,
  rowsOnPage: 17,
  total: 112,
  noun: 'customer',
  preference: FIT,
  onPageSizeChange: noop,
  onGoToPage: noop,
  ...over,
})

const CHIPS: FilterChip[] = [
  { key: 'standing', label: 'Standing', value: 'Current, Past Due', onRemove: noop },
  { key: 'plan', label: 'Plan', value: 'Standard', onRemove: noop },
  { key: 'paperless', label: 'Paperless only', value: '', onRemove: noop },
  { key: 'email', label: 'Email', value: '"a-very-long-part-of-an-address-to-show-how-a-chip-truncates@example.com"', onRemove: noop },
]

const BILLED_LABEL = { monthly: 'Monthly', quarterly: 'Quarterly', yearly: 'Yearly' }
const NONE_HIDDEN: ReadonlySet<string> = new Set()
const TWO_HIDDEN: ReadonlySet<string> = new Set(['pastdue', 'new'])

/** The browse's pieces, each family in a card, each variant and state named above it. */
function BrowseStateCards() {
  const [store] = useState(memoryStore)
  return (
    <>
      <StatesCard title="Table States">
        <Variant caption="Loading — placeholders before its first rows arrive">
          <LineTable storeKey="reference-browse-loading" store={store} rows={undefined} />
        </Variant>
        <Variant caption="Empty — no rows match">
          <LineTable storeKey="reference-browse-empty" store={store} rows={[]} />
        </Variant>
        <Variant caption="Failed to load — the failure in place of the rows, with Try Again">
          <LineTable
            storeKey="reference-browse-failed"
            store={store}
            rows={[]}
            failure={{ error: new Error('reference'), general: "The customers couldn't be loaded, so the list can't be shown.", onRetry: noop }}
          />
        </Variant>
        <Variant caption="The person's saved layout couldn't be read — the standard layout, and a line saying so">
          <LineTable storeKey="reference-browse-layout-failed" store={unreachableStore} rows={LAYOUT_LINES} />
        </Variant>
      </StatesCard>

      <StatesCard title="Toolbar Variants">
        <Variant caption="Search, Filters with a count, the create action and a status">
          <BrowseToolbar
            searchLabel="Search invoices"
            searchPlaceholder="Invoice number or customer"
            searchTerm=""
            onSearch={noop}
            filterCount={3}
            onFilter={noop}
            actions={
              <Button>
                <Plus />
                Add Invoice
              </Button>
            }
            status={<span className="type-metadata text-muted-foreground">Synced 2 minutes ago</span>}
          />
        </Variant>
        <Variant caption="Loading its next rows, with a term searched">
          <BrowseToolbar searchLabel="Search invoices" searchPlaceholder="Invoice number or customer" searchTerm="springfield" onSearch={noop} searching filterCount={1} onFilter={noop} />
        </Variant>
        <Variant caption="No filters set, and the create action unavailable">
          <BrowseToolbar
            searchLabel="Search payments"
            searchPlaceholder="Payment number or customer"
            searchTerm=""
            onSearch={noop}
            filterCount={0}
            onFilter={noop}
            actions={<Button disabled>Add Payment</Button>}
          />
        </Variant>
        <Variant caption="Live search for a list already loaded (no Search button), with its filters in a popover">
          <BrowseToolbar
            searchLabel="Search plans"
            search="live"
            searchPlaceholder="Plan name"
            searchTerm=""
            onSearch={noop}
            filterCount={1}
            filters={<FacetChecklist legend="Billed" options={['monthly', 'quarterly', 'yearly']} labels={BILLED_LABEL} hidden={NONE_HIDDEN} onToggle={noop} />}
          />
        </Variant>
        <Variant caption="Search only — no Filters at all">
          <BrowseToolbar searchLabel="Search cities" searchPlaceholder="City name" searchTerm="" onSearch={noop} filterCount={0} />
        </Variant>
      </StatesCard>

      <StatesCard title="Filter Checklist States">
        <Variant caption="A facet of the filters popover, as the popover holds it">
          <div className="grid items-start gap-default md:grid-cols-2 xl:grid-cols-3">
            <Variant caption="Every option ticked, as it starts">
              <FacetChecklist legend="Plan" options={PLANS} labels={PLAN_LABEL} hidden={NONE_HIDDEN} onToggle={noop} />
            </Variant>
            <Variant caption="Two options switched off">
              <FacetChecklist legend="Standing" options={['current', 'pastdue', 'new']} labels={STANDING_LABEL} hidden={TWO_HIDDEN} onToggle={noop} />
            </Variant>
            <Variant caption="An icon before each option">
              <FacetChecklist legend="Statements" options={['paper', 'email']} labels={{ paper: 'On paper', email: 'By email' }} icons={{ paper: Printer, email: Mail }} hidden={NONE_HIDDEN} onToggle={noop} />
            </Variant>
            <Variant caption="One option only — still drawn, and ticked">
              <FacetChecklist legend="State" options={['ST']} labels={{ ST: 'ST' }} hidden={NONE_HIDDEN} onToggle={noop} />
            </Variant>
          </div>
        </Variant>
      </StatesCard>

      <StatesCard title="View Tab Variants">
        <Variant caption="Counts on every view, one view needing attention">
          <ViewTabs
            label="Which invoices"
            value="open"
            onChange={noop}
            tabs={[
              { value: 'open', label: 'Open', count: 1284 },
              { value: 'pastdue', label: 'Past Due', count: 37, attention: true },
              { value: 'paid', label: 'Paid', count: 20516 },
            ]}
          />
        </Variant>
        <Variant caption="An attention view with nothing in it; the second view chosen">
          <ViewTabs
            label="Which payments"
            value="review"
            onChange={noop}
            tabs={[
              { value: 'posted', label: 'Posted', count: 412 },
              { value: 'review', label: 'Needs Review', count: 0, attention: true },
              { value: 'returned', label: 'Returned', count: 58 },
            ]}
          />
        </Variant>
        <Variant caption="Counts not known yet, or none kept">
          <ViewTabs
            label="Which users"
            value="staff"
            onChange={noop}
            tabs={[
              { value: 'staff', label: 'Staff' },
              { value: 'invited', label: 'Invited' },
            ]}
          />
        </Variant>
      </StatesCard>

      <StatesCard title="Filter Chips">
        <Variant caption="A default that narrows, a pick, a switch (its label alone), and a long value cut short">
          <FilterChips chips={CHIPS} />
        </Variant>
      </StatesCard>

      <StatesCard title="Pager Variants">
        <Variant caption="First page — First and Previous unavailable">
          <BrowsePager pager={pager({})} />
        </Variant>
        <Variant caption="A middle page">
          <BrowsePager pager={pager({ page: 4 })} />
        </Variant>
        <Variant caption="The last page — Next and Last unavailable">
          <BrowsePager pager={pager({ page: 7, rowsOnPage: 10 })} />
        </Variant>
        <Variant caption="The total not counted yet — the range has no total, and Last is unavailable">
          <BrowsePager pager={pager({ page: 2, pageCount: null, total: null })} />
        </Variant>
        <Variant caption="A fixed page size chosen instead of Fit">
          <BrowsePager pager={pager({ page: 2, pageCount: 3, pageSize: 50, rowsOnPage: 50, preference: 50 })} />
        </Variant>
        <Variant caption="A child list's own sizes, offered with no Fit">
          <BrowsePager pager={pager({ pageCount: 12, pageSize: 10, rowsOnPage: 10, preference: 10, sizes: [10, 25] })} />
        </Variant>
        <Variant caption="Nothing on the page">
          <BrowsePager pager={pager({ pageCount: 1, rowsOnPage: 0, total: 0 })} />
        </Variant>
      </StatesCard>

      <StatesCard title="Row Action States">
        <Variant caption="View, edit, report, download, delete, then the overflow menu — and each state they take">
          <LineTable storeKey="reference-browse-actions" store={store} rows={ACTION_LINES} actions={lineActions} />
        </Variant>
        <Variant caption="The overflow menu on its own: idle, and at work">
          <div className="flex items-center gap-related">
            <RowActionsMenu label="More actions for Jordan Avery">
              <DropdownMenuItem onSelect={noop}>Send Reminder</DropdownMenuItem>
            </RowActionsMenu>
            <RowActionsMenu label="More actions for Riley Brooks" busy busyLabel="Sending a reminder to Riley Brooks">
              <DropdownMenuItem onSelect={noop}>Send Reminder</DropdownMenuItem>
            </RowActionsMenu>
          </div>
        </Variant>
        <Variant caption="An icon that is a link to a screen of the app: enabled, and unavailable">
          <div className="flex items-center gap-related">
            <IconLink to="/" icon={Eye} label="View Jordan Avery" />
            <IconLink to="/" icon={Eye} label="View Riley Brooks" disabled />
          </div>
        </Variant>
      </StatesCard>
    </>
  )
}

/**
 * The whole reference: mount it on a temporary route of the back-office app. Pass `brand`
 * the app's own home link and product mark, so the top bar is judged with it.
 */
export function BrowseReference({ brand }: { brand?: ReactElement }) {
  const [queryClient] = useState(() => new QueryClient({ defaultOptions: { queries: { retry: false } } }))
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
        signOut={{ leave: noop, leaving: false, problem: null }}
      >
        <CustomerBrowse />
      </BackOfficeShell>
    </QueryClientProvider>
  )
}
