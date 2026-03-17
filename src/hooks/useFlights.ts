import useSWR from 'swr'
import type { FlightEvent } from '@/types/events'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function useFlights() {
  const { data, error, isLoading } = useSWR('/api/flights', fetcher, {
    refreshInterval: 15000,
    revalidateOnFocus: false,
  })
  return {
    events: (data?.data ?? []) as FlightEvent[],
    stale: data?.stale ?? false,
    baseline: data?.baseline ?? false,
    loading: isLoading,
    error,
    count: data?.count ?? 0,
  }
}
