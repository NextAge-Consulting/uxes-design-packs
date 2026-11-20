---
kind: recipe
frame: aside-layout
block-types: [AsideScreen]
ui-status: approved
---

# Aside screen

Work on one record with the facts read while doing it beside it is an `AsideLayout` under
a `PageHeading`, in the page gutter.

## When it applies

A screen whose main column is the work and whose side column is read during it. The side
column neither navigates nor selects.

## Slots

1. **Gutter** — `BrowseScreen`.
2. **Heading** — `PageHeading`: the title is the task, an em dash, then whose it is; the
   description is their identifying facts joined by ` · `.
3. **Side** — `AsideLayoutSide`: read-only cards about the record.
4. **Main** — `AsideLayoutMain`: the task's cards. Where the task is unavailable for this
   record, an `Alert variant="info"` saying why takes its place.

Screens of one task family share one feature file that draws the gutter, the heading and
the side column, and takes the main column as its children.

## Exceptions

A screen departs from a choice above only as an exception, with the human's reason where
it is made (`design-accepted — <reason>`).
