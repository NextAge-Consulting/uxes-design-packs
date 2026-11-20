// ui-status: approved
// ui-block: AccountMenu
import { UserAvatar } from '@design-pack/ui/components/app-shell/user-avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@design-pack/ui/components/ui/dropdown-menu'
import { BusySlot, BusyStatus } from '@design-pack/ui/components/busy-status'
import { LogOut } from 'lucide-react'
import type { ReactNode } from 'react'

/**
 * The account menu in the top bar — who is signed in, and what they can do about it.
 *
 * `UserAvatar` is deliberately a plain span with no click handler of its own, so the
 * trigger lives here. The app supplies who is signed in, its own entries (`items`,
 * as `DropdownMenuItem`s), anything those entries open (`after`, mounted beside the
 * menu so closing the menu does not unmount it), and the sign-out.
 *
 * The app renders it only when someone is signed in: the top bar mounts on the
 * sign-in page too, where an avatar beside a Sign out that cannot work is worse than
 * no menu at all.
 */
export function AccountMenu({
  name,
  detail,
  items,
  after,
  signOut,
}: {
  /** The person's name, or their login when they have none. */
  name: string
  /** A second line under the name — their email — when it says something the name does not. */
  detail?: string | null
  items?: ReactNode
  after?: ReactNode
  /** `useSignOut`'s: how to sign out, whether it is under way, and why it failed. */
  signOut: { leave: () => void; leaving: boolean; problem: string | null }
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Account"
        className="rounded-pill focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        <UserAvatar name={name} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <span className="type-row-title">{name}</span>
          {detail ? <span className="type-metadata text-muted-foreground">{detail}</span> : null}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {items}
        {/* Navigate on completion, not optimistically (`useSignOut`): signing out is a
            server round trip, and moving first leaves a signed-in session behind a login
            screen if it fails. The menu stays open while it works, so a failure is said
            where the person asked. */}
        <DropdownMenuItem
          onSelect={(event) => {
            event.preventDefault()
            signOut.leave()
          }}
        >
          <BusySlot busy={signOut.leaving} idle={<LogOut aria-hidden className="size-4" />} />
          Sign out
        </DropdownMenuItem>
        <BusyStatus busy={signOut.leaving}>Signing out</BusyStatus>
        {signOut.problem ? <p className="px-2 py-1 type-body text-feedback-danger">{signOut.problem}</p> : null}
      </DropdownMenuContent>
      {after}
    </DropdownMenu>
  )
}
