import useSWR from 'swr'
import type { NewsEvent } from '@/types/events'

// Add timestamp to URL to bypass any browser caching
const fetcher = (url: string) =>
  fetch(url, { cache: 'no-store' }).then((r) => r.json())

export function useNews() {
  const { data, error, isLoading, mutate } = useSWR(
    '/api/news',
    fetcher,
    {
      refreshInterval: 60000,      // refresh every 60 seconds
      revalidateOnFocus: true,     // refresh when tab gets focus
      revalidateOnReconnect: true, // refresh on reconnect
      dedupingInterval: 30000,     // allow re-fetch after 30s
    }
  )

  return {
    events: (data?.data ?? []) as NewsEvent[],
    stale: data?.stale ?? false,
    baseline: data?.baseline ?? false,
    loading: isLoading,
    error,
    count: data?.count ?? 0,
    refresh: mutate,
  }
}
