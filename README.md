# 🔥 K-Pop Demon Hunter Image Transformer

Transform your photos into epic K-Pop demon hunter characters using AI! Built with React, Cloudflare Workers, and Replicate's AI models.

![Architecture](https://img.shields.io/badge/Cloudflare-Workers-orange?style=for-the-badge&logo=cloudflare)
![React](https://img.shields.io/badge/React-18-blue?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)

## ✨ Features

- 🎨 **AI-Powered Transformation** - Turn any photo into a K-Pop demon hunter
- ⚡ **Edge Computing** - Deployed on Cloudflare's global network for low latency
- 🔄 **Async Processing** - Webhook-based architecture for optimal UX
- 💾 **KV Storage** - Results cached for instant retrieval
- 🎯 **Modern UI** - Beautiful, responsive interface with Tailwind CSS
- 📱 **Mobile Friendly** - Works seamlessly on all devices

## 🏗️ Architecture

```
┌─────────────────┐
│   React App     │  ← User uploads image
│   (Frontend)    │
└────────┬────────┘
         │ POST /transform
         ▼
┌─────────────────┐
│ Cloudflare      │  ← Submits to Replicate
│ Worker          │     Returns prediction ID
└────────┬────────┘
         │
         ├──────────────────────┐
         │                      │
         ▼                      ▼
┌─────────────────┐    ┌─────────────────┐
│  Replicate API  │    │   KV Storage    │
│  (Processing)   │    │   (Results)     │
└────────┬────────┘    └────────▲────────┘
         │                      │
         │ webhook              │
         └──────────────────────┘
                                │
         ┌──────────────────────┘
         │ GET /status/:id
         ▼
┌─────────────────┐
│   React App     │  ← Polls for completion
│   (Frontend)    │
└─────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Cloudflare account (free tier works!)
- Replicate API token ([get one here](https://replicate.com/account/api-tokens))

### Installation

```bash
# Clone the repo
git clone <your-repo-url>
cd project

# Install dependencies
npm install

# Install Wrangler CLI
npm install -g wrangler
```

### Deploy Worker

See [QUICK_START.md](./QUICK_START.md) for a 5-minute setup guide, or [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

**TL;DR:**
```bash
cd workers/transform-image
wrangler login
npm run kv:create
wrangler secret put REPLICATE_API_TOKEN
# Update wrangler.toml with KV IDs
npm run deploy
```

### Run Frontend

```bash
# Create .env file
cp .env.example .env
# Edit .env and add your worker URL

# Start dev server
npm run dev
```

Visit `http://localhost:5173` 🎉

## 📁 Project Structure

```
project/
├── src/                      # React frontend
│   ├── components/           # UI components
│   │   ├── ImageUploader.tsx # Main upload interface
│   │   ├── HeroSection.tsx
│   │   └── ...
│   ├── lib/
│   │   └── transformApi.ts   # Worker API client
│   └── App.tsx               # Main app component
│
├── workers/
│   └── transform-image/      # Cloudflare Worker
│       ├── index.ts          # Worker logic
│       ├── wrangler.toml     # Worker config
│       ├── package.json      # Worker scripts
│       └── README.md         # Worker docs
│
├── supabase/
│   └── functions/
│       └── transform-image/  # Legacy Supabase function (not used)
│
├── DEPLOYMENT.md             # Detailed deployment guide
├── QUICK_START.md            # 5-minute setup guide
└── README.md                 # This file
```

## 🔧 Development

### Frontend Development

```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build
npm run typecheck    # Type check
npm run lint         # Lint code
```

### Worker Development

```bash
cd workers/transform-image
npm run dev          # Run worker locally
npm run deploy       # Deploy to production
npm run tail         # View live logs
npm run kv:list      # List KV entries
```

## 🧪 Testing

### Test Worker Locally

```bash
cd workers/transform-image
npm run dev
```

Then in another terminal:
```bash
curl -X POST http://localhost:8787/transform \
  -F "image=@test-photo.jpg"
```

### Test Production Worker

```bash
curl -X POST https://your-worker.workers.dev/transform \
  -F "image=@test-photo.jpg"
```

## 📊 API Reference

### POST /transform

Submit an image for transformation.

**Request:**
```bash
curl -X POST https://your-worker.workers.dev/transform \
  -F "image=@photo.jpg"
```

**Response:**
```json
{
  "success": true,
  "predictionId": "abc123...",
  "status": "processing",
  "statusUrl": "/status/abc123..."
}
```

### GET /status/:id

Check transformation status.

**Request:**
```bash
curl https://your-worker.workers.dev/status/abc123...
```

**Response (processing):**
```json
{
  "id": "abc123...",
  "status": "processing",
  "created_at": "2025-10-01T18:00:00Z"
}
```

**Response (completed):**
```json
{
  "id": "abc123...",
  "status": "succeeded",
  "imageUrl": "https://replicate.delivery/...",
  "processingTime": 12.5,
  "updated_at": "2025-10-01T18:00:15Z"
}
```

### POST /webhook

Internal endpoint for Replicate webhooks. Not meant to be called directly.

## 💰 Cost Breakdown

### Cloudflare Workers (Free Tier)
- ✅ 100,000 requests/day
- ✅ 10ms CPU time per request
- ✅ 1GB KV storage
- ✅ Sufficient for moderate traffic

### Replicate API
- 💰 ~$0.01-0.05 per transformation
- Varies by model and processing time

**Example:** 100 transformations/day = ~$1-5/day

## 🔒 Security

- ✅ API tokens stored as Wrangler secrets (never in code)
- ✅ CORS headers configured
- ✅ Input validation on all endpoints
- ⚠️ Consider adding authentication for production use
- ⚠️ Set up rate limiting to prevent abuse

## 🐛 Troubleshooting

### "API key not configured"
```bash
cd workers/transform-image
wrangler secret put REPLICATE_API_TOKEN
```

### Webhook not working
- Check `WORKER_URL` in `wrangler.toml`
- Run `npm run tail` to view logs
- Ensure worker is publicly accessible

### CORS errors
- Worker has permissive CORS by default
- Check browser console for specific errors

### KV namespace errors
- Verify KV namespace IDs in `wrangler.toml`
- Run `npm run kv:create` if not created

## 📚 Documentation

- [Quick Start Guide](./QUICK_START.md) - Get running in 5 minutes
- [Deployment Guide](./DEPLOYMENT.md) - Detailed deployment instructions
- [Worker README](./workers/transform-image/README.md) - Worker-specific docs
- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Replicate API Docs](https://replicate.com/docs)

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repo
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📝 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- **Replicate** - AI model hosting
- **Cloudflare** - Edge computing platform
- **Flux** - Image transformation model

## 🔗 Links

- [Cloudflare Workers](https://workers.cloudflare.com/)
- [Replicate](https://replicate.com/)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/)

---

**Made with ❤️ and ⚡ by [Your Name]**

*Transform into a demon hunter today!* 🔥
