'use client'
import { memo, useMemo, useEffect, useState } from 'react'
import { useMap } from 'react-leaflet'
import type { TimeFilter } from '@/types/events'

interface MilitaryBase {
  id: string
  name: string
  country: string
  lat: number
  lon: number
  type: 'naval' | 'airforce' | 'army'
  significance: 'critical' | 'high' | 'medium'
}

interface Props {
  visible: boolean
  timeFilter: TimeFilter
}

const TYPE_ICONS: Record<string, string> = {
  naval:    '⚓',
  airforce: '✈',
  army:     '🎖',
}

const SIG_COLORS: Record<string, string> = {
  critical: '#EF4444',
  high:     '#F97316',
  medium:   '#EAB308',
}

function MilitaryBaseLayerInner({ visible }: Props) {
  const map = useMap()
  const [bases, setBases] = useState<MilitaryBase[]>([])

  useEffect(() => {
    if (!visible) return
    fetch('/data/military-bases.json')
      .then((r) => r.json())
      .then((d) => setBases(d.bases ?? []))
      .catch(() => null)
  }, [visible])

  useEffect(() => {
    if (typeof window === 'undefined' || !bases.length || !visible) return
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const L = require('leaflet')
    const markers: ReturnType<typeof L.marker>[] = []

    bases.forEach((base) => {
      const color = SIG_COLORS[base.significance] ?? '#6B7280'
      const icon = L.divIcon({
        className: '',
        html: `<div style="
          background:${color}22;
          border:1px solid ${color};
          border-radius:3px;
          padding:1px 3px;
          font-size:9px;
          color:${color};
          white-space:nowrap;
          font-family:monospace;
          font-weight:bold;
          box-shadow:0 0 4px ${color}40;
        ">${TYPE_ICONS[base.type] ?? '⬛'}</div>`,
        iconSize: [20, 16],
        iconAnchor: [10, 8],
      })

      const marker = L.marker([base.lat, base.lon], { icon })
      marker.bindPopup(`
        <div style="background:#111118;color:#F0F0F0;font-family:monospace;padding:8px;min-width:200px;font-size:12px;">
          <div style="color:${color};font-weight:bold;margin-bottom:4px;">
            ${TYPE_ICONS[base.type]} MILITARY BASE
          </div>
          <div style="font-weight:bold;margin-bottom:2px;">${base.name}</div>
          <div style="color:#888;margin-bottom:2px;">Country: ${base.country}</div>
          <div style="color:#888;margin-bottom:2px;">Type: ${base.type.toUpperCase()}</div>
          <div style="color:${color};text-transform:uppercase;">
            Significance: ${base.significance}
          </div>
        </div>
      `)
      marker.addTo(map)
      markers.push(marker)
    })

    return () => { markers.forEach((m) => map.removeLayer(m)) }
  }, [bases, visible, map])

  return null
}

export const MilitaryBaseLayer = memo(MilitaryBaseLayerInner)
export default MilitaryBaseLayer
