# Wiring app-shell

The piece is the frame only. The receiving project mounts it in each app's root layout
and fills its slots with its own components.

## Mount `AppShell` in each app's root

```tsx
function AppShell(props: {
  banner?: React.ReactNode
  topBar?: React.ReactNode
  sideBar?: React.ReactNode
  statusStrip?: React.ReactNode
} & React.ComponentProps<"div">)
```

- Render it once, inside the root layout's providers, with the router's outlet as its
  child. Only that child region scrolls.
- `topBar` is an `AppShellTopBar` holding the app's own content: the brand on the left,
  then the system actions — a theme toggle, the account menu — pushed right.
- `sideBar` is the app's navigation.
- `banner` is for a state the whole session is in; leave it out when the app has none.
- `statusStrip` is an `AppShellStatusStrip`, when the app shows one.

## Give `AppShellBrand` the app's home link

```tsx
function AppShellBrand({ children }: { children: React.ReactElement })
```

The shell imports no router. Pass the app's own router link to its home route as the one
child, with an accessible name and the product mark inside it:

```tsx
<AppShellTopBar>
  <AppShellBrand>
    <Link to="/" aria-label="Home">
      {/* the product mark */}
    </Link>
  </AppShellBrand>
  <div className="ml-auto flex items-center gap-2">{/* system actions */}</div>
</AppShellTopBar>
```
