# Wiring ErrorState

The piece needs three things from the receiving project: the error type a server throws
for a person to read, its adapter registered, and `ScreenError` set on each router.

## Have a `UserFacingError` in the shared package

The piece imports `UserFacingError` from the shared package's `errors/userFacingError`:

```ts
export class UserFacingError extends Error {
  override name = 'UserFacingError'
}
```

- Server code throws it only with a message written for the person using the screen — a
  sentence they can act on, naming nothing internal.
- Every other error stays an ordinary `Error`; `failureMessage` then shows the caller's
  `general` sentence instead.

## Register `userFacingErrorAdapter` in each app

Add `userFacingErrorAdapter` to `serializationAdapters` in the options each app's
`src/start.ts` gives `createStart`. Without it the browser rebuilds a plain `Error`, and
every refusal reads as the general sentence.

## Set `ScreenError` as each router's default

Pass `defaultErrorComponent: ScreenError` to `createRouter` in each app's router. A
route that fails to load then shows the failure in the page's gutter.

## In a screen

```tsx
function ErrorState({ error, general, fill }: {
  error?: unknown
  general: string
  fill?: 'region' | 'screen'
})
```

`general` names what could not be shown and what that costs the person. Pass the thrown
`error` when there is one.
