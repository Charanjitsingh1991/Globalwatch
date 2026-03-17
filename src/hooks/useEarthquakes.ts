import useSWR from 'swr'
import type { EarthquakeEvent } from '@/types/events'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function useEarthquakes() {
  const { data, error, isLoading } = useSWR('/api/earthquakes', fetcher, {
    refreshInterval: 120000,
    revalidateOnFocus: false,
  })

  return {
    events: (data?.data ?? []) as EarthquakeEvent[],
    stale: data?.stale ?? false,
    baseline: data?.baseline ?? false,
    loading: isLoading,
    error,
    count: data?.count ?? 0,
  }
}
