# Workflow — Add a New Data Layer

## Trigger
Use this whenever you need to add a new data source/layer to the map.
Follow these steps in exact order every time.

---

## Steps (replace LAYERNAME with your layer name, e.g. "fires", "ships")

### Step 1: Define the Type
File: `src/types/events.ts`
Add a new interface extending `BaseEvent` with layer-specific fields.

### Step 2: Create the Service
File: `src/services/LAYERNAMEService.ts`
- `fetchFromUpstream()` — raw API call
- `normalize(raw: unknown)` — validate + transform to your type
- Use Zod schema to validate the upstream response

### Step 3: Create the API Route
File: `src/app/api/LAYERNAME/route.ts`
- Follow the circuit breaker template from `rules/api-routes.md`
- Use the correct TTL from `rules/global.md`
- Call your service's `fetchFromUpstream()` and `normalize()` functions

### Step 4: Create the SWR Hook
File: `src/hooks/useLAYERNAME.ts`
```typescript
import useSWR from 'swr'
import type { LAYERNAMEEvent } from '@/types/events'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export function useLAYERNAME() {
  const { data, error, isLoading } = useSWR(
    '/api/LAYERNAME',
    fetcher,
    { refreshInterval: TTL_IN_MS }
  )

  return {
    events: (data?.data ?? []) as LAYERNAMEEvent[],
    stale: data?.stale ?? false,
    loading: isLoading,
    error
  }
}
```

### Step 5: Create the Layer Component
File: `src/components/map/layers/LAYERNAMELayer.tsx`
- Accept `visible`, `timeFilter`, `onEventSelect` props
- Call `useLAYERNAME()` hook
- Filter by `timeFilter` using `isWithinFilter()` from `src/lib/timeUtils.ts`
- Render markers using `createCircleMarker()` from `rules/map-components.md`
- Wrap in `React.memo`
- Return null if `!visible`

### Step 6: Create the Popup Component
File: `src/components/map/popups/LAYERNAMEPopup.tsx`
- Props: `event: LAYERNAMEEvent`
- Show: title, severity badge, timestamp, key stats
- Show link to source if available

### Step 7: Add to Zustand Store
File: `src/store/mapStore.ts`
- Add `LAYERNAME: boolean` to `LayerState`
- Add to initial state (default: `true` for important layers, `false` for optional)

### Step 8: Add Toggle Button
File: `src/components/map/MapControls.tsx`
- Add button for the new layer
- Use Lucide icon matching the data type
- Color-code the button with the layer's primary color

### Step 9: Register in GlobalMap
File: `src/components/map/GlobalMap.tsx`
- Import the layer component
- Add `<LAYERNAMELayer visible={layers.LAYERNAME} timeFilter={timeFilter} />`

### Step 10: Add Status Indicator
File: `src/components/ui/StatusBar.tsx`
- Add the new source to the status list
- Show live/stale/error state from the hook's `stale` and `error` values

### Step 11: Add to Attribution Page
File: `src/app/about/page.tsx`
- Add the data source with proper attribution text

---

## Checklist Before Marking Complete
- [ ] Type defined in events.ts
- [ ] Service with Zod validation
- [ ] API route with circuit breaker
- [ ] SWR hook with correct refresh interval
- [ ] Layer component with memo and time filter
- [ ] Popup component
- [ ] Toggle in MapControls
- [ ] Registered in GlobalMap
- [ ] Status bar entry
- [ ] Attribution entry
- [ ] Tested in browser — data appears on map
