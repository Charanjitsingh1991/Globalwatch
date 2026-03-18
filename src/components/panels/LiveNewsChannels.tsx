'use client'
import { useState, useEffect } from 'react'
import {
  NEWS_CHANNELS, STREAM_REGIONS,
  type StreamRegion, type NewsChannel,
} from '@/lib/streamSources'

interface HLSPlayerProps {
  channel: NewsChannel
}

function HLSPlayer({ channel }: HLSPlayerProps) {
  const [failed, setFailed] = useState(false)

  const embedSrc = `https://www.youtube.com/embed/live_stream?channel=${channel.channelId}&autoplay=1&mute=0&rel=0&modestbranding=1`

  if (failed) {
    return (
      <div className="absolute inset-0 flex flex-col items-center
        justify-center p-4 text-center"
        style={{ background: 'var(--bg)' }}>
        <div className="text-3xl mb-2">{channel.flag}</div>
        <div className="font-mono text-sm font-bold mb-1"
          style={{ color: 'var(--text)' }}>
          {channel.name}
        </div>
        <div className="font-mono text-xs mb-3"
          style={{ color: 'var(--text-muted)' }}>
          Stream unavailable in embed
        </div>
        <a href={channel.watchUrl} target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-3 py-1.5 rounded text-xs
            font-mono text-white transition-colors"
          style={{ background: '#dc2626' }}>
          ▶ Watch on YouTube
        </a>
      </div>
    )
  }

  return (
    <iframe
      key={channel.id}
      src={embedSrc}
      className="w-full h-full"
      allow="accelerometer; autoplay; clipboard-write;
        encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
      title={channel.name}
      onError={() => setFailed(true)}
    />
  )
}

export default function LiveNewsChannels() {
  const [region, setRegion] = useState<StreamRegion>('all')
  const [activeId, setActiveId] = useState(NEWS_CHANNELS[0].id)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  const filtered = region === 'all'
    ? NEWS_CHANNELS
    : NEWS_CHANNELS.filter(c => c.category === region)

  const current = NEWS_CHANNELS.find(c => c.id === activeId)
    ?? NEWS_CHANNELS[0]

  return (
    <div className="flex flex-col h-full">

      <div className="relative flex-shrink-0"
        style={{ aspectRatio: '16/9', background: '#000' }}>
        {mounted && <HLSPlayer key={activeId} channel={current} />}

        <div className="absolute top-2 left-2 z-10 flex items-center gap-1.5
          px-2 py-1 rounded font-mono text-xs text-white pointer-events-none"
          style={{ background: 'rgba(0,0,0,0.8)' }}>
          <span style={{ color: '#ef4444' }} className="animate-pulse">●</span>
          {current.flag} {current.name}
          <span style={{ color: 'rgba(255,255,255,0.4)' }}>
            {current.language}
          </span>
        </div>

        <a href={current.watchUrl} target="_blank"
          rel="noopener noreferrer"
          className="absolute top-2 right-2 z-10 flex items-center gap-1
            px-2 py-1 rounded font-mono text-xs text-white transition-colors"
          style={{ background: 'rgba(0,0,0,0.7)' }}>
          ↗ YT
        </a>
      </div>

      <div className="flex gap-1 p-1.5 border-b overflow-x-auto flex-shrink-0"
        style={{ borderColor: 'var(--border)' }}>
        {STREAM_REGIONS.map(r => (
          <button key={r.id}
            onClick={() => setRegion(r.id as StreamRegion)}
            className="px-1.5 py-0.5 text-xs font-mono rounded
              whitespace-nowrap flex-shrink-0 transition-all"
            style={{
              background: region === r.id ? 'var(--primary)' : 'transparent',
              color: region === r.id ? '#fff' : 'var(--text-muted)',
            }}>
            {r.flag} {r.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-1.5">
        <div className="grid grid-cols-2 gap-1">
          {filtered.map(ch => (
            <button key={ch.id}
              onClick={() => setActiveId(ch.id)}
              className="text-left p-1.5 rounded border transition-all
                font-mono text-xs"
              style={{
                borderColor: activeId === ch.id
                  ? 'var(--primary)' : 'var(--border)',
                background: activeId === ch.id
                  ? 'var(--primary-dim)' : 'transparent',
                color: activeId === ch.id
                  ? 'var(--accent)' : 'var(--text-muted)',
              }}>
              <div className="flex items-center gap-1 mb-0.5">
                <span>{ch.flag}</span>
                {activeId === ch.id && (
                  <span style={{ color: '#ef4444' }}
                    className="animate-pulse text-xs">●</span>
                )}
                <span className="ml-auto opacity-40 text-xs">
                  {ch.language}
                </span>
              </div>
              <div className="font-bold truncate" style={{ fontSize: '10px' }}>
                {ch.name}
              </div>
              <div className="truncate opacity-50" style={{ fontSize: '10px' }}>
                {ch.country}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
