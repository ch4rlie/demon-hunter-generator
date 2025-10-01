# Quick Start Guide

Get your K-Pop Demon Hunter transformer running in 5 minutes!

## 🚀 Fast Track Deployment

### 1. Install & Login
```bash
npm install -g wrangler
wrangler login
```

### 2. Setup Worker
```bash
cd workers/transform-image

# Create KV namespace
npm run kv:create

# Set Replicate API token (get from https://replicate.com/account/api-tokens)
wrangler secret put REPLICATE_API_TOKEN
```

### 3. Update Config
Edit `wrangler.toml` and paste the KV namespace IDs from step 2.

### 4. Deploy
```bash
npm run deploy
```

Copy your worker URL (e.g., `https://transform-image.abc123.workers.dev`)

### 5. Update Worker URL
Edit `wrangler.toml`:
```toml
[vars]
WORKER_URL = "https://transform-image.abc123.workers.dev"  # Your URL here
```

Deploy again:
```bash
npm run deploy
```

### 6. Configure Frontend
Create `.env` in project root:
```env
VITE_WORKER_URL=https://transform-image.abc123.workers.dev
```

### 7. Run Frontend
```bash
cd ../..  # Back to project root
npm install
npm run dev
```

## 🧪 Test It

Visit `http://localhost:5173` and upload a photo!

## 📊 Monitor

```bash
cd workers/transform-image
npm run tail  # View live logs
```

## 🔧 Common Commands

```bash
# Development
npm run dev          # Run worker locally
npm run deploy       # Deploy to production
npm run tail         # View logs

# KV Storage
npm run kv:list      # List all stored results
wrangler kv:key get "prediction-id" --binding TRANSFORM_RESULTS

# Secrets
wrangler secret put REPLICATE_API_TOKEN
wrangler secret list
```

## 🐛 Troubleshooting

### Worker not receiving webhooks?
- Check `WORKER_URL` in `wrangler.toml`
- Run `npm run tail` to see logs

### CORS errors?
- Worker already has permissive CORS
- Check browser console for details

### "API key not configured"?
```bash
wrangler secret put REPLICATE_API_TOKEN
```

## 📚 Full Documentation

See [DEPLOYMENT.md](../DEPLOYMENT.md) for detailed instructions.

## 💰 Costs

- **Cloudflare:** Free tier (100k requests/day)
- **Replicate:** ~$0.01-0.05 per transformation

## 🎉 You're Done!

Your transformer is now running on Cloudflare's global edge network!
