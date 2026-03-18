'use client'
import { memo, useMemo, useEffect } from 'react'
import { useMap } from 'react-leaflet'
import { useGPSJam } from '@/hooks/useGPSJam'
import type { TimeFilter } from '@/types/events'
import type { GPSJamZone } from '@/app/api/gpsjam/route'

interface Props {
  visible: boolean
  timeFilter: TimeFilter
}

const SEVERITY_COLORS: Record<string, string> = {
  critical: '#EF4444',
  high:     '#F97316',
  medium:   '#EAB308',
}

function GPSJamLayerInner({ visible }: Props) {
  const map = useMap()
  const { zones } = useGPSJam()

  const filtered = useMemo(() => visible ? zones : [], [zones, visible])

  useEffect(() => {
    if (typeof window === 'undefined') return
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const L = require('leaflet')
    const circles: ReturnType<typeof L.circle>[] = []

    filtered.forEach((zone: GPSJamZone) => {
      const color = SEVERITY_COLORS[zone.severity] ?? '#EAB308'
      const circle = L.circle([zone.lat, zone.lon], {
        radius: zone.radius * 1000,
        color,
        fillColor: color,
        fillOpacity: 0.08,
        weight: 1,
        opacity: 0.5,
        dashArray: '4 4',
      })
      circle.bindPopup(`
        <div style="background:#111118;color:#F0F0F0;font-family:monospace;padding:8px;min-width:200px;font-size:12px;">
          <div style="color:${color};font-weight:bold;margin-bottom:4px;">📡 GPS JAMMING ZONE</div>
          <div style="margin-bottom:2px;font-weight:bold;">${zone.region}</div>
          <div style="color:#888;margin-bottom:2px;font-size:11px;">${zone.description}</div>
          <div style="color:#888;margin-top:4px;">Radius: ~${zone.radius}km</div>
          <div style="color:${color};margin-top:2px;text-transform:uppercase;">
            Severity: ${zone.severity}
          </div>
        </div>
      `)
      circle.addTo(map)
      circles.push(circle)
    })

    return () => { circles.forEach((c) => map.removeLayer(c)) }
  }, [filtered, map])

  return null
}

export const GPSJamLayer = memo(GPSJamLayerInner)
export default GPSJamLayer
