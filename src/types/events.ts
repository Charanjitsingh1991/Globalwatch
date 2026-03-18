export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info' | 'unknown'
export type TimeFilter = '1h' | '6h' | '24h' | '48h' | '7d'
export type LayerName =
  | 'conflicts'
  | 'earthquakes'
  | 'fires'
  | 'flights'
  | 'ships'
  | 'weather'
  | 'news'
  | 'disasters'
  | 'gpsjam'
  | 'cables'
  | 'military'
  | 'cyber'
  | 'windycams'

export interface BaseEvent {
  id: string
  lat: number
  lon: number
  timestamp: string
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
  depth: number
  place: string
  alert: 'green' | 'yellow' | 'orange' | 'red' | null
  tsunami: boolean
}

export interface FireEvent extends BaseEvent {
  brightness: number
  confidence: 'low' | 'nominal' | 'high'
  frp: number
  satellite: 'VIIRS' | 'MODIS'
  daynight: 'D' | 'N'
}

export interface FlightEvent extends BaseEvent {
  callsign: string
  icao24: string
  altitude: number
  speed: number
  heading: number
  squawk: string
  onGround: boolean
  category: 'military' | 'cargo' | 'passenger' | 'private' | 'unknown'
  // New fields for FlightAware-style display
  airline?: string
  originAirport?: string
  destAirport?: string
  originCountry?: string
}

export interface ShipEvent extends BaseEvent {
  mmsi: string
  name: string
  type: 'cargo' | 'tanker' | 'military' | 'passenger' | 'fishing' | 'unknown'
  speed: number
  heading: number
  destination?: string
  flag?: string
  chokepoint?: string
}

export interface NewsEvent extends BaseEvent {
  url: string
  summary: string
  category: 'conflict' | 'terrorism' | 'cyber' | 'disaster' | 'military' | 'economic' | 'general'
  tone: number
  country?: string
}

export interface DisasterEvent extends BaseEvent {
  type: 'earthquake' | 'hurricane' | 'flood' | 'volcano' | 'tsunami' | 'drought' | 'wildfire'
  alertLevel: 'green' | 'orange' | 'red'
  affectedPeople?: number
  gdacsId?: string
}

export interface CIIScore {
  iso2: string
  name: string
  score: number
  tier: 'stable' | 'elevated' | 'high' | 'critical'
  breakdown: {
    conflictScore: number
    battleDeaths: number
    disasterScore: number
    displacementScore: number
    newsNegTone: number
    climateAnomaly: number
  }
  updatedAt: string
}
