---
kind: behaviour
code: [packages/web/src/components/PageHeading.tsx]
block-types: [ScreenHeading, BrowseToolbar, RecordHeader]
ui-status: approved
---

# Page heading

A screen that opens with a heading uses `PageHeading`, and its icon is resolved from the
route against the app's screen registry — never picked by the screen.

## The icon is the screen's

- **`apps/<app>/src/lib/navigation.ts` is the screen registry.** Each screen records its
  icon on its `NavItem`; the rail draws no icon on a screen row (`nav-tree-favorites.md`).
- **Adding a screen adds its icon to `navigation.ts`.** A screen reached from somewhere
  other than the rail goes in `UNLISTED_SCREENS`: a route and an icon, no module, no nav
  row.
- **Each app's root gives `ScreenIcons` its `navItemForPath` once.**

## Resolved, never passed

- `useScreenIcon()` returns the icon the registry records for the live path. A
  `PageHeading` resolves it itself; a browse passes `useScreenIcon()` as
  `BrowseToolbar`'s `icon`.
- **Never pass `PageHeading` an `icon`.** The override exists; a screen with no rail row
  records its icon in `UNLISTED_SCREENS` instead.
- **A detail route inherits its browse's icon**: `navItemForPath` matches on href
  prefix, longest first — the same rule `resolveActiveKey` uses for the rail's active
  row. The two never resolve separately.

## Never hand-roll the heading

A screen never writes its own `<h1>` in the screen-title type role; a heading comes from
`PageHeading`.

## The heading and the nav row say the same words

- **A screen has one name**, its nav label and its page title. The name never repeats
  its nav group's heading.
- Where the short name drops information, the description carries it, never the title.
- Titles are Title Case; descriptions are sentences (`design.md` → Casing).
