import useSWR from 'swr'
import type { DisasterEvent } from '@/types/events'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function useDisasters() {
  const { data, error, isLoading } = useSWR('/api/disasters', fetcher, {
    refreshInterval: 600000,
    revalidateOnFocus: false,
  })
  return {
    events: (data?.data ?? []) as DisasterEvent[],
    stale: data?.stale ?? false,
    baseline: data?.baseline ?? false,
    loading: isLoading,
    error,
    count: data?.count ?? 0,
  }
}
