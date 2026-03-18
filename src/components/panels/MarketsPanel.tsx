'use client'
import { useState } from 'react'
import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

interface MarketItem {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  type: 'index' | 'commodity' | 'forex' | 'crypto'
}

interface CryptoItem {
  id: string
  name: string
  symbol: string
  icon: string
  price: number
  change24h: number
  marketCap: number
}

type Tab = 'indices' | 'commodities' | 'forex' | 'crypto'

const TAB_LABELS: Record<Tab, string> = {
  indices:     '📈 INDICES',
  commodities: '🛢 COMMODITIES',
  forex:       '💱 FOREX',
  crypto:      '₿ CRYPTO',
}

function formatPrice(price: number, type: string): string {
  if (type === 'forex') return price.toFixed(4)
  if (price >= 1000) return price.toLocaleString('en-US', { maximumFractionDigits: 2 })
  return price.toFixed(2)
}

function formatMarketCap(n: number): string {
  if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T` 
  if (n >= 1e9)  return `$${(n / 1e9).toFixed(2)}B` 
  if (n >= 1e6)  return `$${(n / 1e6).toFixed(2)}M` 
  return `$${n.toFixed(0)}` 
}

export default function MarketsPanel() {
  const [tab, setTab] = useState<Tab>('indices')

  const { data: marketsData, isLoading: mLoading } = useSWR('/api/markets', fetcher, {
    refreshInterval: 60000,
    revalidateOnFocus: false,
  })

  const { data: cryptoData, isLoading: cLoading } = useSWR('/api/crypto', fetcher, {
    refreshInterval: 60000,
    revalidateOnFocus: false,
  })

  const markets: MarketItem[] = marketsData?.data ?? []
  const crypto: CryptoItem[]  = cryptoData?.data ?? []

  const filtered = tab === 'crypto'
    ? []
    : markets.filter((m) => {
        if (tab === 'indices')     return m.type === 'index'
        if (tab === 'commodities') return m.type === 'commodity'
        if (tab === 'forex')       return m.type === 'forex'
        return false
      })

  const isLoading = tab === 'crypto' ? cLoading : mLoading
  const isBaseline = tab === 'crypto' ? cryptoData?.baseline : marketsData?.baseline

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-3 border-b border-border flex items-center justify-between flex-shrink-0">
        <span className="text-accent font-mono text-xs font-bold uppercase tracking-widest">
          Markets
        </span>
        <div className="flex items-center gap-1">
          <span className={isBaseline ? 'text-gray-500' : 'text-green-400'}>●</span>
          <span className="text-text-muted font-mono text-xs">
            {isBaseline ? 'OFFLINE' : 'LIVE'}
          </span>
        </div>
      </div>

      {/* Tab bar */}
      <div className="grid grid-cols-4 border-b border-border flex-shrink-0">
        {(Object.keys(TAB_LABELS) as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`py-1.5 text-xs font-mono transition-all border-b-2 ${
              tab === t
                ? 'text-accent border-accent'
                : 'text-text-muted border-transparent hover:text-text-primary'
            }`}
          >
            {t.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {isLoading && (
          <div className="p-4 text-text-muted font-mono text-xs animate-pulse">
            Fetching market data...
          </div>
        )}

        {/* Indices / Commodities / Forex */}
        {!isLoading && tab !== 'crypto' && filtered.map((item) => {
          const up = item.changePercent >= 0
          const color = up ? '#22C55E' : '#EF4444'
          return (
            <div key={item.symbol}
              className="px-3 py-2 border-b border-border flex items-center
                justify-between hover:bg-white/5 transition-colors">
              <div>
                <div className="font-mono text-xs text-text-primary font-bold">
                  {item.name}
                </div>
                <div className="font-mono text-xs text-text-muted">
                  {item.symbol}
                </div>
              </div>
              <div className="text-right">
                <div className="font-mono text-xs font-bold text-text-primary tabular-nums">
                  {item.price === 0 ? '—' : formatPrice(item.price, item.type)}
                </div>
                <div className="font-mono text-xs tabular-nums" style={{ color }}>
                  {up ? '▲' : '▼'} {Math.abs(item.changePercent).toFixed(2)}%
                </div>
              </div>
            </div>
          )
        })}

        {/* Crypto */}
        {!isLoading && tab === 'crypto' && crypto.map((coin) => {
          const up = coin.change24h >= 0
          const color = up ? '#22C55E' : '#EF4444'
          return (
            <div key={coin.id}
              className="px-3 py-2 border-b border-border flex items-center
                justify-between hover:bg-white/5 transition-colors">
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-bold text-accent w-5 text-center">
                  {coin.icon}
                </span>
                <div>
                  <div className="font-mono text-xs text-text-primary font-bold">
                    {coin.symbol}
                  </div>
                  <div className="font-mono text-xs text-text-muted">
                    {formatMarketCap(coin.marketCap)}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-mono text-xs font-bold text-text-primary tabular-nums">
                  ${coin.price >= 1
                    ? coin.price.toLocaleString('en-US', { maximumFractionDigits: 2 })
                    : coin.price.toFixed(6)}
                </div>
                <div className="font-mono text-xs tabular-nums" style={{ color }}>
                  {up ? '▲' : '▼'} {Math.abs(coin.change24h).toFixed(2)}%
                </div>
              </div>
            </div>
          )
        })}

        {!isLoading && isBaseline && (
          <div className="p-4 text-text-muted font-mono text-xs text-center">
            Market data temporarily unavailable
          </div>
        )}
      </div>
    </div>
  )
}
