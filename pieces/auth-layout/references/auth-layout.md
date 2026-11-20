---
kind: recipe
frame: auth-shell
block-types: [AuthShell]
ui-status: approved
---

# Signed-out screen

A screen shown outside the signed-in frame is an `AuthShell` holding one `AuthShellBody`,
built by picking each choice below. A working control follows `loading-states.md`.

## When it applies

Sign in, setting a password or choosing a new one, a first sign-in, the landing of an
emailed or handed-over link, a public document, and a task done without signing in.

## Layout — `centred` · `flowing`

- **`centred`** — one task on one narrow card, centred above the foot of the page.
- **`flowing`** — a document, or a task that grows as it is filled: it starts under the
  mark so nothing moves as it grows.

## Slots, in order inside `AuthShellBody`

1. **Mark** — `BrandMark size="header" tagline`, on every signed-out screen.
   - Link to Sign In: yes · no. Yes on a `flowing` screen and on a task done without signing in.
2. **Notices** — present · absent. The app's standing notices, stacked, on a screen a
   visitor starts at: sign in, a task done without signing in.
3. **The task** — pick one:
   - **`AuthCard`** on a `centred` screen: `CardHeader` with a `CardTitle` and a
     `CardDescription`, then `CardContent` holding a `FieldStack` — its fields, its
     failure or notice as an `Alert`, its submit in `FieldStackActions`, its other ways on
     in `FieldStackLinks`.
   - **`Card` at `max-w-auth-content`** on a `flowing` document: the title in its
     `CardHeader`, the document in its `CardContent`.
   - **`AsideLayout` at `max-w-auth-content`** on a `flowing` task with facts read beside
     it: the facts' card in the side column, the task's card in the main one.
4. **Help line** — one centred line of muted body text saying how to get help, on every
   screen a member of the public works through: sign in, setting a password, a first
   sign-in, confirming an email, a task done without signing in, and a page with no task
   of its own. None on a document, on a screen staff land on, or in an app only staff use.

**Foot** — present · absent. `AuthShellFooter` after the body, holding a row of linked
images, on a public app's sign in.

## Inside the card while it works

- **Looking something up before the task can show:** `Skeleton`s where the fields will be.
- **Spending a link's single-use code:** a `Spinner` and a `BusyStatus`, no fields; a
  failure is an `Alert variant="destructive"` in their place.
- **A link that arrives without its code:** an `Alert variant="warning"` in place of the
  task.

## Shared pages

A page with no task of its own, which says something and offers where to go next, is one
shared page of the app. A public document is another.

## Exceptions

A screen departs from a choice above only as an exception, with the human's reason where
it is made (`design-accepted — <reason>`).
