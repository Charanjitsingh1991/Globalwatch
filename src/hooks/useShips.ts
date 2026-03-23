import useSWR from 'swr'
import type { ShipEvent } from '@/types/events'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function useShips() {
  const { data, error, isLoading } = useSWR('/api/ships', fetcher, {
    refreshInterval: 60000, // Ships move slowly — refresh every 60s
    revalidateOnFocus: false,
  })
  return {
    ships: (data?.data ?? []) as ShipEvent[],
    stale: data?.stale ?? false,
    loading: isLoading,
    error,
    count: data?.count ?? 0,
  }
}
