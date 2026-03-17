# Rules — TypeScript Types & Data Models

## Applies To
All files in `src/types/`

---

## Core Event Types

```typescript
// src/types/events.ts

export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info' | 'unknown'
export type TimeFilter = '1h' | '6h' | '24h' | '48h' | '7d'
export type LayerName =
  | 'conflicts' | 'earthquakes' | 'fires' | 'flights'
  | 'ships' | 'weather' | 'news' | 'disasters'

// Base interface all events extend
export interface BaseEvent {
  id: string
  lat: number
  lon: number
  timestamp: string   // ISO 8601
  severity: Severity
  title: string
  source: string
}

export interface ConflictEvent extends BaseEvent {
  type: 'battle' | 'explosion' | 'protest' | 'riot' | 'strategic' | 'remote'
  actor1: string
  actor2?: string
  fatalities: number
  country: string
  region: string
}

export interface EarthquakeEvent extends BaseEvent {
  magnitude: number
  depth: number       // km
  place: string
  alert: 'green' | 'yellow' | 'orange' | 'red' | null
  tsunami: boolean
}

export interface FireEvent extends BaseEvent {
  brightness: number  // Kelvin
  confidence: 'low' | 'nominal' | 'high'
  frp: number         // Fire Radiative Power (MW)
  satellite: 'VIIRS' | 'MODIS'
  daynight: 'D' | 'N'
}

export interface FlightEvent extends BaseEvent {
  callsign: string
  icao24: string
  altitude: number    // meters
  speed: number       // m/s
  heading: number     // degrees
  squawk: string
  onGround: boolean
  category: 'military' | 'cargo' | 'passenger' | 'private' | 'unknown'
}

export interface ShipEvent extends BaseEvent {
  mmsi: string
  name: string
  type: 'cargo' | 'tanker' | 'military' | 'passenger' | 'fishing' | 'unknown'
  speed: number       // knots
  heading: number
  destination?: string
  flag?: string       // ISO 3166-1 alpha-2
  chokepoint?: string // e.g. 'Strait of Hormuz'
}

export interface NewsEvent extends BaseEvent {
  url: string
  summary: string
  category: 'conflict' | 'terrorism' | 'cyber' | 'disaster' | 'military' | 'economic' | 'general'
  tone: number        // GDELT tone score: negative = bad
  country?: string
}

export interface DisasterEvent extends BaseEvent {
  type: 'earthquake' | 'hurricane' | 'flood' | 'volcano' | 'tsunami' | 'drought' | 'wildfire'
  alertLevel: 'green' | 'orange' | 'red'
  affectedPeople?: number
  gdacsId?: string
}
```

---

## Map Store Types

```typescript
// src/types/store.ts

export interface LayerState {
  [K in LayerName]: boolean
}

export interface MapStore {
  layers: LayerState
  timeFilter: TimeFilter
  region: string
  selectedEvent: BaseEvent | null
  toggleLayer: (layer: LayerName) => void
  setTimeFilter: (filter: TimeFilter) => void
  setRegion: (region: string) => void
  selectEvent: (event: BaseEvent | null) => void
}
```

---

## Country Instability Index Types

```typescript
// src/types/cii.ts

export interface CIIScore {
  iso2: string          // ISO 3166-1 alpha-2 country code
  name: string
  score: number         // 0-100
  tier: 'stable' | 'elevated' | 'high' | 'critical'
  breakdown: {
    conflictScore: number    // max 30
    battleDeaths: number     // max 25
    disasterScore: number    // max 15
    displacementScore: number // max 15
    newsNegTone: number      // max 10
    climateAnomaly: number   // max 5
  }
  updatedAt: string
}
```
