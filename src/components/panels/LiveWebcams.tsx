'use client'
import { useState } from 'react'
import { WEBCAM_FEEDS, WEBCAM_REGIONS } from '@/lib/streamSources'
import type { WebcamFeed } from '@/lib/streamSources'

const DEFAULT_GRID_IDS = [
  'iran-jerusalem',
  'iran-tehran',
  'iran-telaviv',
  'mecca',
]

function WebcamThumb({
  cam,
  onClick,
}: {
  cam: WebcamFeed
  onClick: () => void
}) {
  const [err, setErr] = useState(false)

  const thumbUrl = `https://img.youtube.com/vi/${cam.videoId}/mqdefault.jpg` 

  return (
    <button
      onClick={onClick}
      className="relative rounded overflow-hidden transition-all
        group text-left flex-shrink-0"
      style={{
        aspectRatio: '16/9',
        background: '#000',
        border: '1px solid var(--border)',
        display: 'block',
        width: '100%',
      }}
    >
      {!err ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={thumbUrl}
          alt={cam.name}
          className="w-full h-full object-cover"
          onError={() => setErr(true)}
          loading="lazy"
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center
          justify-center"
          style={{ background: 'var(--bg-surface2)' }}>
          <span style={{ fontSize: '24px' }}>{cam.flag}</span>
          <span className="font-mono mt-1"
            style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
            {cam.city}
          </span>
        </div>
      )}

      <div className="absolute top-1 left-1 flex items-center gap-0.5
        px-1.5 py-0.5 rounded"
        style={{ background: 'rgba(0,0,0,0.75)' }}>
        <span style={{ color: '#ef4444', fontSize: '7px' }}
          className="animate-pulse">●</span>
        <span className="font-mono"
          style={{ color: '#fff', fontSize: '9px' }}>
          LIVE
        </span>
      </div>

      <div className="absolute bottom-0 left-0 right-0"
        style={{
          background: 'linear-gradient(transparent, rgba(0,0,0,0.92))',
          padding: '16px 6px 4px',
        }}>
        <div className="font-mono font-bold text-white truncate"
          style={{ fontSize: '10px' }}>
          {cam.flag} {cam.city?.toUpperCase()}
        </div>
        <div className="font-mono truncate"
          style={{ color: 'rgba(255,255,255,0.55)', fontSize: '9px' }}>
          {cam.country}
        </div>
      </div>

      <div className="absolute inset-0 bg-transparent
        group-hover:bg-black/30 transition-colors
        flex items-center justify-center">
        <span className="opacity-0 group-hover:opacity-100
          font-mono text-white rounded px-2 py-1
          border border-white/30 transition-opacity"
          style={{
            fontSize: '10px',
            background: 'rgba(0,0,0,0.8)',
          }}>
          ▶ Watch Live
        </span>
      </div>

      <a
        href={cam.watchUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute top-1 right-1 opacity-0 group-hover:opacity-100
          transition-opacity font-mono text-white rounded px-1 py-0.5"
        style={{
          fontSize: '9px',
          background: 'rgba(0,0,0,0.75)',
          zIndex: 10,
        }}
        onClick={e => e.stopPropagation()}
      >
        ↗
      </a>
    </button>
  )
}

function ExpandedWebcam({
  cam,
  onClose,
}: {
  cam: WebcamFeed
  onClose: () => void
}) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-2
        border-b flex-shrink-0"
        style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-2">
          <span style={{ fontSize: '18px' }}>{cam.flag}</span>
          <div>
            <div className="font-mono text-xs font-bold"
              style={{ color: 'var(--accent)' }}>
              {cam.name}
            </div>
            <div className="font-mono"
              style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
              {cam.city}, {cam.country}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <a
            href={cam.watchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-xs px-2 py-1 rounded border
              transition-colors"
            style={{
              borderColor: 'var(--border)',
              color: 'var(--text-muted)',
            }}
          >
            ↗ YouTube
          </a>
          <button
            onClick={onClose}
            className="font-mono text-xs px-2 py-1 rounded border
              transition-colors"
            style={{
              borderColor: 'var(--border)',
              color: 'var(--text-muted)',
            }}
          >
            ⊞ Grid
          </button>
        </div>
      </div>

      <div className="flex-1 relative overflow-hidden"
        style={{ background: '#000' }}>
        <iframe
          key={cam.id}
          src={`https://www.youtube.com/embed/${cam.videoId}?autoplay=1&mute=0&rel=0&modestbranding=1`}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media"
          allowFullScreen
          title={cam.name}
        />
        <div className="absolute top-2 left-2 flex items-center gap-1
          px-2 py-1 rounded font-mono text-white pointer-events-none"
          style={{ background: 'rgba(0,0,0,0.75)', fontSize: '11px' }}>
          <span style={{ color: '#22c55e' }} className="animate-pulse">●</span>
          LIVE — {cam.flag} {cam.city}
        </div>
      </div>
    </div>
  )
}

export default function LiveWebcams() {
  const [region, setRegion]     = useState('iran')
  const [expanded, setExpanded] = useState<string | null>(null)

  const expandedCam = WEBCAM_FEEDS.find(w => w.id === expanded)

  if (expandedCam) {
    return (
      <ExpandedWebcam
        cam={expandedCam}
        onClose={() => setExpanded(null)}
      />
    )
  }

  const filtered = region === 'iran'
    ? WEBCAM_FEEDS.filter(w =>
        DEFAULT_GRID_IDS.includes(w.id)
      )
    : region === 'all'
    ? WEBCAM_FEEDS
    : WEBCAM_FEEDS.filter(w => w.region === region)

  return (
    <div className="flex flex-col h-full">

      <div className="flex gap-1 p-1.5 border-b overflow-x-auto flex-shrink-0"
        style={{ borderColor: 'var(--border)' }}>
        {[
          { id: 'iran',     label: 'IRAN ATTACKS' },
          { id: 'all',      label: 'ALL' },
          { id: 'mena',     label: 'MIDEAST' },
          { id: 'europe',   label: 'EUROPE' },
          { id: 'americas', label: 'AMERICAS' },
          { id: 'eastasia', label: 'ASIA' },
          { id: 'space',    label: 'SPACE' },
        ].map(r => (
          <button
            key={r.id}
            onClick={() => setRegion(r.id)}
            className="px-2 py-0.5 font-mono rounded
              whitespace-nowrap flex-shrink-0 transition-all"
            style={{
              fontSize: '10px',
              background: region === r.id
                ? 'var(--primary)' : 'transparent',
              color: region === r.id
                ? '#fff' : 'var(--text-muted)',
            }}
          >
            {r.label}
          </button>
        ))}
      </div>

      <div className="px-3 py-1 border-b flex-shrink-0"
        style={{ borderColor: 'var(--border)' }}>
        <span className="font-mono"
          style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
          {filtered.length} live cameras • click to watch
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '6px',
        }}>
          {filtered.map(cam => (
            <WebcamThumb
              key={cam.id}
              cam={cam}
              onClick={() => setExpanded(cam.id)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
