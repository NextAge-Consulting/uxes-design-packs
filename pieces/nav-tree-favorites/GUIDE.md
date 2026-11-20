# Wiring nav-tree-favorites

The piece ships `useSavedList`, `landedModule` and `useNavSelection`. Your project writes
the store behind them and the sidebar that joins them to `NavTree`.

## 1. A per-person store, on the server

Two lists of screen keys saved against the signed-in person, through your project's
per-user preference store:

- **Favourites** — `string[]`.
- **Open sections** — `string[]`, or `null` until the person first opens or closes one.

Write three server functions, each checking the session itself:

- one read returning `{ favorites: string[]; expanded: string[] | null }`;
- one write per list, taking the whole list: `(keys: string[]) => Promise<unknown>`.

## 2. The navigation model

One module of your app's own that holds:

- the modules and their screens, as `NavTree`'s `modules`, each screen keyed
  `<module>/<item>`, filtered to what the person may open;
- a function from the current pathname to the open screen's key, or `undefined`.

## 3. The sidebar

One router-aware component, rendered by the app's root, that returns nothing when the
signed-in layout has not matched. Signed in, it:

1. reads the saved lists with a query;
2. calls `useSavedList(saved, save, { fallback, what })` once per list — `saved` is the
   list from the read, `save` the matching write, `what` the words the failure message
   names the list by. For open sections, `fallback` is `landedModule(activeKey)`;
3. calls `useNavSelection(activeKey)`;
4. hands the results to `NavTree`:

| `NavTree` prop | From |
|---|---|
| `favorites`, `onToggleFavorite` | the favourites list's `list`, `toggle` |
| `expandedModules`, `onToggleModule` | the open-sections list's `list`, `toggle` |
| `activeKey` | your pathname-to-key function |
| `activeSection`, `onNavigate` | `useNavSelection`'s result |
| `problem` | either list's `problem` |
| `collapsed`, `onToggleCollapsed` | the sidebar's own state |
| `linkComponent` | your router's link |
