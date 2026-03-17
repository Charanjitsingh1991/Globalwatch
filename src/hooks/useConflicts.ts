import useSWR from 'swr'
import type { ConflictEvent } from '@/types/events'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function useConflicts() {
  const { data, error, isLoading } = useSWR('/api/conflicts', fetcher, {
    refreshInterval: 300000,
    revalidateOnFocus: false,
  })

  return {
    events: (data?.data ?? []) as ConflictEvent[],
    stale: data?.stale ?? false,
    baseline: data?.baseline ?? false,
    loading: isLoading,
    error,
    count: data?.count ?? 0,
  }
}
