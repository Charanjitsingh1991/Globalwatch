'use client'

interface Props {
  stale?: boolean
  baseline?: boolean
  count?: number
  label: string
}

export default function StatusBadge({ stale, baseline, count, label }: Props) {
  const color = baseline
    ? '#6B7280'
    : stale
    ? '#EAB308'
    : '#22C55E'

  const status = baseline ? 'OFFLINE' : stale ? 'STALE' : 'LIVE'

  return (
    <div className="flex items-center gap-1.5 text-xs font-mono">
      <span style={{ color }} className="animate-pulse">●</span>
      <span style={{ color }} className="uppercase">{label}</span>
      <span className="text-text-muted">{status}</span>
      {count !== undefined && (
        <span className="text-text-muted">({count})</span>
      )}
    </div>
  )
}
