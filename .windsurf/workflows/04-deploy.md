# Workflow — Deploy to Production

## Trigger
Use before every production deployment to Vercel.

---

## Pre-Deploy Checklist

### Code Quality
- [ ] `npm run build` completes with no errors
- [ ] `npm run typecheck` passes (0 TypeScript errors)
- [ ] `npm run lint` passes (0 ESLint errors)
- [ ] No `console.log` statements in src/ (use logger)
- [ ] No hardcoded API keys in any file
- [ ] `.env.local` is in `.gitignore`

### Functionality
- [ ] Map loads on localhost:3000
- [ ] At least 3 data layers load correctly
- [ ] No broken API routes (check Network tab in DevTools)
- [ ] AdSlot renders placeholder in dev mode without errors
- [ ] Mobile layout tested at 375px width

### Performance
- [ ] `npm run build` output — no page exceeds 250KB JS (gzipped)
- [ ] Images optimized (use Next.js `<Image>` component)
- [ ] Dynamic imports in place for Leaflet and heavy components

---

## Deploy Steps

### 1. Push to GitHub
```bash
git add .
git commit -m "feat: production-ready build for launch"
git push origin main
```

### 2. Vercel Environment Variables
In Vercel dashboard → Project → Settings → Environment Variables, add ALL vars from `.env.local`:
- ACLED_API_KEY
- ACLED_EMAIL
- NASA_FIRMS_API_KEY
- OPENAQ_API_KEY
- AISSTREAM_API_KEY
- GROQ_API_KEY
- FRED_API_KEY
- CLOUDFLARE_RADAR_TOKEN
- UPSTASH_REDIS_REST_URL
- UPSTASH_REDIS_REST_TOKEN
- NEXT_PUBLIC_APP_NAME
- NEXT_PUBLIC_APP_URL
- NEXT_PUBLIC_ADSENSE_ID

### 3. Vercel Auto-Deploy
Vercel auto-deploys on push to `main`. Watch the deployment log for errors.

### 4. Post-Deploy Checks
- [ ] Visit https://yourdomain.com — page loads
- [ ] Check Network tab — API routes returning data
- [ ] Check Vercel Functions tab — no 500 errors
- [ ] Run Lighthouse: `npx lighthouse https://yourdomain.com --view`
  - Target: Performance 90+, Accessibility 95+, Best Practices 90+, SEO 100

### 5. Google Search Console
- [ ] Add property for your domain
- [ ] Submit sitemap: https://yourdomain.com/sitemap.xml
- [ ] Request indexing for homepage

### 6. Google AdSense (after site is live)
- [ ] Apply at adsense.google.com
- [ ] Add verification meta tag to layout.tsx
- [ ] Wait for approval (typically 1-3 weeks)
- [ ] Once approved: replace placeholder pub-ID in AdSlot.tsx

---

## Rollback
If a deployment breaks the site:
```bash
# In Vercel dashboard → Deployments → find last working deploy → Promote to Production
```
Or locally:
```bash
git revert HEAD
git push origin main
```
