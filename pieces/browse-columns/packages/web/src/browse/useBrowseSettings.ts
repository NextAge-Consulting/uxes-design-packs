// ui-behaviour-code: browse-columns.md
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { logger } from '@design-pack/shared/logger'
import { useState } from 'react'
import {
  type BrowseDefaults,
  type BrowseSettings,
  type BrowseSort,
  clampWidth,
  defaultBrowseSettings,
  resolveBrowseSettings,
  toggleColumn,
} from './browseSettings'

/** The app's two server functions for a person's layout of one list. */
export interface BrowseSettingsStore {
  get: (input: { data: { key: string } }) => Promise<BrowseSettings | null>
  save: (input: { data: { key: string; settings: BrowseSettings } }) => Promise<unknown>
}

const browseSettingsKey = (key: string) => ['browseSettings', key] as const

/**
 * A person's layout of one list, applied at once and saved behind it. A failed save puts
 * the layout back as it was and says so in `problem`; a failed read leaves the list on its
 * defaults and says so too.
 */
export function useBrowseSettings(key: string, defaults: BrowseDefaults, store: BrowseSettingsStore) {
  const queryClient = useQueryClient()
  const loaded = useQuery({ queryKey: browseSettingsKey(key), queryFn: () => store.get({ data: { key } }), staleTime: Number.POSITIVE_INFINITY })
  const settings = resolveBrowseSettings(loaded.data, defaults)
  const [problem, setProblem] = useState<string | null>(null)

  const mutation = useMutation({ mutationFn: (next: BrowseSettings) => store.save({ data: { key, settings: next } }) })

  const update = (next: BrowseSettings) => {
    const before = settings
    queryClient.setQueryData(browseSettingsKey(key), next)
    setProblem(null)
    mutation.mutate(next, {
      onError: (err) => {
        logger.error({ err, key }, 'browse layout not saved')
        queryClient.setQueryData(browseSettingsKey(key), before)
        setProblem("This list's layout couldn't be saved, so the change was undone.")
      },
    })
  }

  return {
    settings,
    problem: problem ?? (loaded.isError ? "This list's saved layout couldn't be loaded, so it shows its standard layout." : null),
    toggle: (id: string) => update(toggleColumn(settings, id)),
    reorder: (order: string[]) => update({ ...settings, order }),
    resize: (id: string, width: number) => update({ ...settings, widths: { ...settings.widths, [id]: clampWidth(width) } }),
    sortChosen: (sort: BrowseSort) => {
      if (sort.id !== settings.sort.id || sort.desc !== settings.sort.desc) update({ ...settings, sort })
    },
    reset: () => update(defaultBrowseSettings(defaults)),
  }
}

export type BrowseSettingsState = ReturnType<typeof useBrowseSettings>
