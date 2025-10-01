# Deployment Guide: K-Pop Demon Hunter Image Transformer

This guide walks you through deploying your image transformation service to Cloudflare Workers.

## Architecture Overview

```
┌─────────────┐         ┌──────────────────┐         ┌─────────────┐
│   Browser   │────────▶│ Cloudflare Worker│────────▶│  Replicate  │
│  (React App)│         │  (Edge Function) │         │     API     │
└─────────────┘         └──────────────────┘         └─────────────┘
       │                         │                           │
       │                         ▼                           │
       │                  ┌─────────────┐                    │
       │                  │ KV Storage  │◀───────────────────┘
       │                  │  (Results)  │                 (webhook)
       │                  └─────────────┘
       │                         │
       └─────────────────────────┘
              (poll for results)
```

## Prerequisites

1. **Cloudflare Account** - [Sign up free](https://dash.cloudflare.com/sign-up)
2. **Replicate Account** - [Sign up](https://replicate.com) and get API token
3. **Node.js** - v18 or higher
4. **Wrangler CLI** - Cloudflare's deployment tool

## Step 1: Install Wrangler

```bash
npm install -g wrangler
```

Verify installation:
```bash
wrangler --version
```

## Step 2: Login to Cloudflare

```bash
wrangler login
```

This will open your browser to authenticate.

## Step 3: Create KV Namespace

KV (Key-Value) storage will hold transformation results.

```bash
cd workers/transform-image

# Create production namespace
wrangler kv:namespace create "TRANSFORM_RESULTS"

# Create preview namespace for local dev
wrangler kv:namespace create "TRANSFORM_RESULTS" --preview
```

**Output example:**
```
⛅️ wrangler 3.x.x
-------------------
🌀 Creating namespace with title "transform-image-TRANSFORM_RESULTS"
✨ Success!
Add the following to your configuration file in your kv_namespaces array:
{ binding = "TRANSFORM_RESULTS", id = "abc123def456..." }

🌀 Creating namespace with title "transform-image-TRANSFORM_RESULTS_preview"
✨ Success!
Add the following to your configuration file in your kv_namespaces array:
{ binding = "TRANSFORM_RESULTS", preview_id = "xyz789abc123..." }
```

## Step 4: Update wrangler.toml

Edit `workers/transform-image/wrangler.toml` and replace the KV namespace IDs:

```toml
name = "transform-image"
main = "index.ts"
compatibility_date = "2024-01-01"

kv_namespaces = [
  { binding = "TRANSFORM_RESULTS", id = "abc123def456...", preview_id = "xyz789abc123..." }
]

[vars]
WORKER_URL = "https://transform-image.YOUR_SUBDOMAIN.workers.dev"
```

**Note:** Leave `WORKER_URL` as-is for now. We'll update it after the first deployment.

## Step 5: Set Replicate API Token

Get your API token from [Replicate Account Settings](https://replicate.com/account/api-tokens).

```bash
cd workers/transform-image
wrangler secret put REPLICATE_API_TOKEN
```

When prompted, paste your Replicate API token.

## Step 6: Deploy Worker (First Time)

```bash
wrangler deploy
```

**Output example:**
```
⛅️ wrangler 3.x.x
-------------------
Your worker has been deployed!
✨ https://transform-image.your-subdomain.workers.dev
```

**Copy your worker URL!** You'll need it for the next step.

## Step 7: Update Worker URL

Edit `workers/transform-image/wrangler.toml` and update `WORKER_URL`:

```toml
[vars]
WORKER_URL = "https://transform-image.your-subdomain.workers.dev"
```

Deploy again to apply the change:

```bash
wrangler deploy
```

This ensures Replicate's webhook knows where to send completion events.

## Step 8: Configure Frontend

Create a `.env` file in your project root (copy from `.env.example`):

```bash
cd ../..  # Back to project root
cp .env.example .env
```

Edit `.env` and set your worker URL:

```env
VITE_WORKER_URL=https://transform-image.your-subdomain.workers.dev
```

## Step 9: Test the Worker

### Test locally (optional):

```bash
cd workers/transform-image
wrangler dev
```

This starts a local server at `http://localhost:8787`.

**Note:** Webhooks won't work locally unless you use a tunnel like ngrok.

### Test in production:

```bash
# Upload a test image
curl -X POST https://transform-image.your-subdomain.workers.dev/transform \
  -F "image=@test-photo.jpg"
```

**Expected response:**
```json
{
  "success": true,
  "predictionId": "abc123...",
  "status": "processing",
  "statusUrl": "/status/abc123..."
}
```

Check status:
```bash
curl https://transform-image.your-subdomain.workers.dev/status/abc123...
```

## Step 10: Deploy Frontend

### Option A: Cloudflare Pages (Recommended)

```bash
# Install dependencies
npm install

# Build
npm run build

# Deploy to Cloudflare Pages
wrangler pages deploy dist --project-name kpop-demon-hunter
```

### Option B: Other Hosting (Vercel, Netlify, etc.)

Just make sure to set the `VITE_WORKER_URL` environment variable in your hosting platform's settings.

## Monitoring & Debugging

### View Worker Logs

```bash
cd workers/transform-image
wrangler tail
```

This streams real-time logs from your worker.

### Check KV Storage

```bash
# List all keys
wrangler kv:key list --binding TRANSFORM_RESULTS

# Get a specific value
wrangler kv:key get "prediction-id-here" --binding TRANSFORM_RESULTS
```

### Common Issues

#### 1. Webhook not being called

**Symptom:** Status stays "processing" forever.

**Fix:**
- Verify `WORKER_URL` in `wrangler.toml` is correct
- Check worker logs: `wrangler tail`
- Make sure the worker is publicly accessible

#### 2. CORS errors

**Symptom:** Browser console shows CORS errors.

**Fix:**
- The worker already has permissive CORS headers
- If you need to restrict origins, edit `corsHeaders` in `index.ts`

#### 3. "API key not configured"

**Symptom:** 500 error about missing API key.

**Fix:**
```bash
wrangler secret put REPLICATE_API_TOKEN
```

#### 4. KV namespace errors

**Symptom:** "KV namespace not found" errors.

**Fix:**
- Make sure you created the KV namespace
- Verify the IDs in `wrangler.toml` match the output from `wrangler kv:namespace create`

## Cost Estimates

### Cloudflare Workers (Free Tier)
- ✅ 100,000 requests/day
- ✅ 10ms CPU time per request
- ✅ 1GB KV storage
- ✅ 100,000 KV reads/day
- ✅ 1,000 KV writes/day

**Typical usage:** Free tier is sufficient for moderate traffic.

### Replicate API
- 💰 ~$0.01-0.05 per image transformation (varies by model)
- See [Replicate Pricing](https://replicate.com/pricing)

### Total Cost Example
- **100 transformations/day:** ~$1-5/day on Replicate
- **Cloudflare:** Free (within limits)

## Scaling Considerations

### If you exceed free tier:

1. **Cloudflare Workers Paid Plan:** $5/month
   - 10 million requests/month
   - 30ms CPU time per request

2. **Rate Limiting:** Add Cloudflare Rate Limiting rules to prevent abuse

3. **Authentication:** Add API key authentication to your worker

## Security Best Practices

1. ✅ Never commit secrets to git
2. ✅ Use `wrangler secret` for sensitive values
3. ✅ Consider adding authentication to prevent abuse
4. ✅ Set up rate limiting via Cloudflare dashboard
5. ✅ Monitor usage and costs regularly

## Updating Your Worker

After making code changes:

```bash
cd workers/transform-image
wrangler deploy
```

Changes are live immediately (no downtime).

## Rollback

If something goes wrong:

```bash
# View deployment history
wrangler deployments list

# Rollback to previous version
wrangler rollback
```

## Next Steps

- [ ] Set up custom domain for your worker
- [ ] Add authentication to prevent abuse
- [ ] Set up monitoring/alerting
- [ ] Configure rate limiting
- [ ] Add analytics tracking

## Support

- **Cloudflare Workers Docs:** https://developers.cloudflare.com/workers/
- **Replicate Docs:** https://replicate.com/docs
- **Wrangler CLI Docs:** https://developers.cloudflare.com/workers/wrangler/

---

**🎉 Congratulations!** Your K-Pop Demon Hunter transformer is now live on Cloudflare's global edge network!
