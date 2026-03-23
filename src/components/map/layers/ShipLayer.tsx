'use client'
import { memo, useMemo, useEffect } from 'react'
import { useMap } from 'react-leaflet'
import { useShips } from '@/hooks/useShips'
import type { TimeFilter, ShipEvent, BaseEvent } from '@/types/events'

interface Props {
  visible: boolean
  timeFilter: TimeFilter
  onEventSelect?: (event: BaseEvent) => void
}

const TYPE_COLORS: Record<ShipEvent['type'], string> = {
  cargo:     '#06B6D4',  // cyan
  tanker:    '#F97316',  // orange
  military:  '#EF4444',  // red
  passenger: '#3B82F6',  // blue
  fishing:   '#22C55E',  // green
  unknown:   '#6B7280',  // gray
}

const TYPE_ICONS: Record<ShipEvent['type'], string> = {
  cargo:     '🚢',
  tanker:    '🛢',
  military:  '⚔',
  passenger: '🛳',
  fishing:   '🐟',
  unknown:   '⛵',
}

function formatSpeed(knots: number): string {
  if (!knots) return '—'
  return knots.toFixed(1) + ' kts'
}

function buildPopupHtml(ship: ShipEvent, color: string): string {
  return `
    <div style="background:#111118;color:#F0F0F0;font-family:monospace;padding:10px;min-width:220px;font-size:12px;border-radius:4px;">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
        <div style="color:${color};font-weight:bold;font-size:14px;">
          ${TYPE_ICONS[ship.type]} ${ship.name}
        </div>
        <div style="background:${color}22;border:1px solid ${color}60;border-radius:3px;
          padding:2px 6px;font-size:10px;color:${color};text-transform:uppercase;">
          ${ship.type}
        </div>
      </div>
      ${ship.chokepoint ? `
        <div style="background:#1A1A28;border:1px solid #F9731620;border-radius:3px;
          padding:4px 8px;margin-bottom:8px;color:#F97316;font-size:11px;">
          📍 ${ship.chokepoint}
        </div>
      ` : ''}
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;margin-bottom:6px;">
        <div style="background:#1A1A28;border-radius:3px;padding:4px 6px;">
          <div style="color:#888;font-size:9px;text-transform:uppercase;">Speed</div>
          <div style="color:#F0F0F0;font-size:11px;font-weight:bold;">${formatSpeed(ship.speed)}</div>
        </div>
        <div style="background:#1A1A28;border-radius:3px;padding:4px 6px;">
          <div style="color:#888;font-size:9px;text-transform:uppercase;">Heading</div>
          <div style="color:#F0F0F0;font-size:11px;font-weight:bold;">${Math.round(ship.heading)}°</div>
        </div>
        ${ship.flag ? `
          <div style="background:#1A1A28;border-radius:3px;padding:4px 6px;">
            <div style="color:#888;font-size:9px;text-transform:uppercase;">Flag</div>
            <div style="color:#F0F0F0;font-size:11px;font-weight:bold;">${ship.flag}</div>
          </div>
        ` : ''}
        ${ship.destination ? `
          <div style="background:#1A1A28;border-radius:3px;padding:4px 6px;">
            <div style="color:#888;font-size:9px;text-transform:uppercase;">Destination</div>
            <div style="color:#F0F0F0;font-size:11px;font-weight:bold;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${ship.destination}</div>
          </div>
        ` : ''}
      </div>
      <div style="color:#888;font-size:10px;">
        MMSI: ${ship.mmsi}
      </div>
    </div>
  `
}

function ShipLayerInner({ visible, onEventSelect }: Props) {
  const map = useMap()
  const { ships } = useShips()

  const filtered = useMemo(
    () => visible ? ships.slice(0, 2000) : [],
    [ships, visible]
  )

  useEffect(() => {
    if (typeof window === 'undefined' || !filtered.length) return
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const L = require('leaflet')
    const markers: ReturnType<typeof L.marker>[] = []

    filtered.forEach((ship: ShipEvent) => {
      const color = TYPE_COLORS[ship.type] ?? '#06B6D4'
      const rotate = ship.heading ?? 0

      // Larger icon for military, chokepoint-positioned vessels
      const isHighlight = ship.type === 'military' || !!ship.chokepoint
      const size = isHighlight ? 16 : 12

      const icon = L.divIcon({
        className: '',
        html: `<div style="
          width:${size}px;height:${size}px;
          font-size:${size}px;line-height:${size}px;
          text-align:center;cursor:pointer;
          filter:drop-shadow(0 0 3px ${color});
          transform:rotate(${rotate}deg);
        ">${TYPE_ICONS[ship.type]}</div>`,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
      })

      const marker = L.marker([ship.lat, ship.lon], { icon, zIndexOffset: isHighlight ? 200 : 50 })
      marker.bindPopup(buildPopupHtml(ship, color), {
        maxWidth: 260,
        className: 'gw-popup',
      })
      marker.on('click', () => onEventSelect?.(ship))
      marker.addTo(map)
      markers.push(marker)
    })

    return () => { markers.forEach((m) => map.removeLayer(m)) }
  }, [filtered, map, onEventSelect])

  return null
}

export const ShipLayer = memo(ShipLayerInner)
export default ShipLayer
