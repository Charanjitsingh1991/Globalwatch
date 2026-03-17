# Rules — Map Components

## Applies To
All files in `src/components/map/`

---

## Critical: Next.js SSR Compatibility
Leaflet does NOT work with server-side rendering. Every map component must be dynamically imported:

```typescript
// In the parent page/layout — NEVER import map components directly
const GlobalMap = dynamic(() => import('@/components/map/GlobalMap'), {
  ssr: false,
  loading: () => <MapSkeleton />
})
```

Never import from 'leaflet' at the top level of any file that could be server-rendered.

---

## Map Tile Configuration
```typescript
// Default dark tactical theme
const DARK_TILES = {
  url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
  attribution: '© OpenStreetMap contributors © CARTO',
  maxZoom: 19
}

// Light theme
const LIGHT_TILES = {
  url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
  attribution: '© OpenStreetMap contributors © CARTO',
  maxZoom: 19
}

// Satellite view
const SATELLITE_TILES = {
  url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  attribution: 'Tiles © Esri',
  maxZoom: 19
}
```

---

## Region Presets
```typescript
export const REGION_PRESETS = {
  global:   { center: [20, 0],     zoom: 2,  label: 'Global'   },
  americas: { center: [15, -80],   zoom: 3,  label: 'Americas' },
  europe:   { center: [50, 15],    zoom: 4,  label: 'Europe'   },
  mena:     { center: [25, 40],    zoom: 4,  label: 'MENA'     },
  asia:     { center: [35, 100],   zoom: 3,  label: 'Asia'     },
  latam:    { center: [-15, -65],  zoom: 3,  label: 'LatAm'    },
  africa:   { center: [5, 20],     zoom: 3,  label: 'Africa'   },
  oceania:  { center: [-25, 140],  zoom: 4,  label: 'Oceania'  },
} as const
```

---

## Layer Component Interface
Every layer component must implement this interface:
```typescript
interface LayerProps {
  visible: boolean
  timeFilter: '1h' | '6h' | '24h' | '48h' | '7d'
  onEventSelect?: (event: GlobalEvent) => void
}
```

---

## Marker Color by Severity
```typescript
export function getSeverityColor(severity: Severity): string {
  const colors = {
    critical: '#EF4444',
    high:     '#F97316',
    medium:   '#EAB308',
    low:      '#22C55E',
    info:     '#3B82F6',
    unknown:  '#6B7280',
  }
  return colors[severity] ?? colors.unknown
}
```

---

## Custom Marker Creation
```typescript
import L from 'leaflet'

export function createCircleMarker(color: string, size: number = 10) {
  return L.divIcon({
    className: '',
    html: `<div style="
      width: ${size}px;
      height: ${size}px;
      background: ${color};
      border: 2px solid rgba(255,255,255,0.6);
      border-radius: 50%;
      box-shadow: 0 0 6px ${color}80;
    "></div>`,
    iconSize: [size, size],
    iconAnchor: [size/2, size/2],
  })
}
```

---

## Performance Rules for Map
- Use `React.memo` on ALL layer components — they re-render frequently
- Use `useMemo` to filter data by timeFilter — never filter in render
- For layers with >500 markers, use `react-leaflet-cluster` auto-clustering
- Animate aircraft markers smoothly — interpolate between position updates
- Debounce map move events by 300ms before triggering data refetch
