# Wiring page-heading

The piece needs one thing from the receiving project: each app's screen registry, given
to `ScreenIcons` once at the app's root.

## Write the screen registry in each app

In the app's `lib/navigation.ts`:

- Record every screen as a `NavItem` (from `nav-types`) — its `key`, `label`, `href` and
  `icon` — in the navigation model the rail is built from.
- Keep a second list, `UNLISTED_SCREENS`, for a screen reached from somewhere other than
  the rail: a `NavItem` with a route and an icon, in no module.
- Export `navItemForPath(pathname)`, returning the `NavItem` a path belongs to or
  `undefined`. It considers both lists and matches on href prefix, longest first: a path
  matches an item when it equals the item's `href` or starts with `href` followed by
  `/`. A detail route then resolves to its browse.
- Use the same rule for the rail's active row, so the heading's icon and the highlighted
  row never disagree.

## Give `ScreenIcons` the registry at the app's root

```tsx
function ScreenIcons({ iconFor, children }: {
  iconFor: (pathname: string) => NavIcon | undefined
  children: ReactNode
})
```

Wrap the root layout in it, once, outside the shell and every route:

```tsx
<ScreenIcons iconFor={(path) => navItemForPath(path)?.icon}>
  {/* the app's shell and routes */}
</ScreenIcons>
```

Without it `useScreenIcon()` returns `undefined` and every `PageHeading` renders with no
mark.
