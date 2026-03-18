import useSWR from 'swr'
import type { WindyWebcamEvent } from '@/app/api/windy-webcams/route'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export function useWindyWebcams() {
  const { data, error, isLoading } = useSWR(
    '/api/windy-webcams',
    fetcher,
    {
      refreshInterval: 840000,
      revalidateOnFocus: false,
    }
  )
  return {
    webcams: (data?.data ?? []) as WindyWebcamEvent[],
    stale: data?.stale ?? false,
    baseline: data?.baseline ?? false,
    loading: isLoading,
    error,
    count: data?.count ?? 0,
  }
}
