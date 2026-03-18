import useSWR from 'swr'
import type { CyberEvent } from '@/services/cyberService'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function useCyber() {
  const { data, error, isLoading } = useSWR('/api/cyber', fetcher, {
    refreshInterval: 600000,
    revalidateOnFocus: false,
  })
  return {
    events: (data?.data ?? []) as CyberEvent[],
    stale: data?.stale ?? false,
    baseline: data?.baseline ?? false,
    loading: isLoading,
    error,
    count: data?.count ?? 0,
  }
}
