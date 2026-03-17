import useSWR from 'swr'
import type { NewsEvent } from '@/types/events'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function useNews() {
  const { data, error, isLoading } = useSWR('/api/news', fetcher, {
    refreshInterval: 180000,
    revalidateOnFocus: false,
  })
  return {
    events: (data?.data ?? []) as NewsEvent[],
    stale: data?.stale ?? false,
    baseline: data?.baseline ?? false,
    loading: isLoading,
    error,
    count: data?.count ?? 0,
  }
}
