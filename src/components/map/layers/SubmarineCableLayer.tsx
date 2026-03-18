'use client'
import { memo, useMemo, useEffect, useState } from 'react'
import { useMap } from 'react-leaflet'
import type { TimeFilter } from '@/types/events'

interface Cable {
  id: string
  name: string
  color: string
  path: [number, number][]
}

interface LandingStation {
  id: string
  name: string
  lat: number
  lon: number
  cables: number
}

interface CableData {
  cables: Cable[]
  landingStations: LandingStation[]
}

interface Props {
  visible: boolean
  timeFilter: TimeFilter
}

function SubmarineCableLayerInner({ visible }: Props) {
  const map = useMap()
  const [cableData, setCableData] = useState<CableData | null>(null)

  useEffect(() => {
    if (!visible) return
    fetch('/data/submarine-cables.json')
      .then((r) => r.json())
      .then(setCableData)
      .catch(() => null)
  }, [visible])

  useEffect(() => {
    if (typeof window === 'undefined' || !cableData || !visible) return
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const L = require('leaflet')
    const layers: ReturnType<typeof L.polyline>[] = []

    // Draw cables
    cableData.cables.forEach((cable) => {
      const line = L.polyline(
        cable.path.map(([lon, lat]) => [lat, lon]),
        { color: cable.color, weight: 1.5, opacity: 0.7, smoothFactor: 1 }
      )
      line.bindPopup(`
        <div style="background:#111118;color:#F0F0F0;font-family:monospace;padding:8px;font-size:12px;">
          <div style="color:${cable.color};font-weight:bold;margin-bottom:4px;">🌊 SUBMARINE CABLE</div>
          <div>${cable.name}</div>
        </div>
      `)
      line.addTo(map)
      layers.push(line)
    })

    // Draw landing stations
    cableData.landingStations.forEach((station) => {
      const icon = L.divIcon({
        className: '',
        html: `<div style="width:8px;height:8px;background:#00D4FF;border:1px solid #fff;border-radius:50%;box-shadow:0 0 6px #00D4FF80;"></div>`,
        iconSize: [8, 8],
        iconAnchor: [4, 4],
      })
      const marker = L.marker([station.lat, station.lon], { icon })
      marker.bindPopup(`
        <div style="background:#111118;color:#F0F0F0;font-family:monospace;padding:8px;font-size:12px;">
          <div style="color:#00D4FF;font-weight:bold;margin-bottom:4px;">📍 LANDING STATION</div>
          <div>${station.name}</div>
          <div style="color:#888;margin-top:2px;">${station.cables} cables</div>
        </div>
      `)
      marker.addTo(map)
      layers.push(marker)
    })

    return () => { layers.forEach((l) => map.removeLayer(l)) }
  }, [cableData, visible, map])

  return null
}

export const SubmarineCableLayer = memo(SubmarineCableLayerInner)
export default SubmarineCableLayer
