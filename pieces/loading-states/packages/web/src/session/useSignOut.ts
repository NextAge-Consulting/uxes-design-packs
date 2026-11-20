// ui-behaviour-code: loading-states.md
import { useQueryClient } from '@tanstack/react-query'
import { logger } from '@design-pack/shared/logger'
import { useState } from 'react'
import { afterSignOut } from './afterSignOut'

/**
 * Signing out from a button: busy while it works, then what the sign-in loaded is cleared
 * and `then` runs — the app's way to its sign-in screen. A sign-out that fails leaves the
 * person signed in and says so in `problem`.
 */
export function useSignOut(signOut: () => Promise<{ error?: unknown } | unknown>, then: () => unknown) {
  const queryClient = useQueryClient()
  const [leaving, setLeaving] = useState(false)
  const [problem, setProblem] = useState<string | null>(null)

  const leave = () => {
    if (leaving) return
    setLeaving(true)
    setProblem(null)
    signOut()
      .then((result) => {
        const error = result && typeof result === 'object' && 'error' in result ? result.error : null
        if (error) throw error
        afterSignOut(queryClient)
        return then()
      })
      .catch((err: unknown) => {
        logger.error({ err }, 'sign-out failed')
        setLeaving(false)
        setProblem("You couldn't be signed out. Try again.")
      })
  }
  return { leave, leaving, problem }
}
