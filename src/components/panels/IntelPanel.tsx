'use client'
import useSWR from 'swr'
import { formatTimestamp } from '@/lib/utils'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function IntelPanel() {
  const { data, isLoading } = useSWR('/api/intel-brief', fetcher, {
    refreshInterval: 900000,
    revalidateOnFocus: false,
  })

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-3 border-b border-border flex items-center justify-between flex-shrink-0">
        <span className="text-accent font-mono text-xs font-bold uppercase tracking-widest">
          AI Intel Brief
        </span>
        <div className="flex items-center gap-1">
          <span className="text-green-400 text-xs animate-pulse">●</span>
          <span className="text-text-muted font-mono text-xs">GROQ/LLAMA</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3">
        {isLoading && (
          <div className="font-mono text-xs text-text-muted animate-pulse">
            Generating intelligence brief...
          </div>
        )}

        {data && (
          <>
            <div className="font-mono text-xs text-text-primary leading-relaxed whitespace-pre-wrap mb-4">
              {data.brief}
            </div>
            <div className="pt-3 border-t border-border">
              <div className="flex justify-between text-xs font-mono text-text-muted">
                <span>Model: {data.model}</span>
                <span>
                  {data.generatedAt ? formatTimestamp(data.generatedAt) : ''}
                </span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
