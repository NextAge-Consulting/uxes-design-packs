# Wiring back-office-reference

The piece is the back office assembled, and three reference screens to show it with: a
record, a form and a browse. It is built for light and dark. Do each step below before showing it to anyone.

## 1. The theme, in the UI package's stylesheet

Dark follows the operating system; a `dark` or `light` class on `<html>` is the person's
own choice and overrides it. Everything dark goes through this one variant, so no
component carries `dark:`. Add it above the token imports:

```css
@custom-variant dark {
  &:where(.dark, .dark *) {
    @slot;
  }
  @media (prefers-color-scheme: dark) {
    &:where(:root:not(.light), :root:not(.light) *) {
      @slot;
    }
  }
}
```

In the base layer, so scrollbars and native controls draw in the theme showing:

```css
:root {
  color-scheme: light;
  @variant dark {
    color-scheme: dark;
  }
}
```

For artwork that has a light and a dark version, such as the product mark:

```css
@utility light-theme-only {
  @variant dark {
    display: none;
  }
}
@utility dark-theme-only {
  display: none;
  @variant dark {
    display: block;
  }
}
```

**Where the UI package's stylesheet serves other apps too,** the branch that follows the
operating system would turn those apps dark as soon as the shared roles have dark values.
Scope it: follow the operating system only when `<html>` carries a class the back office
adds — in its boot script and its root — and leave the other apps on the explicit `dark`
class alone until each is given the theme.

## 2. A dark value for every colour role

Every colour role the installed pieces read needs a value under `@variant dark` in this
project's token file, from this project's own palette. The pack carries no colour. Those
values belong to the project's roles, so they reach every app that offers dark: name
those apps to the human first, and put the result to them in both themes on the
reference screen.

## 3. The saved choice, before first paint

`useTheme` (`theme/useTheme.ts`) holds the choice and exports `THEME_BOOT_SCRIPT`. Put
the script in the document head of each app's root, so a saved choice never flashes the
other theme first, and mark `<html>` with `suppressHydrationWarning`:

```tsx
head: () => ({ scripts: [{ children: THEME_BOOT_SCRIPT }] })
```

## 4. The shell, in the app's root layout

`BackOfficeShell` is the root layout's body. Give it the app's own:

- `brand` — the router's link to the home route, with an accessible name and the product
  mark inside it. The top bar is light in light and dark in dark, so a mark drawn
  for one background disappears in the other: give it one artwork per theme, shown through
  `light-theme-only` and `dark-theme-only`;
- `modules`, `activeKey`, `activeSection` and `linkComponent` — the app's navigation and
  its router link;
- `person` and `signOut` — who is signed in, and the app's sign-out;
- the router's outlet as its child.

The shell keeps the rail's open modules and favourites for the life of the page. Where the
app saves them per person, hold them as `nav-tree-favorites.md` says and pass them to
`NavTree` in place of the shell's own state.

## 5. The reference screens, on temporary routes

Mount `RecordReference`, `FormReference` and `BrowseReference` each on a route of the
back-office app that no navigation links to, with the app's own home link and product
mark as `brand`. Each renders the shell and, from invented data, a realistic screen
followed by cards of its pieces' states: a record, then its buttons; a full-width edit
form whose actions open each dialog, then its fields, its action bar and its dialogs in
each state; and a list with its filter, row actions and pager, then its table, toolbar,
tabs, chips, pager and row actions in each variant. They need nothing from a server. They
are what the human approves the pieces against, in both themes. Keep the routes until the
human says to remove them.

The app's stylesheet must scan the folders the pieces landed in — an `@source` line for
each workspace — or their classes are not generated.
