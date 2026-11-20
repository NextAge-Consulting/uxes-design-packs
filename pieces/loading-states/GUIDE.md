# Wiring loading-states

The piece ships `ScreenOutlet`. Your project writes the one place that renders it.

## The signed-in layout route

`ScreenOutlet` takes no props and stands where a router `Outlet` would. Write the layout
route every signed-in screen sits under, and make `ScreenOutlet` its component:

```tsx
component: () => <ScreenOutlet />
```

- The layout route is yours: its session check, its redirect to sign in, and whatever it
  hands its screens through route context.
- Each app with signed-in screens has one such route, and each renders `ScreenOutlet`
  once. No screen renders it itself.
- Draw the layout's shell — top bar, rail — outside this route's component, so the
  outline `ScreenOutlet` shows while a screen loads appears inside the shell.

`ScreenOutlet` reads the router's state itself: it shows `ScreenSkeleton` and a
`BusyStatus` when the path is changing and the wait has passed `useDelayedLoading`'s
gate, and the `Outlet` otherwise. A screen's loader needs nothing added for it.
