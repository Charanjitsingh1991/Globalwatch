# Skill — Debugging Common Issues

## Leaflet / Map Issues

### Problem: "window is not defined" on build
**Cause:** Leaflet tries to access browser APIs during SSR
**Fix:** Ensure map component uses `dynamic()` with `ssr: false`
```typescript
const GlobalMap = dynamic(() => import('@/components/map/GlobalMap'), { ssr: false })
```
Never import `leaflet` at the file's top level in any server-renderable component.

### Problem: Map tiles not loading
**Cause:** Missing attribution / CORS / wrong tile URL
**Fix:** Verify tile URL works in browser directly. Always include attribution prop on TileLayer.

### Problem: Markers not appearing
**Cause:** Component mounted before Leaflet is ready
**Fix:** Check that the layer component is inside `<MapContainer>`. Add `useMap()` hook check.

### Problem: `leaflet-defaultIcon` broken image
**Fix:**
```typescript
// Add this once in your GlobalMap.tsx
import L from 'leaflet'
import iconUrl from 'leaflet/dist/images/marker-icon.png'
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png'
import shadowUrl from 'leaflet/dist/images/marker-shadow.png'
L.Icon.Default.mergeOptions({ iconUrl, iconRetinaUrl, shadowUrl })
```

---

## Next.js / API Route Issues

### Problem: API route returns 500 with no error message
**Fix:** Wrap entire route in try/catch. Check Vercel Function logs.
Always log the error before returning: `logger.error('route failed', error)`

### Problem: Redis cache not working
**Fix:** Check env vars are set. Test Redis connection:
```typescript
const test = await redis.set('test', 'value')
console.log('Redis test:', test) // Should log 'OK'
```

### Problem: Upstream API CORS error in browser
**Cause:** Never call external APIs from the browser. All external calls must go through your `/api/` routes.
**Fix:** Move the fetch call from the component to an API route.

### Problem: API route times out
**Cause:** External API is slow. Default Vercel timeout is 10 seconds.
**Fix:** Add AbortSignal.timeout(8000) to your fetch. Return stale cache on timeout.

---

## Zustand Issues

### Problem: State not persisting after refresh
**Fix:** Add persist middleware from zustand/middleware. Check localStorage in DevTools.

### Problem: State updates not triggering re-render
**Fix:** Never mutate state directly. Always use the action functions.
```typescript
// WRONG
store.layers.earthquakes = false
// RIGHT  
store.toggleLayer('earthquakes')
```

---

## SWR Issues

### Problem: Data not refreshing
**Fix:** Check `refreshInterval` is set in ms, not seconds. 120 seconds = `refreshInterval: 120000`

### Problem: SWR fetching on every render
**Fix:** Ensure the key string is stable — don't use template literals with changing values as the key unless intentional.

---

## TypeScript Issues

### Problem: Type error on Leaflet event types
**Fix:** Install `@types/leaflet` — it's a devDependency: `npm install -D @types/leaflet`

### Problem: "Cannot find module '@/...'"
**Fix:** Check `tsconfig.json` has `"paths": { "@/*": ["./src/*"] }`. Run `npx tsc --noEmit` to check.

---

## Deployment Issues

### Problem: Build succeeds locally but fails on Vercel
**Cause:** Usually missing environment variables on Vercel
**Fix:** Check all required env vars are in Vercel dashboard. Check Vercel build logs.

### Problem: Map loads but shows no data on production
**Cause:** API keys not set in Vercel environment
**Fix:** Add all keys from .env.local to Vercel → Settings → Environment Variables

### Problem: Upstash Redis not working on Vercel
**Fix:** Ensure UPSTASH_REDIS_REST_URL starts with `https://` (not `redis://`)
