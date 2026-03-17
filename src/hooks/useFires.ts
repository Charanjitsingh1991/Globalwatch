import useSWR from 'swr'
import type { FireEvent } from '@/types/events'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function useFires() {
  const { data, error, isLoading } = useSWR('/api/fires', fetcher, {
    refreshInterval: 600000,
    revalidateOnFocus: false,
  })

  return {
    events: (data?.data ?? []) as FireEvent[],
    stale: data?.stale ?? false,
    baseline: data?.baseline ?? false,
    loading: isLoading,
    error,
    count: data?.count ?? 0,
  }
}
