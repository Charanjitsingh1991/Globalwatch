# Skill — Claude Prompt Templates for Windsurf

## How to Use
Copy the prompt exactly, fill in the [BRACKETED] parts, and paste into Windsurf's AI chat.
Always include the relevant rule file as context by referencing it in your prompt.

---

## PROMPT 1 — Project Bootstrap
**When:** Very first time, after running create-next-app

```
I'm building GlobalWatch — a real-time global intelligence dashboard.
Stack: Next.js 14 App Router, TypeScript, Tailwind CSS, Leaflet.js, Zustand, SWR.

Please do these tasks in order:

1. Update tailwind.config.ts with custom colors:
   - background: #0A0A0F (very dark navy)
   - surface: #111118 (slightly lighter dark)
   - border: #1E1E2E (subtle border)
   - primary: #1A56A0 (blue)
   - accent: #00D4FF (cyan)
   - text-primary: #F0F0F0
   - text-muted: #888888

2. Update src/app/globals.css with CSS variables matching those colors, plus a dark tactical map aesthetic.

3. Update src/app/layout.tsx:
   - Set metadata: title "GlobalWatch — Real-Time Global Intelligence", description "Live global conflict, disaster, flight, and news monitoring dashboard"
   - Dark background via className on body
   - Import the custom font: Space Mono (monospace feel for data display)

4. Create src/components/layout/DashboardLayout.tsx:
   - Full viewport height
   - Left sidebar (280px) for layer controls
   - Main content area (full width minus sidebar)
   - Right panel area (320px) for data panels
   - Bottom status bar (32px)
   - All panels collapsible on mobile

5. Create src/lib/utils.ts with:
   - cn() function using clsx + tailwind-merge
   - formatTimestamp(iso: string): string — "2 minutes ago" format
   - getSeverityColor(severity: Severity): string — returns hex color
   - isWithinTimeFilter(timestamp: string, filter: TimeFilter): boolean

Show me each file's complete code.
```

---

## PROMPT 2 — Zustand Stores
**When:** After layout is working

```
Create 3 Zustand stores for GlobalWatch. Use the types from this reference:

[paste src/types/store.ts content here]

Files to create:

1. src/store/mapStore.ts
   - State: layers (all layer visibility booleans), timeFilter, region, selectedEvent
   - All layers default to true except: weather=false, ships=false (too noisy by default)
   - Actions: toggleLayer, setTimeFilter, setRegion, selectEvent
   - Persist layer visibility to localStorage using zustand/middleware persist

2. src/store/alertStore.ts
   - State: alerts (array of BaseEvent), maxAlerts=50
   - Actions: addAlert, dismissAlert, clearAll
   - Auto-remove alerts older than 1 hour

3. src/store/uiStore.ts
   - State: sidebarOpen, rightPanelOpen, activePanel, theme ('dark'|'light')
   - Actions: toggleSidebar, toggleRightPanel, setActivePanel, toggleTheme
   - Persist theme to localStorage

Show complete code for all 3 files.
```

---

## PROMPT 3 — Base Map Component
**When:** After stores are created

```
Create the base Leaflet map for GlobalWatch. This must be SSR-safe for Next.js App Router.

Requirements:
1. src/components/map/GlobalMap.tsx
   - Use react-leaflet MapContainer, TileLayer
   - Default tile: CartoDB Dark Matter
     URL: https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png
     Attribution: © OpenStreetMap contributors © CARTO
   - Default view: center=[20, 0], zoom=2
   - Full height of parent container
   - Read layer state from mapStore
   - Read timeFilter from mapStore

2. src/components/map/MapSkeleton.tsx
   - Shown while map is loading
   - Dark background matching the map theme
   - Animated pulse effect

3. src/components/map/RegionPresets.tsx
   - 8 buttons: Global, Americas, Europe, MENA, Asia, LatAm, Africa, Oceania
   - Coordinates from this list:
     global:   [20, 0] zoom 2
     americas: [15, -80] zoom 3
     europe:   [50, 15] zoom 4
     mena:     [25, 40] zoom 4
     asia:     [35, 100] zoom 3
     latam:    [-15, -65] zoom 3
     africa:   [5, 20] zoom 3
     oceania:  [-25, 140] zoom 4
   - Positioned bottom-left on the map
   - Compact, dark-themed buttons

4. src/components/ui/TimeFilter.tsx
   - Tabs: 1H | 6H | 24H | 48H | 7D
   - Reads/writes mapStore timeFilter
   - Dark pill-style design, active tab highlighted in primary blue

5. Update src/app/page.tsx to render DashboardLayout with GlobalMap inside,
   using dynamic import with ssr: false.

IMPORTANT: Never import from 'leaflet' at the top level — only inside dynamic imports or useEffect.

Show complete code for all files.
```

---

## PROMPT 4 — Earthquake API + Layer
**When:** Map is working, ready for first data

```
Add the earthquake data layer to GlobalWatch.

1. src/lib/redis.ts
   - Create Upstash Redis client singleton
   - Use @upstash/redis package
   - Read from process.env.UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN
   - Export: redis instance

2. src/app/api/earthquakes/route.ts
   - Fetch from USGS: https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&minmagnitude=2.5&orderby=time&limit=500
   - Cache in Redis for 120 seconds with key 'globalwatch:earthquakes:all'
   - Circuit breaker: on failure return stale cache with stale:true, if no cache return baseline
   - Normalize each feature to: { id, lat, lon, magnitude, depth, place, time, alert, tsunami, severity }
   - Severity logic: magnitude >= 7 = critical, >= 6 = high, >= 5 = medium, >= 3 = low, else = info
   - Return: { data, stale, baseline, timestamp, source: 'usgs', count }

3. src/hooks/useEarthquakes.ts
   - SWR hook fetching /api/earthquakes
   - refreshInterval: 120000 (2 minutes)
   - Return: { events, stale, loading, error }

4. src/components/map/layers/EarthquakeLayer.tsx
   - Props: visible, timeFilter, onEventSelect
   - Wrap in React.memo
   - Use useEarthquakes hook
   - Filter by timeFilter using isWithinTimeFilter
   - Render CircleMarker for each earthquake
   - Size = magnitude * 4 (so M6 = 24px radius)
   - Color = getSeverityColor(severity)
   - Pulsing animation for critical (M7+) events via CSS
   - On click: call onEventSelect

5. src/components/map/popups/EarthquakePopup.tsx
   - Show: title, magnitude (large), depth, place, time ago, alert level, tsunami warning
   - Dark themed popup

Show complete code for all 5 files.
```

---

## PROMPT 5 — Conflict Layer (ACLED + UCDP)
**When:** Earthquake layer is working

```
Add the conflict events layer to GlobalWatch using ACLED and UCDP APIs.

1. src/services/acledService.ts
   - Function: fetchACLED(daysBack: number = 30)
   - URL: https://api.acleddata.com/acled/read.json?key=API_KEY&email=EMAIL&limit=1000&fields=event_id_cnty|event_date|event_type|sub_event_type|actor1|actor2|country|region|latitude|longitude|fatalities|notes&event_date_where=BETWEEN&event_date_from=[30 days ago]&event_date_to=[today]
   - Use process.env.ACLED_API_KEY and process.env.ACLED_EMAIL
   - Return: normalized ConflictEvent[]
   - Severity: fatalities > 100 = critical, > 20 = high, > 5 = medium, > 0 = low, else = info

2. src/services/ucdpService.ts
   - Function: fetchUCDP()
   - URL: https://ucdpapi.pcr.uu.se/api/gedevents/23.1?pagesize=1000&StartDate=[30 days ago]
   - No API key needed
   - Return: normalized ConflictEvent[]

3. src/app/api/conflicts/route.ts
   - Fetch both ACLED and UCDP in parallel (Promise.allSettled)
   - Merge arrays, deduplicate by proximity (same location within 1km on same day = same event)
   - Cache in Redis for 300 seconds with key 'globalwatch:conflicts:all'
   - Circuit breaker pattern

4. src/hooks/useConflicts.ts
   - SWR hook, refreshInterval: 300000

5. src/components/map/layers/ConflictLayer.tsx
   - Different icons by event_type:
     battles → red circle
     explosions/remote → orange diamond (rotated square)
     protests/riots → yellow triangle
     strategic → purple square
   - Size by fatalities: base 8px + min(fatalities, 50) * 0.3
   - React.memo, timeFilter, onEventSelect

6. src/components/map/popups/ConflictPopup.tsx
   - Show: event type, actors, country, fatalities, date, notes (truncated to 200 chars)

Show complete code for all 6 files.
```

---

## PROMPT 6 — News Panel + Classifier
**When:** Conflict layer is working

```
Build the news system for GlobalWatch — RSS aggregation with AI classification.

1. src/lib/rssFeeds.ts
   - Export RSS_FEEDS array with 20 feeds:
     BBC World: https://feeds.bbci.co.uk/news/world/rss.xml
     Reuters: https://feeds.reuters.com/reuters/worldNews
     Al Jazeera: https://www.aljazeera.com/xml/rss/all.xml
     AP News: https://rsshub.app/apnews/topics/world-news
     France 24: https://www.france24.com/en/rss
     DW: https://rss.dw.com/rdf/rss-en-all
     The Guardian World: https://www.theguardian.com/world/rss
     NPR World: https://feeds.npr.org/1004/rss.xml
     CNN World: http://rss.cnn.com/rss/edition_world.rss
     Sky News World: https://feeds.skynews.com/feeds/rss/world.xml
     Euronews: https://feeds.feedburner.com/euronews/en/news
     Times of India: https://timesofindia.indiatimes.com/rss.cms
     South China Morning Post: https://www.scmp.com/rss/91/feed
     Middle East Eye: https://www.middleeasteye.net/rss
     The Hindu: https://www.thehindu.com/news/international/?service=rss
     Haaretz: https://www.haaretz.com/cmlink/1.628752
     Arab News: https://www.arabnews.com/rss.xml
     Defense News: https://www.defensenews.com/arc/outboundfeeds/rss/
     Bellingcat: https://www.bellingcat.com/feed/
     ACLED Blog: https://acleddata.com/feed/

2. src/lib/classifier.ts
   - KEYWORDS object organized by severity tier with ~120 keywords
   - Critical: airstrike, bombing, explosion, missile, nuclear, chemical attack, massacre, genocide, coup
   - High: military, conflict, war, attack, killed, casualties, troops, invasion, sanctions
   - Medium: tension, border dispute, protest, arrested, detained, election, deployment
   - Low: diplomacy, talks, agreement, ceasefire, aid, humanitarian
   - function classify(headline: string, description?: string): { severity: Severity, category: string, confidence: number }
   - Use word boundary regex (\b) to avoid false positives
   - Category options: conflict | terrorism | cyber | disaster | military | economic | general

3. src/app/api/news/route.ts
   - Fetch all RSS feeds in parallel (Promise.allSettled, timeout 5s each)
   - Parse with rss-parser
   - Normalize each item to NewsEvent with id, title, url, summary, timestamp, severity, category
   - Run classify() on each headline
   - Sort by timestamp desc, limit to 200 items
   - Cache in Redis for 180 seconds

4. src/hooks/useNews.ts
   - SWR hook, refreshInterval: 180000

5. src/components/panels/NewsPanel.tsx
   - Show list of news items sorted by severity then time
   - Each item: severity color bar on left, headline, source, time ago
   - Filter buttons: All | Critical | High | Conflict | Disaster | Military
   - Clicking item opens article in new tab
   - Show stale indicator if data.stale is true

Show complete code for all 5 files.
```

---

## PROMPT 7 — Flight Layer (OpenSky)
```
Add the flight tracking layer using OpenSky Network.

1. src/app/api/flights/route.ts
   - Accept optional ?bounds=lat_min,lon_min,lat_max,lon_max query param
   - Default: fetch global (no bounds, but OpenSky limits to 400 results)
   - URL: https://opensky-network.org/api/states/all
   - Add Authorization header if OPENSKY_USERNAME and OPENSKY_PASSWORD env vars exist
   - Cache for 15 seconds in Redis
   - Normalize state vectors [icao24, callsign, origin_country, time_position, last_contact,
     longitude, latitude, baro_altitude, on_ground, velocity, true_track, vertical_rate, ...]
   - Return FlightEvent[] with category detection:
     callsign starting with: USAF/USMC/UAF/RRR/VVAF → military
     squawk 7700/7600/7500 → emergency (set severity=critical)

2. src/hooks/useFlights.ts
   - SWR hook, refreshInterval: 15000

3. src/components/map/layers/FlightLayer.tsx
   - Plane icon rotated to match heading using CSS transform
   - Color: military=red, emergency=critical red pulsing, civilian=blue, unknown=gray
   - Show trail effect (last 3 positions) for military aircraft
   - React.memo

4. src/components/map/popups/FlightPopup.tsx
   - Show: callsign, altitude (ft), speed (knots), heading, squawk, category, origin country

Show complete code for all 4 files.
```

---

## PROMPT 8 — AI Intelligence Brief
```
Build the AI Intelligence Brief system for GlobalWatch.

1. src/app/api/intel-brief/route.ts
   - Cache for 900 seconds (15 min) in Redis
   - Collect current data: fetch top 10 conflict events, top 5 earthquakes M4+,
     top 5 critical news headlines, any active disasters
   - Build a structured prompt for Groq:
     System: "You are a geopolitical intelligence analyst. Be concise and factual. No speculation."
     User: "Current events in last 6 hours: [structured data]. Write a 3-paragraph intelligence
     brief covering: 1) Active conflicts and security incidents 2) Natural disasters and
     environmental threats 3) Key geopolitical developments. Max 200 words total."
   - Call Groq API using groq-sdk with model: llama-3.1-8b-instant, temperature: 0.3, max_tokens: 300
   - Return: { brief: string, generatedAt: string, eventCount: number }

2. src/components/panels/IntelPanel.tsx
   - Refresh every 15 minutes
   - Show: "INTELLIGENCE BRIEF" header with timestamp
   - Monospace font for the brief text (tactical feel)
   - Animated typing effect when brief updates
   - Show: "Based on [N] active events" below the brief
   - Subtle pulsing green dot = live indicator

Show complete code for both files.
```
