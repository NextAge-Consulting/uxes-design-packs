// ui-behaviour-code: nav-tree-favorites.md
import { useMutation } from '@tanstack/react-query'
import { logger } from '@design-pack/shared/logger'
import { useEffect, useState } from 'react'

/**
 * A list the person keeps on the rail — their favourites, their open modules — shown at
 * once on a toggle and saved behind it. A failed save puts the list back as it was and
 * says so in `problem`.
 */
export function useSavedList(
  saved: string[] | null | undefined,
  save: (keys: string[]) => Promise<unknown>,
  { fallback, what }: { fallback?: string[]; what: string },
) {
  const [list, setList] = useState<string[] | null>(null)
  // Fixed at the first render: navigating never opens a section.
  const [initial] = useState(fallback ?? [])
  const [problem, setProblem] = useState<string | null>(null)
  useEffect(() => {
    if (saved) setList(saved)
  }, [saved])
  const mutation = useMutation({ mutationFn: save })
  const current = list ?? initial

  const toggle = (key: string) => {
    const before = current
    const next = before.includes(key) ? before.filter((k) => k !== key) : [...before, key]
    setList(next)
    setProblem(null)
    mutation.mutate(next, {
      onError: (err) => {
        logger.error({ err, what }, 'rail preference not saved')
        setList(before)
        setProblem(`Your ${what} couldn't be saved, so the change was undone.`)
      },
    })
  }
  return { list: current, toggle, problem }
}

/** The module of the screen landed on — the one section a first visit opens. */
export function landedModule(activeKey: string | undefined): string[] {
  const module = activeKey?.split('/')[0]
  return module ? [module] : []
}

/**
 * Which copy of a row was clicked — under Favourites or under its module — held in memory
 * for the open screen only, so a reload or a deep link falls back to the module.
 */
export function useNavSelection(activeKey: string | undefined) {
  const [taken, setTaken] = useState<{ section: string; key: string } | null>(null)
  return {
    activeSection: taken && taken.key === activeKey ? taken.section : undefined,
    onNavigate: (section: string, key: string) => setTaken({ section, key }),
  }
}
