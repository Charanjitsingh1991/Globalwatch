# Workflow — Feature Build Order

## How to Use This Workflow
Work through each phase in order. Complete all tasks in a phase before moving to the next.
For each task, describe it to Claude in Windsurf using the prompt templates in the Skills folder.

---

## Phase 1: Foundation (Week 1, Days 1-3)

### 1.1 Core Types & Utilities
- [ ] Create `src/types/events.ts` — all event interfaces (copy from rules/types.md)
- [ ] Create `src/types/store.ts` — Zustand store interfaces
- [ ] Create `src/types/cii.ts` — Country Instability Index types
- [ ] Create `src/lib/redis.ts` — Upstash Redis client singleton
- [ ] Create `src/lib/logger.ts` — structured logger (wraps console in dev, silent in prod)
- [ ] Create `src/lib/utils.ts` — clsx + twMerge helper, date formatters, coordinate validators

### 1.2 Zustand Stores
- [ ] Create `src/store/mapStore.ts` — layer visibility, time filter, region, selected event
- [ ] Create `src/store/alertStore.ts` — active alerts queue, dismissed alerts
- [ ] Create `src/store/uiStore.ts` — panel open/closed states, theme (dark/light)

### 1.3 Layout & Theme
- [ ] Update `src/app/layout.tsx` — dark theme, metadata, AdSense script tag
- [ ] Update `tailwind.config.ts` — custom colors, fonts, breakpoints
- [ ] Update `src/app/globals.css` — CSS variables for theme
- [ ] Create `src/components/layout/DashboardLayout.tsx` — main grid layout
- [ ] Create `src/components/ui/LoadingSpinner.tsx`
- [ ] Create `src/components/ui/StatusBadge.tsx` — live/stale/error indicator

---

## Phase 2: Map Foundation (Week 1, Days 4-5)

### 2.1 Base Map
- [ ] Create `src/components/map/GlobalMap.tsx` — Leaflet map with dark tiles, SSR-safe
- [ ] Create `src/components/map/MapControls.tsx` — layer toggles, theme switch
- [ ] Create `src/components/map/RegionPresets.tsx` — 8 region buttons
- [ ] Create `src/hooks/useMapInstance.ts` — access Leaflet map instance

### 2.2 Time Filter
- [ ] Create `src/components/ui/TimeFilter.tsx` — 1h/6h/24h/48h/7d tabs
- [ ] Create `src/lib/timeUtils.ts` — getStartTime(filter), isWithinFilter(timestamp, filter)

### 2.3 Map Skeleton
- [ ] Create `src/components/map/MapSkeleton.tsx` — loading placeholder for dynamic import

---

## Phase 3: First Data Layer (Week 1-2)

### 3.1 Earthquakes (simplest, no API key needed)
- [ ] Create `src/app/api/earthquakes/route.ts` — USGS fetch + Redis cache
- [ ] Create `src/services/usgsService.ts` — normalization logic
- [ ] Create `src/hooks/useEarthquakes.ts` — SWR hook
- [ ] Create `src/components/map/layers/EarthquakeLayer.tsx` — circle markers
- [ ] Create `src/components/map/popups/EarthquakePopup.tsx`
- [ ] ✅ TEST: Earthquakes appear on map

---

## Phase 4: Core Data Layers (Week 2)

### 4.1 Conflict Layer
- [ ] Create `src/app/api/conflicts/route.ts` — ACLED + UCDP merge
- [ ] Create `src/services/acledService.ts`
- [ ] Create `src/services/ucdpService.ts`
- [ ] Create `src/hooks/useConflicts.ts`
- [ ] Create `src/components/map/layers/ConflictLayer.tsx`
- [ ] Create `src/components/map/popups/ConflictPopup.tsx`
- [ ] ✅ TEST: Conflict events appear colored by type

### 4.2 Fire Layer
- [ ] Create `src/app/api/fires/route.ts` — NASA FIRMS
- [ ] Create `src/services/firmsService.ts`
- [ ] Create `src/hooks/useFires.ts`
- [ ] Create `src/components/map/layers/FireLayer.tsx`
- [ ] ✅ TEST: Fire hotspots appear

### 4.3 Disaster Layer
- [ ] Create `src/app/api/disasters/route.ts` — GDACS RSS + NASA EONET
- [ ] Create `src/services/gdacsService.ts`
- [ ] Create `src/services/eonetService.ts`
- [ ] Create `src/hooks/useDisasters.ts`
- [ ] Create `src/components/map/layers/DisasterLayer.tsx`
- [ ] ✅ TEST: Active disasters appear with correct icons

### 4.4 Flight Layer
- [ ] Create `src/app/api/flights/route.ts` — OpenSky bounding box
- [ ] Create `src/services/openskyService.ts`
- [ ] Create `src/hooks/useFlights.ts`
- [ ] Create `src/components/map/layers/FlightLayer.tsx` — rotated plane icons
- [ ] Create `src/components/map/popups/FlightPopup.tsx`
- [ ] ✅ TEST: Aircraft appear and update every 15 seconds

### 4.5 Ship Layer
- [ ] Register at aisstream.io → get API key → add to .env.local
- [ ] Create `src/app/api/ships/route.ts` — AISStream snapshot
- [ ] Create `src/services/aisService.ts`
- [ ] Create `src/hooks/useShips.ts`
- [ ] Create `src/components/map/layers/ShipLayer.tsx`
- [ ] Create `src/lib/chokepoints.ts` — detect vessels near key straits
- [ ] ✅ TEST: Vessels appear, chokepoint vessels highlighted

---

## Phase 5: News & AI (Week 3)

### 5.1 News System
- [ ] Create `src/app/api/news/route.ts` — RSS proxy + GDELT
- [ ] Create `src/lib/rssFeeds.ts` — list of 20+ RSS feed URLs
- [ ] Create `src/lib/classifier.ts` — keyword classifier (120 keywords)
- [ ] Create `src/app/api/classify-news/route.ts` — Groq LLM classifier
- [ ] Create `src/hooks/useNews.ts`
- [ ] Create `src/components/panels/NewsPanel.tsx`
- [ ] ✅ TEST: News appears, severity colors correct

### 5.2 AI Intelligence Brief
- [ ] Create `src/app/api/intel-brief/route.ts` — Groq situation summary
- [ ] Create `src/components/panels/IntelPanel.tsx`
- [ ] ✅ TEST: AI brief generates from current events

### 5.3 Country Instability Index
- [ ] Create `src/app/api/country-score/route.ts` — CII algorithm
- [ ] Create `src/lib/ciiCalculator.ts` — scoring weights from Blueprint Section 5.4
- [ ] Create `src/components/panels/CountryPanel.tsx` — choropleth map
- [ ] Download world GeoJSON → save to `public/data/countries.geojson`
- [ ] ✅ TEST: Countries colored by instability score

### 5.4 Alerts System
- [ ] Create `src/components/panels/AlertsPanel.tsx`
- [ ] Create `src/lib/alertThresholds.ts` — what triggers a critical alert
- [ ] Add browser Notification API support
- [ ] ✅ TEST: High-severity events trigger alert badge

---

## Phase 6: Polish & Launch (Week 4)

### 6.1 UI Polish
- [ ] Create `src/components/ui/Header.tsx` — with live alert badge count
- [ ] Create `src/components/ui/StatusBar.tsx` — 14 data source health indicators
- [ ] Create `src/components/ui/ThemeToggle.tsx`
- [ ] Create `src/components/ui/AdSlot.tsx` — AdSense wrapper
- [ ] Mobile responsive layout — test on 375px, 768px, 1024px, 1440px
- [ ] Create `src/app/about/page.tsx` — data sources attribution page
- [ ] Create `public/ads.txt`

### 6.2 SEO
- [ ] Update `src/app/layout.tsx` with full OpenGraph metadata
- [ ] Create `src/app/sitemap.ts` — dynamic sitemap
- [ ] Create `src/app/robots.ts`

### 6.3 Deploy
- [ ] Push to GitHub
- [ ] Connect Vercel → import repo
- [ ] Add all env vars in Vercel dashboard
- [ ] Connect custom domain
- [ ] Apply for Google AdSense
- [ ] Submit to Google Search Console
