# Workflow — Project Bootstrap (Run Once)

## Trigger
Use this workflow when starting the GlobalWatch project from scratch.

## Pre-requisites
- Node.js 20+ installed
- Git installed
- Windsurf IDE open

---

## Steps

### Step 1: Clean Slate
```bash
# If you have an old worldmonitor folder — DELETE IT completely
rm -rf worldmonitor
# or on Windows: Remove-Item -Recurse -Force worldmonitor
```

### Step 2: Scaffold Next.js App
```bash
npx create-next-app@latest globalwatch \
  --typescript \
  --tailwind \
  --app \
  --src-dir \
  --import-alias "@/*" \
  --no-git
```

Answer prompts:
- Would you like to use ESLint? → **Yes**
- Would you like to customize the default import alias? → **No**

### Step 3: Install All Dependencies
```bash
cd globalwatch

# Map
npm install leaflet react-leaflet @react-leaflet/core
npm install react-leaflet-cluster leaflet.markercluster
npm install @types/leaflet --save-dev

# State & Data
npm install zustand swr axios

# Utilities
npm install rss-parser date-fns clsx tailwind-merge
npm install zod

# UI
npm install lucide-react recharts

# Caching
npm install @upstash/redis

# AI
npm install groq-sdk

# Dev
npm install -D @playwright/test
```

### Step 4: Create Folder Structure
```bash
mkdir -p src/components/map/layers
mkdir -p src/components/map/popups
mkdir -p src/components/panels
mkdir -p src/components/ui
mkdir -p src/components/layout
mkdir -p src/lib
mkdir -p src/services
mkdir -p src/store
mkdir -p src/types
mkdir -p src/hooks
mkdir -p public/data
mkdir -p public/sounds
```

### Step 5: Create .env.local
```bash
cat > .env.local << 'EOF'
# API Keys — get these from the Blueprint document Section 8
ACLED_API_KEY=
ACLED_EMAIL=
NASA_FIRMS_API_KEY=
OPENAQ_API_KEY=
AISSTREAM_API_KEY=
GROQ_API_KEY=
FRED_API_KEY=
CLOUDFLARE_RADAR_TOKEN=

# Infrastructure
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# App
NEXT_PUBLIC_APP_NAME=GlobalWatch
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_ADSENSE_ID=
EOF
```

### Step 6: Create .env.example (safe to commit)
```bash
cat > .env.example << 'EOF'
ACLED_API_KEY=your_key_here
ACLED_EMAIL=your_email@example.com
NASA_FIRMS_API_KEY=your_key_here
OPENAQ_API_KEY=your_key_here
AISSTREAM_API_KEY=your_key_here
GROQ_API_KEY=your_key_here
FRED_API_KEY=your_key_here
CLOUDFLARE_RADAR_TOKEN=your_key_here
UPSTASH_REDIS_REST_URL=your_url_here
UPSTASH_REDIS_REST_TOKEN=your_token_here
NEXT_PUBLIC_APP_NAME=GlobalWatch
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NEXT_PUBLIC_ADSENSE_ID=ca-pub-XXXXXXXXXXXXXXXX
EOF
```

### Step 7: Update .gitignore
Add to `.gitignore`:
```
.env.local
.env.*.local
```

### Step 8: Initialize Git
```bash
git init
git add .
git commit -m "chore: initial Next.js scaffold for GlobalWatch"
```

### Step 9: Verify Setup
```bash
npm run dev
```
Open http://localhost:3000 — should see default Next.js page.
✅ If it loads, proceed to the Build Workflow.

---

## Expected Output
- Next.js app running on localhost:3000
- Full folder structure created
- All dependencies installed
- Environment file ready to fill in
