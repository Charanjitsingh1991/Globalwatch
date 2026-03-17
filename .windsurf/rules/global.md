# GlobalWatch — Windsurf AI Rules (Global)

## Project Identity
- Project name: **GlobalWatch**
- Description: Real-time global intelligence dashboard — conflicts, disasters, flights, ships, weather, news
- Stack: Next.js 14 (App Router) + TypeScript + Tailwind CSS + Leaflet.js + Zustand + SWR
- Goal: Launch as ad-monetized public website. 100% original code. No licensed third-party code.

---

## Core Behavior Rules

### Always Do
- Write **TypeScript** — never plain JavaScript
- Use **named exports** for components, **default exports** only for Next.js pages
- Use **Tailwind CSS** for all styling — no inline styles, no CSS modules unless absolutely necessary
- Use **Zustand** for global state — never useState for shared state
- Use **SWR** for all data fetching — never useEffect + fetch directly
- Use **Next.js App Router** patterns — never Pages Router patterns
- Add **JSDoc comments** on every exported function and component
- Handle **loading, error, and empty states** on every component that fetches data
- Use **dynamic imports** for Leaflet and map components (SSR incompatible)
- Implement **circuit breaker pattern** on every API route (try fresh → fall back to cache → fall back to baseline)
- Cache API responses with **Upstash Redis** at the correct TTL per data source
- Return consistent API response shape: `{ data, stale, baseline, timestamp, source }`

### Never Do
- Never use `any` in TypeScript — use `unknown` and type guards
- Never use `console.log` in production code — use the logger utility
- Never commit API keys — always use `process.env.VARIABLE_NAME`
- Never use `fetch` directly in components — always go through SWR hooks
- Never import Leaflet at the top level — always dynamic import
- Never use `useEffect` to sync state — use Zustand middleware
- Never write CSS without checking if Tailwind has a utility for it first
- Never create a component longer than 200 lines — split into sub-components
- Never skip error boundaries on map and data panel components

---

## File Naming Conventions
- Components: `PascalCase.tsx` (e.g. `EarthquakeLayer.tsx`)
- Hooks: `camelCase.ts` prefixed with `use` (e.g. `useEarthquakes.ts`)
- API routes: `route.ts` inside named folders (e.g. `app/api/earthquakes/route.ts`)
- Types: `PascalCase.ts` in `src/types/` (e.g. `ConflictEvent.ts`)
- Utilities: `camelCase.ts` in `src/lib/` (e.g. `classifier.ts`)
- Stores: `camelCase.ts` in `src/store/` (e.g. `mapStore.ts`)
- Services: `camelCase.ts` in `src/services/` (e.g. `acledService.ts`)

---

## TypeScript Standards
- All API responses must have a defined interface in `src/types/`
- All Zustand stores must have a defined interface
- Use `z` (Zod) for runtime validation of external API responses
- Prefer `interface` over `type` for object shapes
- Use `type` for unions, intersections, and utility types
- Always define return types on async functions

---

## API Route Standards
Every route in `src/app/api/` must:
1. Accept optional `?region=` query param for filtered data
2. Check Redis cache first (return with `stale: false` if hit)
3. Fetch from upstream on cache miss
4. Normalize response to internal type
5. Store in Redis with correct TTL
6. On upstream failure: return Redis stale data with `stale: true`
7. On no cache: return `{ data: [], baseline: true }`
8. Always set `Cache-Control` header: `s-maxage=60, stale-while-revalidate`

---

## Map Layer Standards
Every layer component must:
- Accept `visible: boolean` prop — render nothing if false
- Accept `timeFilter: TimeFilter` prop — filter data by time range
- Use `useMemo` to avoid re-computing filtered data on every render
- Handle empty data gracefully (no markers = no error)
- Use consistent color coding per severity (see Color System below)

---

## Color System (Severity)
```
Critical  → #EF4444  (red-500)
High      → #F97316  (orange-500)
Medium    → #EAB308  (yellow-500)
Low       → #22C55E  (green-500)
Info      → #3B82F6  (blue-500)
Unknown   → #6B7280  (gray-500)
```

---

## Data Source Cache TTLs
```
Conflicts (ACLED/UCDP)   → 300s  (5 minutes)
Earthquakes (USGS)       → 120s  (2 minutes)
Fires (NASA FIRMS)       → 600s  (10 minutes)
Flights (OpenSky)        → 15s   (15 seconds)
Ships (AISStream)        → 30s   (30 seconds)
News (RSS/GDELT)         → 180s  (3 minutes)
Weather (OpenMeteo)      → 1800s (30 minutes)
Disasters (GDACS/EONET)  → 600s  (10 minutes)
Intel Brief (AI)         → 900s  (15 minutes)
Country Scores (CII)     → 3600s (1 hour)
```

---

## Ad Slot Rules
- Ad slots use the `AdSlot` component wrapper — never raw AdSense code in components
- Never place ads that overlap the map
- Never place ads inside data panels that show real-time alerts
- Ad slots must be clearly separated from content with visual boundaries
- Always lazy-load ad scripts — never block page render

---

## Performance Rules
- Use `React.memo` on all map layer components
- Use `useMemo` for filtered/sorted data arrays
- Use `useCallback` for event handlers passed as props
- Use `dynamic()` from next/dynamic for all heavy components
- Target Lighthouse score: 90+ performance, 100 accessibility
- Bundle size limit: warn if any page exceeds 250KB JS (gzipped)

---

## Git Commit Format
```
feat: add earthquake layer with USGS integration
fix: correct AIS WebSocket reconnection logic
chore: update dependencies
docs: add API route documentation
refactor: extract marker popup into shared component
style: apply consistent severity colors across layers
```
