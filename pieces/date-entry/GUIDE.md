# Wiring date-entry

The piece needs one thing from the receiving project: the time zone its Today and Now
buttons read.

## Give `DateTimeZone` the zone at each app's root

`DateTimeZone` is exported from `date-field` and from `date-segments`:

```tsx
function DateTimeZone({ zone, children }: { zone: string; children: React.ReactNode })
```

- Wrap each app's root layout in it, once, outside everything that can render a date or
  time field.
- `zone` is an IANA time zone name, such as `America/Chicago` — the one zone the
  organisation keeps its dates in.
- Hold that zone as one constant in the project's shared code and pass the same constant
  in every app.

```tsx
<DateTimeZone zone={ORGANISATION_TIME_ZONE}>
  {/* the app's shell and routes */}
</DateTimeZone>
```

Without it the fields still work: `useDateTimeZone()` falls back to the browser's own
zone, so Today follows the viewer's clock rather than the organisation's.
