'use client'
import { memo, useMemo, useEffect, useState, useCallback } from 'react'
import { useMap } from 'react-leaflet'
import { useWindyWebcams } from '@/hooks/useWindyWebcams'
import type { WindyWebcamEvent } from '@/app/api/windy-webcams/route'
import type { TimeFilter } from '@/types/events'

interface Props {
  visible: boolean
  timeFilter: TimeFilter
}

// ─── Modal Component ──────────────────────────────────────
function WindyModal({
  cam,
  onClose,
}: {
  cam: WindyWebcamEvent
  onClose: () => void
}) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  // Use playerDayUrl if playerLiveUrl not available
  const playerUrl = cam.playerLiveUrl || cam.playerDayUrl

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.88)' }}
      onClick={onClose}
    >
      <div
        className="relative rounded overflow-hidden flex flex-col"
        style={{
          width: '680px',
          maxWidth: '96vw',
          maxHeight: '90vh',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          boxShadow: '0 0 40px rgba(0,212,255,0.15)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-3 flex-shrink-0"
          style={{
            borderBottom: '1px solid var(--border)',
            background: 'var(--bg-surface2)',
          }}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex flex-col min-w-0">
              <div className="font-mono font-bold text-sm truncate"
                style={{ color: 'var(--accent)' }}>
                📷 {cam.title}
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                {cam.city && (
                  <span className="font-mono text-xs"
                    style={{ color: 'var(--text-muted)' }}>
                    📍 {cam.city}, {cam.country}
                  </span>
                )}
                <span
                  className="px-1.5 py-0.5 rounded font-mono font-bold"
                  style={{
                    background: 'var(--severity-high)' + '20',
                    color: 'var(--severity-high)',
                    fontSize: '10px',
                  }}
                >
                  {cam.zone}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <a
              href={cam.detailUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-xs px-2 py-1 rounded border
                transition-colors hover:underline"
              style={{
                borderColor: 'var(--border)',
                color: 'var(--text-muted)',
              }}
            >
              ↗ Windy
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
              ✕
            </button>
          </div>
        </div>

        {/* Preview image shown while player loads */}
        <div
          className="flex-1 relative overflow-hidden"
          style={{ minHeight: '300px', background: '#000' }}
        >
          {playerUrl ? (
            <iframe
              src={playerUrl}
              className="w-full h-full"
              style={{ minHeight: '300px', aspectRatio: '16/9' }}
              allowFullScreen
              allow="autoplay; fullscreen"
              title={cam.title}
            />
          ) : cam.previewUrl ? (
            // No player URL — show static preview image
            <div className="w-full h-full flex flex-col
              items-center justify-center"
              style={{ aspectRatio: '16/9' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={cam.previewUrl}
                alt={cam.title}
                className="w-full h-full object-contain"
              />
              <div className="absolute bottom-2 left-0 right-0
                text-center font-mono text-xs py-1"
                style={{
                  color: '#fff',
                  background: 'rgba(0,0,0,0.7)',
                  fontSize: '10px',
                }}>
                ⚠ Live player not available — showing latest snapshot
              </div>
            </div>
          ) : (
            <div className="w-full h-full flex items-center
              justify-center font-mono text-xs"
              style={{ color: 'var(--text-muted)' }}>
              No preview available
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="px-4 py-2 flex items-center justify-between
            font-mono text-xs flex-shrink-0"
          style={{
            borderTop: '1px solid var(--border)',
            color: 'var(--text-muted)',
            background: 'var(--bg-surface2)',
          }}
        >
          <span>📡 Powered by Windy.com Webcams</span>
          <span style={{ color: 'var(--text-dim)', fontSize: '10px' }}>
            ⚠ Preview URLs expire every 15 min (free tier)
          </span>
        </div>
      </div>
    </div>
  )
}

// ─── Main Layer ────────────────────────────────────────────
function WindyWebcamLayerInner({ visible }: Props) {
  const map = useMap()
  const { webcams, loading, count } = useWindyWebcams()
  const [selectedCam, setSelectedCam] =
    useState<WindyWebcamEvent | null>(null)

  const handleClose = useCallback(() => setSelectedCam(null), [])

  const filtered = useMemo(
    () => (visible ? webcams : []),
    [webcams, visible]
  )

  useEffect(() => {
    if (typeof window === 'undefined' || !filtered.length) return
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const L = require('leaflet')
    const markers: ReturnType<typeof L.marker>[] = []

    filtered.forEach((cam: WindyWebcamEvent) => {
      // Camera icon with live indicator
      const icon = L.divIcon({
        className: '',
        html: `
          <div style="
            position: relative;
            width: 22px;
            height: 18px;
            cursor: pointer;
          ">
            <div style="
              width: 22px;
              height: 14px;
              background: #0a0a1f;
              border: 1.5px solid #00D4FF;
              border-radius: 3px;
              position: absolute;
              top: 2px;
              left: 0;
              display: flex;
              align-items: center;
              justify-content: center;
              box-shadow: 0 0 8px #00D4FF50;
            ">
              <div style="
                width: 7px;
                height: 7px;
                border-radius: 50%;
                background: #00D4FF;
                opacity: 0.9;
              "></div>
            </div>
            <div style="
              position: absolute;
              top: 0;
              right: -1px;
              width: 6px;
              height: 6px;
              background: #22c55e;
              border-radius: 50%;
              border: 1px solid #0a0a0f;
            "></div>
          </div>
        `,
        iconSize: [22, 18],
        iconAnchor: [11, 9],
      })

      const marker = L.marker([cam.lat, cam.lon], { icon, zIndexOffset: 100 })

      // Tooltip on hover (lightweight, no click needed)
      marker.bindTooltip(`
        <div style="
          background:#111118;
          color:#00D4FF;
          font-family:monospace;
          font-size:10px;
          padding:4px 8px;
          border-radius:3px;
          border:1px solid #1e1e2e;
          white-space:nowrap;
          max-width:200px;
          overflow:hidden;
          text-overflow:ellipsis;
        ">
          📷 ${cam.title}
          <span style="color:#888;display:block;font-size:9px;">
            ${cam.city ? cam.city + ', ' : ''}${cam.country}
          </span>
        </div>
      `, {
        permanent: false,
        direction: 'top',
        offset: [0, -10],
        opacity: 1,
        className: 'gw-tooltip',
      })

      // Single click = open modal immediately
      marker.on('click', () => {
        setSelectedCam(cam)
      })

      marker.addTo(map)
      markers.push(marker)
    })

    return () => {
      markers.forEach(m => map.removeLayer(m))
    }
  }, [filtered, map])

  if (!visible) return null

  return (
    <>
      {selectedCam && (
        <WindyModal cam={selectedCam} onClose={handleClose} />
      )}
    </>
  )
}

export const WindyWebcamLayer = memo(WindyWebcamLayerInner)
export default WindyWebcamLayer
