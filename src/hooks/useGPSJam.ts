import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function useGPSJam() {
  const { data, error, isLoading } = useSWR('/api/gpsjam', fetcher, {
    refreshInterval: 3600000,
    revalidateOnFocus: false,
  })
  return {
    zones: data?.data ?? [],
    stale: data?.stale ?? false,
    baseline: data?.baseline ?? false,
    loading: isLoading,
    error,
    count: data?.count ?? 0,
  }
}
