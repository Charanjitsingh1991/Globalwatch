'use client'
import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then(r => r.json())

interface MarketItem {
  symbol: string
  name: string
  price: number
  changePercent: number
  type: string
}

interface CryptoItem {
  symbol: string
  price: number
  change24h: number
}

function TickerItem({ name, price, change, type }: {
  name: string; price: number; change: number; type: string
}) {
  const up = change >= 0
  const color = up ? '#22c55e' : '#ef4444'
  const arrow = up ? '▲' : '▼'

  function fmt(p: number, t: string) {
    if (t === 'forex') return p.toFixed(4)
    if (p >= 10000) return p.toLocaleString('en-US', { maximumFractionDigits: 0 })
    if (p >= 100)   return p.toLocaleString('en-US', { maximumFractionDigits: 2 })
    if (p >= 1)     return p.toFixed(2)
    return p.toFixed(6)
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-3 font-mono text-xs"
      style={{ borderRight: '1px solid var(--border)' }}>
      <span style={{ color: 'var(--text-muted)' }}>{name}</span>
      <span style={{ color: 'var(--text)' }}>{fmt(price, type)}</span>
      <span style={{ color }}>{arrow} {Math.abs(change).toFixed(2)}%</span>
    </span>
  )
}

export default function MarketsTicker() {
  const { data: m } = useSWR('/api/markets', fetcher, { refreshInterval: 60000 })
  const { data: c } = useSWR('/api/crypto',  fetcher, { refreshInterval: 60000 })

  const markets: MarketItem[] = m?.data ?? []
  const crypto:  CryptoItem[] = (c?.data ?? []).slice(0, 5)

  if (!markets.length && !crypto.length) {
    return (
      <div className="h-full flex items-center px-4 font-mono text-xs"
        style={{ color: 'var(--text-muted)' }}>
        Loading markets...
      </div>
    )
  }

  const items = [
    ...markets.slice(0, 8).map(m => ({
      name: m.name, price: m.price,
      change: m.changePercent, type: m.type,
    })),
    ...crypto.map(c => ({
      name: c.symbol, price: c.price,
      change: c.change24h, type: 'crypto',
    })),
  ]

  const doubled = [...items, ...items]

  return (
    <div className="overflow-hidden h-full flex items-center"
      style={{ background: 'var(--bg-surface2)' }}>
      <div className="ticker-inner">
        {doubled.map((item, i) => (
          <TickerItem key={i} {...item} />
        ))}
      </div>
    </div>
  )
}
