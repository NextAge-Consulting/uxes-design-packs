// ui-status: pending
// ui-recipe: form-layout.md
import { BarChart, BarChartAside } from '@design-pack/ui/components/bar-chart'
import { Breadcrumb } from '@design-pack/ui/components/breadcrumb'
import { BusySlot } from '@design-pack/ui/components/busy-status'
import { CardGrid } from '@design-pack/ui/components/card-grid'
import { Fact, FactList, FactListIcon, FactListItem, FactListValue } from '@design-pack/ui/components/fact-list'
import { IconButton } from '@design-pack/ui/components/icon-button'
import { LineChart } from '@design-pack/ui/components/line-chart'
import { PageBanner, PageBannerText } from '@design-pack/ui/components/page-banner'
import { RecordHeader } from '@design-pack/ui/components/record-header'
import { StatReadout } from '@design-pack/ui/components/stat-readout'
import { SummaryList } from '@design-pack/ui/components/summary-list'
import { Badge } from '@design-pack/ui/components/ui/badge'
import { Button } from '@design-pack/ui/components/ui/button'
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@design-pack/ui/components/ui/card'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AtSign, Building2, CalendarCheck, CalendarX, ChartColumn, ChevronLeft, ChevronRight, Download, FileText, Hash, LayoutDashboard, Mail, MapPin, Pencil, Settings, Trash2, UserRound, Users, X } from 'lucide-react'
import { type ReactElement, type ReactNode, useState } from 'react'
import type { BrowseSettings, BrowseSort } from '../browse/browseSettings'
import { type BrowseSettingsStore, useBrowseSettings } from '../browse/useBrowseSettings'
import { childPager } from '../browse/useChildPaging'
import { type BrowseColumn, BrowseTable } from '../components/BrowseTable'
import { BrowseScreen } from '../components/BrowseScreen'
import { ChildList } from '../components/ChildList'
import { BackOfficeShell } from './BackOfficeShell'

/**
 * The reference record screen: one record read on its own screen, inside the assembled
 * back office. Every figure, name and date here is invented. It is what the recipe is
 * approved against, and what an app's first real record screen is compared with.
 */

interface Entry {
  key: string
  date: string
  type: string
  reference: string
  amount: string
  balance: string
}

const ENTRIES: Entry[] = [
  { key: '1', date: '03/01/2026', type: 'Invoice', reference: 'INV-10482', amount: '$184.20', balance: '$184.20' },
  { key: '2', date: '03/14/2026', type: 'Payment', reference: 'PMT-77310', amount: '-$184.20', balance: '$0.00' },
  { key: '3', date: '04/01/2026', type: 'Invoice', reference: 'INV-10977', amount: '$201.75', balance: '$201.75' },
  { key: '4', date: '04/20/2026', type: 'Reminder', reference: 'REM-00412', amount: '$0.00', balance: '$201.75' },
  { key: '5', date: '05/01/2026', type: 'Invoice', reference: 'INV-11503', amount: '$196.40', balance: '$398.15' },
]

const COLUMNS: BrowseColumn<Entry>[] = [
  { id: 'date', label: 'Date', width: 120, sortable: true, descendingFirst: true, cell: (r) => r.date },
  { id: 'type', label: 'Type', width: 140, kind: 'title', cell: (r) => r.type },
  { id: 'reference', label: 'Reference', width: 160, kind: 'code', cell: (r) => r.reference },
  { id: 'amount', label: 'Amount', width: 120, kind: 'amount', cell: (r) => r.amount },
  { id: 'balance', label: 'Balance', width: 120, kind: 'amount', cell: (r) => r.balance },
]

const DEFAULTS = {
  columns: COLUMNS.map((c) => c.id),
  hidden: [],
  sort: { id: 'date', desc: true },
  sortable: ['date'],
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

const MONTHS = ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May']

/** What was charged each month, by kind, in dollars. */
const CHARGES = [
  { name: 'Service', values: [150, 150, 150, 150, 150, 150, 160, 160, 160, 160, 160, 160] },
  { name: 'Usage', values: [22, 31, 44, 38, 26, 19, 17, 21, 24, 24, 30, 36] },
  { name: 'Fees', values: [0, 0, 0, 12, 0, 0, 0, 0, 0, 0, 12, 0] },
]

/** The balance owed at each month's end, this year and the year before. */
const BALANCES = [
  { name: 'This year', values: [0, 0, 194, 0, 0, 169, 0, 181, 0, 184, 202, 398] },
  { name: 'The year before', values: [0, 162, 0, 0, 171, 0, 0, 0, 158, 0, 0, 0] },
]

const dollars = (value: number) => value.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
const charged = (month: number) => CHARGES.reduce((sum, series) => sum + (series.values[month] ?? 0), 0)

/** One kind of button: what it is for, then each of its states. */
function ButtonRow({ caption, children }: { caption: string; children: ReactNode }) {
  return (
    <div className="grid gap-related">
      <span className="type-readout-caption text-muted-foreground">{caption}</span>
      <div className="flex flex-wrap items-center gap-related">{children}</div>
    </div>
  )
}

function Record() {
  const [store] = useState(memoryStore)
  const [month, setMonth] = useState(MONTHS.length - 1)
  const change = charged(month) - charged(month - 1)
  const layout = useBrowseSettings('reference-record-entries', DEFAULTS, store)
  const [sort, setSort] = useState<BrowseSort>(DEFAULTS.sort)
  const rows = sort.desc ? [...ENTRIES].reverse() : ENTRIES

  return (
    <BrowseScreen>
      <Breadcrumb above={[{ label: 'Customers', href: '#customers' }]} current="Jordan Avery" />
      <PageBanner tone="warning" title="A payment is past due" action={{ label: 'See the open invoices', href: '#invoices' }}>
        <PageBannerText>The April invoice was due on 04/30/2026. Reminders go out weekly until it is paid.</PageBannerText>
      </PageBanner>
      <RecordHeader
        icon={UserRound}
        title="Jordan Avery"
        subtitle="Account 100482 · Customer since 2021"
        badges={
          <>
            <Badge variant="muted">Customer</Badge>
            <Badge variant="warning">Past due</Badge>
          </>
        }
        footer={
          <div className="flex flex-wrap gap-related">
            <Button variant="outline">Edit</Button>
            <Button variant="outline">Take Payment</Button>
            <Button variant="outline">
              <ChartColumn />
              Charts
            </Button>
          </div>
        }
      />

      <CardGrid>
        <Card>
          <CardHeader>
            <CardTitle>Customer</CardTitle>
          </CardHeader>
          <CardContent>
            <FactList>
              <FactListItem>
                <FactListIcon>
                  <UserRound />
                </FactListIcon>
                <span className="type-row-title">Jordan Avery</span>
              </FactListItem>
              <FactListItem>
                <FactListIcon>
                  <AtSign />
                </FactListIcon>
                <FactListValue>
                  <span className="type-body text-card-foreground">
                    <span className="sr-only">Email </span>
                    jordan.avery@example.com
                  </span>
                  <Badge variant="muted">Not confirmed</Badge>
                </FactListValue>
              </FactListItem>
              <Fact icon={<Users />} caption="Contacts">
                2
              </Fact>
              <Fact icon={<Hash />} caption="Customer ID">
                C-100482
              </Fact>
            </FactList>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Service</CardTitle>
          </CardHeader>
          <CardContent>
            <FactList>
              <Fact icon={<MapPin />} caption="Service Address">
                {['12 Example Street', 'Springfield, ST 00000']}
              </Fact>
              <Fact icon={<CalendarCheck />} caption="Service Began">
                06/01/2021
              </Fact>
              <Fact icon={<CalendarX />} caption="Service Ends">
                Not set
              </Fact>
            </FactList>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Invoices Sent To</CardTitle>
          </CardHeader>
          <CardContent>
            <FactList>
              <Fact icon={<Mail />} caption="Mailing Address">
                {['c/o Avery Holdings', 'PO Box 100', 'Springfield, ST 00000']}
              </Fact>
            </FactList>
          </CardContent>
        </Card>
      </CardGrid>

      <Card>
        <CardHeader>
          <CardTitle>Account Balance</CardTitle>
          <CardAction>
            <span className="type-figure">$398.15</span>
          </CardAction>
        </CardHeader>
        <CardContent>
          <div className="grid gap-x-section gap-y-default md:grid-cols-3">
            <SummaryList
              rows={[
                { label: 'Current', value: '$196.40' },
                { label: '30 days', value: '$201.75' },
                { label: '60 days', value: '$0.00' },
              ]}
            />
            <SummaryList
              rows={[
                { label: 'Charges', value: '$582.35' },
                { label: 'Payments', value: '-$184.20' },
              ]}
            />
            <SummaryList rows={[{ label: 'Late fees', value: '$0.00' }]} />
          </div>
        </CardContent>
      </Card>

      <ChildList
        title="Invoices and Payments"
        loading={false}
        actions={
          <Button variant="outline">
            <FileText />
            Transaction History
          </Button>
        }
        pager={childPager({ rowsOnPage: rows.length, total: rows.length, size: 10, page: 1, noun: 'entry', onChooseSize: () => {}, onGoToPage: () => {} })}
      >
        <BrowseTable
          inCard
          columns={COLUMNS}
          rows={rows}
          getRowId={(row) => row.key}
          sort={sort}
          onSort={(next) => {
            layout.sortChosen(next)
            setSort(next)
          }}
          layout={layout}
          empty="No invoices yet for this customer."
        />
      </ChildList>

      <div className="grid gap-default md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Charges by Month</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart
              label="Bar chart of the last 12 months of charges, stacked by kind."
              legendLabel="Kinds of charge"
              categories={MONTHS}
              series={CHARGES}
              selected={month}
              onSelect={setMonth}
              formatValue={dollars}
              aside={
                <BarChartAside
                  heading={
                    <StatReadout
                      label={`${MONTHS[month]} charges`}
                      value={dollars(charged(month))}
                      hint={month === 0 ? 'The first month shown' : `${dollars(Math.abs(change))} ${change < 0 ? 'less' : 'more'} than the month before`}
                    />
                  }
                  controls={
                    <>
                      <IconButton icon={ChevronLeft} label="Previous month" disabled={month === 0} onClick={() => setMonth(month - 1)} />
                      <IconButton icon={ChevronRight} label="Next month" disabled={month === MONTHS.length - 1} onClick={() => setMonth(month + 1)} />
                    </>
                  }
                >
                  <SummaryList rows={CHARGES.map((series) => ({ label: series.name, value: dollars(series.values[month] ?? 0) }))} />
                </BarChartAside>
              }
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Balance at Month End</CardTitle>
          </CardHeader>
          <CardContent>
            <LineChart
              label="Line chart of the balance owed at each month's end, this year and the year before."
              legendLabel="Years"
              categories={MONTHS}
              series={BALANCES}
              formatValue={dollars}
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Buttons</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-default">
            <ButtonRow caption="Main — the one primary action of a form or dialog">
              <Button>Save Changes</Button>
              <Button disabled>Save Changes</Button>
              <Button>
                <BusySlot busy />
                Saving…
              </Button>
            </ButtonRow>
            <ButtonRow caption="Outlined — a record's actions, side by side as equals">
              <Button variant="outline">Edit</Button>
              <Button variant="outline">
                <Download />
                Export
              </Button>
              <Button variant="outline" disabled>
                Edit
              </Button>
              <Button variant="outline">
                <BusySlot busy />
                Exporting…
              </Button>
            </ButtonRow>
            <ButtonRow caption="Secondary">
              <Button variant="secondary">Send Statement</Button>
              <Button variant="secondary" disabled>
                Send Statement
              </Button>
            </ButtonRow>
            <ButtonRow caption="Quiet — no fill until the pointer is on it">
              <Button variant="ghost">Cancel</Button>
              <Button variant="ghost" disabled>
                Cancel
              </Button>
            </ButtonRow>
            <ButtonRow caption="Delete — removing something">
              <Button variant="ghost-destructive">Delete Customer</Button>
              <Button variant="destructive">Delete Customer</Button>
              <Button variant="destructive" disabled>
                Delete Customer
              </Button>
            </ButtonRow>
            <ButtonRow caption="Link — a word-only action in content">
              <Button variant="link">View History</Button>
            </ButtonRow>
            <ButtonRow caption="Icon only — the label is its tooltip">
              <IconButton label="Edit Jordan Avery" icon={Pencil} />
              <IconButton label="Clear" icon={X} variant="quiet" />
              <IconButton label="Delete Jordan Avery" icon={Trash2} variant="ghost-destructive" />
              <IconButton label="Edit Jordan Avery" icon={Pencil} disabled />
            </ButtonRow>
          </div>
        </CardContent>
      </Card>
    </BrowseScreen>
  )
}

/**
 * The whole reference: mount it on a temporary route of the back-office app. Pass `brand`
 * the app's own home link and product mark, so the top bar is judged with it.
 */
export function RecordReference({ brand }: { brand?: ReactElement }) {
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
        <Record />
      </BackOfficeShell>
    </QueryClientProvider>
  )
}
