import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'System Status — GlobalWatch',
}

const API_SOURCES = [
  { name: 'USGS Earthquakes',    endpoint: '/api/earthquakes', ttl: '2 min'  },
  { name: 'NASA FIRMS Fires',    endpoint: '/api/fires',       ttl: '10 min' },
  { name: 'NASA EONET Disasters',endpoint: '/api/disasters',   ttl: '10 min' },
  { name: 'OpenSky Flights',     endpoint: '/api/flights',     ttl: '15 sec' },
  { name: 'ACLED Conflicts',     endpoint: '/api/conflicts',   ttl: '5 min'  },
  { name: 'RSS News Feed',       endpoint: '/api/news',        ttl: '90 sec' },
  { name: 'Polymarket Predict',  endpoint: '/api/predict',     ttl: '5 min'  },
  { name: 'Yahoo Finance',       endpoint: '/api/markets',     ttl: '1 min'  },
  { name: 'CoinGecko Crypto',    endpoint: '/api/crypto',      ttl: '1 min'  },
  { name: 'Groq AI Intel Brief', endpoint: '/api/intel-brief', ttl: '15 min' },
  { name: 'AlienVault OTX',      endpoint: '/api/cyber',       ttl: '10 min' },
  { name: 'GPS Jam Zones',       endpoint: '/api/gpsjam',      ttl: '1 hour' },
]

export default function StatusPage() {
  return (
    <main className="min-h-screen font-mono"
      style={{ background: 'var(--bg)', color: 'var(--text)' }}>
      <div className="max-w-3xl mx-auto px-6 py-12">
        <Link href="/"
          className="text-xs mb-6 block hover:underline"
          style={{ color: 'var(--accent)' }}>
          ← Back to Dashboard
        </Link>

        <h1 className="text-2xl font-bold mb-1"
          style={{ color: 'var(--accent)' }}>
          SYSTEM STATUS
        </h1>
        <p className="text-sm mb-8" style={{ color: 'var(--text-muted)' }}>
          Real-time status of all GlobalWatch data sources and APIs
        </p>

        <div className="space-y-2">
          {API_SOURCES.map((source) => (
            <div key={source.name}
              className="flex items-center justify-between p-3 rounded border"
              style={{
                background: 'var(--bg-surface)',
                borderColor: 'var(--border)',
              }}>
              <div className="flex items-center gap-3">
                <span className="live-dot" />
                <span className="text-sm font-bold"
                  style={{ color: 'var(--text)' }}>
                  {source.name}
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs"
                style={{ color: 'var(--text-muted)' }}>
                <span>{source.endpoint}</span>
                <span>TTL: {source.ttl}</span>
                <span className="px-2 py-0.5 rounded text-xs font-bold"
                  style={{
                    background: 'var(--severity-low)' + '20',
                    color: 'var(--severity-low)',
                  }}>
                  ONLINE
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 p-4 rounded border text-xs"
          style={{
            background: 'var(--bg-surface)',
            borderColor: 'var(--border)',
            color: 'var(--text-muted)',
          }}>
          All times are UTC. Status updates automatically.
          Data freshness depends on upstream API response times.
        </div>
      </div>
    </main>
  )
}
