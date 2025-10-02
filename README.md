# K-Pop Demon Hunter Generator

AI-powered photo transformation app that turns portraits into K-pop demon hunter style artwork. Built on Cloudflare's edge infrastructure for maximum performance and global reach.

🌐 **Live:** https://kpopdemonz.com

---

## Architecture Overview

### Frontend (React + Vite)
- **Hosting:** Cloudflare Pages
- **Framework:** React 18 + TypeScript
- **Routing:** React Router (SPA)
- **Styling:** Tailwind CSS
- **Auto-Deploy:** Git push → Cloudflare Pages builds & deploys

**Key Routes:**
- `/` - Main landing page with upload
- `/view/:shortId` - View completed transformation

### Backend (Cloudflare Worker)
- **Endpoint:** `https://transform-image.grovefactor.workers.dev`
- **Runtime:** Cloudflare Workers (V8 isolates)
- **Auto-Deploy:** GitHub Actions on push to `workers/transform-image/`

**API Endpoints:**
- `POST /transform` - Submit image for transformation
- `GET /status/:id` - Check transformation status
- `POST /update-email/:id` - Attach email to transformation
- `POST /webhook` - Replicate completion callback
- `GET /view/:shortId` - View transformation result page
- `GET /admin/emails` - Export user emails (JSON)
- `GET /feed` - Public transformation feed

---

## Data Storage

### 1. **KV (Key-Value Store)**
- **Purpose:** Temporary transformation status (24hr TTL)
- **Namespace:** `TRANSFORM_RESULTS`
- **Stores:** Prediction status, user info, short IDs

### 2. **D1 (SQL Database)**
- **Purpose:** Permanent user & transformation data
- **Database:** `demon-hunter-db`

**Tables:**
```sql
users (
  email PRIMARY KEY,
  name,
  transform_count,
  created_at,
  last_seen
)

transformations (
  id,
  prediction_id UNIQUE,
  user_email FOREIGN KEY,
  original_image_r2_key,
  transformed_image_r2_key,
  replicate_output_url,
  status,
  created_at,
  completed_at,
  processing_time
)
```

### 3. **R2 (Object Storage)**
- **Purpose:** Permanent image storage for ML training
- **Bucket:** `demon-hunter-images`
- **Public Domain:** `images.kpopdemonz.com`

**Structure:**
```
originals/          # User uploaded photos
  [prediction-id].jpg
transformed/        # AI-generated results
  [prediction-id].webp
```

---

## Email System

**Provider:** Resend  
**Domain:** `mail.kpopdemonz.com` (verified)  
**Sender:** `K-Pop Demonz <noreply@mail.kpopdemonz.com>`

**Flow:**
1. User uploads photo & enters email during processing
2. Worker stores email in D1 via `POST /update-email/:id`
3. Replicate completes transformation → webhook triggers
4. Worker downloads result, saves to R2, updates D1
5. Email sent with link: `https://kpopdemonz.com/view/:shortId`

**Template Features:**
- Personalized with user's name
- Direct link to view transformation
- Branded design matching site theme
- Call-to-action to create more

---

## AI Transformation Pipeline

**Service:** Replicate API  
**Model:** Custom face transformation model

**Process:**
1. Frontend uploads image → Worker converts to base64
2. Worker submits to Replicate with webhook URL
3. Replicate processes (~30-60 seconds)
4. Webhook receives completion → Worker downloads result
5. Worker uploads to R2 → Updates D1 → Sends email

**Data Collected for Training:**
- Original images stored in R2 `originals/`
- Transformed results in R2 `transformed/`
- Metadata (timing, user info) in D1

---

## CI/CD Pipeline

### GitHub Actions Workflow
**File:** `.github/workflows/deploy-worker.yml`

**Triggers:**
- Push to `master` branch
- Changes in `workers/transform-image/**`

**Steps:**
1. Checkout code
2. Deploy worker via `wrangler-action@v3`

**Secrets Required:**
- `CLOUDFLARE_API_TOKEN` - API token with Worker permissions

### Cloudflare Pages
**Auto-deploys on:**
- Push to `master` branch
- Connected directly to GitHub repo

**Build Settings:**
- Build command: `npm run build`
- Output directory: `dist`
- Framework: Vite

---

## Configuration

### Worker Secrets (Cloudflare)
Set via: `wrangler secret put <NAME>`

```bash
REPLICATE_API_TOKEN    # Replicate API access
RESEND_API_KEY         # Email sending
```

### Environment Variables

**Frontend (`.env`):**
```bash
VITE_WORKER_URL=https://transform-image.grovefactor.workers.dev
```

**Worker (`wrangler.toml`):**
```toml
WORKER_URL = "https://transform-image.grovefactor.workers.dev"
```

---

## Project Structure

```
.
├── src/                          # Frontend React app
│   ├── components/               # Reusable UI components
│   ├── pages/
│   │   └── ViewPage.tsx         # Transformation view page
│   ├── App.tsx                  # Main app with routing
│   └── main.tsx                 # Entry point
│
├── workers/transform-image/     # Cloudflare Worker
│   ├── index.ts                 # Worker logic & API
│   ├── wrangler.toml            # Worker config
│   ├── schema.sql               # D1 database schema
│   └── migrate-add-r2.sql       # R2 migration
│
├── public/                      # Static assets
│   ├── _redirects              # SPA routing for Cloudflare Pages
│   └── examples/               # Gallery images
│
└── .github/workflows/
    └── deploy-worker.yml       # CI/CD for worker
```

---

## Local Development

### Frontend
```bash
npm install
npm run dev
# Opens at http://localhost:5173
```

### Worker
```bash
cd workers/transform-image
wrangler dev
# Opens at http://localhost:8787
```

### Database
```bash
# Execute SQL locally
wrangler d1 execute demon-hunter-db --file=schema.sql

# Execute on production
wrangler d1 execute demon-hunter-db --remote --file=schema.sql
```

---

## Deployment

### Manual Deploy
```bash
# Frontend
npm run build
# (Auto-deploys via Cloudflare Pages)

# Worker
cd workers/transform-image
npm run deploy
```

### Auto Deploy (Recommended)
Just push to GitHub:
```bash
git add .
git commit -m "Update feature"
git push
# GitHub Actions deploys worker
# Cloudflare Pages deploys frontend
```

---

## Monitoring & Debug

### Worker Logs
```bash
wrangler tail
```

### Database Queries
```bash
# View users
wrangler d1 execute demon-hunter-db --remote --command="SELECT * FROM users"

# View transformations
wrangler d1 execute demon-hunter-db --remote --command="SELECT * FROM transformations ORDER BY created_at DESC LIMIT 10"
```

### R2 Storage
View in dashboard: https://dash.cloudflare.com/ → R2 → `demon-hunter-images`

### Email Exports
```bash
curl https://transform-image.grovefactor.workers.dev/admin/emails
```

---

## Key Features

✅ **Serverless Edge Computing** - Workers run globally on Cloudflare's edge  
✅ **Zero-Downtime Deploys** - Instant rollouts with rollback capability  
✅ **Email Notifications** - Resend integration with custom domain  
✅ **Permanent Storage** - R2 + D1 for training dataset collection  
✅ **Auto-Scaling** - Handles traffic spikes automatically  
✅ **Sub-100ms Response** - Edge-optimized architecture  
✅ **SPA Routing** - Client-side navigation with proper redirects  
✅ **CI/CD Pipeline** - GitHub Actions auto-deployment  

---

## Performance

- **Frontend:** Cloudflare Pages CDN (global edge)
- **Worker:** <50ms cold start, <5ms warm requests
- **Images:** Served from R2 via `images.kpopdemonz.com`
- **Database:** D1 read replicas globally distributed

---

## Cost

**Cloudflare Free Tier:**
- Workers: 100K requests/day
- KV: 100K reads/day, 1K writes/day
- D1: 5M rows read/day, 100K writes/day
- R2: 10GB storage, 10M Class A operations/month
- Pages: Unlimited requests, 500 builds/month

**Resend:**
- Free: 3,000 emails/month
- Pro: $20/month for 50K emails

**Replicate:**
- Pay per use (~$0.02 per transformation)

---

## License

MIT

---

## Contact

Built with ❤️ for K-pop fans worldwide
