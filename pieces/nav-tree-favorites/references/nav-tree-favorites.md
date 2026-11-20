---
kind: behaviour
code: [packages/ui/src/components/app-shell/nav-tree.tsx, packages/web/src/nav/railState.ts]
block-types: [NavRail]
ui-status: approved
---

# Nav tree with favourites

**The left rail is the only path to every screen: Favourites pinned at the top, then each
module as an independently collapsible section holding its screens. The top bar holds no
navigation.**

## When it applies

The rail of an app built on `NavTree`, and every screen added to it.

## How to build it

### The rail and the top bar

- **The rail renders only for a signed-in session.** The rail's own component returns
  nothing when the signed-in layout has not matched, so a public screen shows the top bar
  and no rail.
- **The top bar carries identity and system state only** — brand, integration state,
  theme, user menu.
- **Each screen has one path: its row in the tree.**
- **Only the tree drives which sections are open.**
- **The rail is a `nav` landmark named by a heading only screen readers hear.**

### Sections

- **Any number of sections open, including none.** Open and closed state is the
  person's, saved on the server with their favourites, so it follows them to any device.
- **Navigating never opens a section.** Only the first-ever visit seeds one open: the
  module landed on.

### Exactly one row is selected — the one the user clicked

- A starred screen renders under Favourites and under its module; only the copy the user
  took shows as selected. The app passes `onNavigate` and `activeSection`, and stores the
  section with the screen key in memory, never on the device.
- A stored section claims only the screen it was recorded for.
- **No recorded section means the module wins** — a reload, a deep link, a link from
  inside a page.
- **Unstarring the open screen moves the selection to its module.**
- The selection stays on the row that was clicked when that row's section is closed; the
  closed section hides it.
- Collapsed, the section holding the open screen carries the selection, by the same rule.

### Screens in the tree

- **Two levels: module → screen.** A module holding different kinds of screen labels them
  with a non-interactive group heading. Consecutive items sharing a `group` render under
  one heading, so order defines the grouping.
- **Only modules carry an icon in the rail.** A screen still declares `NavItem.icon`; its
  page heading draws it (`page-heading.md`).
- **A rail label is terse; the group heading carries the context** — `Templates` under
  Settings, `Categories` under Lookup tables. Page headings stay descriptive.
- **A screen's key is `<module>/<item>`, never an href.** A stored key naming a screen
  that no longer exists is dropped silently at render.

### Favourites

- **The Favourites section always renders**, reading "Star a screen to pin it here."
  when empty, and survives the rail's collapse.
- **The tree is the only place a screen is starred.**
- **Favourites are stored server-side against the person**, as a per-user preference of
  screen keys, through the project's existing per-user preference store.
- **Toggling is optimistic, and failure is visible:** the star fills at once and the
  save follows; on failure, restore the previous list and show the reason in one line under
  Favourites.

## Excluded

- Navigation in the top bar, and a second route to any screen.
- A control outside the tree setting which section is open.
- A third navigable level.
- Icons on screen rows.
- Favourites or open sections kept on the device.
- Reordering favourites.
- A star on the screen itself.
