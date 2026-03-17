'use client'
import { MapContainer, TileLayer } from 'react-leaflet'
import { useMapStore } from '@/store/mapStore'
import { REGION_PRESETS } from '@/lib/timeUtils'
import RegionPresets from './RegionPresets'
import TimeFilterBar from '@/components/ui/TimeFilter'
import EarthquakeLayer from './layers/EarthquakeLayer'
import ConflictLayer from './layers/ConflictLayer'
import FireLayer from './layers/FireLayer'
import DisasterLayer from './layers/DisasterLayer'
import FlightLayer from './layers/FlightLayer'
import 'leaflet/dist/leaflet.css'

if (typeof window !== 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const L = require('leaflet')
  delete L.Icon.Default.prototype._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  })
}

const DARK_TILES = {
  url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
  attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors © <a href="https://carto.com/">CARTO</a>',
  maxZoom: 19,
  subdomains: 'abcd' as string,
}

export default function GlobalMap() {
  const { layers, timeFilter } = useMapStore()
  const initialPreset = REGION_PRESETS['global']

  return (
    <div className="relative w-full h-full">
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[1000]">
        <TimeFilterBar />
      </div>
      <MapContainer
        center={initialPreset.center}
        zoom={initialPreset.zoom}
        className="w-full h-full"
        zoomControl={false}
        attributionControl={true}
      >
        <TileLayer
          url={DARK_TILES.url}
          attribution={DARK_TILES.attribution}
          maxZoom={DARK_TILES.maxZoom}
          subdomains={DARK_TILES.subdomains}
        />
        <RegionPresets />
        <EarthquakeLayer visible={layers.earthquakes} timeFilter={timeFilter} />
        <ConflictLayer visible={layers.conflicts} timeFilter={timeFilter} />
        <FireLayer visible={layers.fires} timeFilter={timeFilter} />
        <DisasterLayer visible={layers.disasters} timeFilter={timeFilter} />
        <FlightLayer visible={layers.flights} timeFilter={timeFilter} />
      </MapContainer>
    </div>
  )
}
