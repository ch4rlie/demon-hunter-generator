# Architecture Deep Dive

## System Overview

The K-Pop Demon Hunter transformer uses a webhook-based architecture for optimal performance and user experience.

## Request Flow

### 1. Image Upload Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER UPLOADS IMAGE                       │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
                    ┌────────────────┐
                    │  React App     │
                    │  (Frontend)    │
                    └────────┬───────┘
                             │
                             │ POST /transform
                             │ FormData: { image: File }
                             ▼
                    ┌────────────────┐
                    │  Cloudflare    │
                    │  Worker        │
                    └────────┬───────┘
                             │
                             ├─────────────────────────────────┐
                             │                                 │
                             │ 1. Convert to base64            │
                             │ 2. Create prompt                │
                             │ 3. Submit to Replicate          │
                             │    with webhook URL             │
                             │                                 │
                             ▼                                 │
                    ┌────────────────┐                         │
                    │  Replicate API │                         │
                    │  POST /predictions                       │
                    └────────┬───────┘                         │
                             │                                 │
                             │ Returns prediction ID           │
                             ▼                                 │
                    ┌────────────────┐                         │
                    │  Worker        │                         │
                    │  Stores initial│◄────────────────────────┘
                    │  status in KV  │
                    └────────┬───────┘
                             │
                             │ Returns:
                             │ {
                             │   predictionId: "abc123",
                             │   status: "processing"
                             │ }
                             ▼
                    ┌────────────────┐
                    │  React App     │
                    │  Starts polling│
                    └────────────────┘
```

### 2. Processing & Webhook Flow

```
┌────────────────┐
│  Replicate API │
│  Processing... │
│  (~10-30 sec)  │
└────────┬───────┘
         │
         │ Image transformation complete
         │
         ▼
┌────────────────┐
│  Replicate     │
│  Webhook       │
│  POST /webhook │
└────────┬───────┘
         │
         │ Payload:
         │ {
         │   id: "abc123",
         │   status: "succeeded",
         │   output: ["https://..."]
         │ }
         ▼
┌────────────────┐
│  Worker        │
│  /webhook      │
└────────┬───────┘
         │
         │ Stores result in KV:
         │ {
         │   id: "abc123",
         │   status: "succeeded",
         │   imageUrl: "https://...",
         │   processingTime: 12.5
         │ }
         ▼
┌────────────────┐
│  KV Storage    │
│  (Replicated   │
│   globally)    │
└────────────────┘
```

### 3. Status Polling Flow

```
┌────────────────┐
│  React App     │
│  Polling every │
│  2 seconds     │
└────────┬───────┘
         │
         │ GET /status/abc123
         ▼
┌────────────────┐
│  Worker        │
│  /status/:id   │
└────────┬───────┘
         │
         │ Read from KV
         ▼
┌────────────────┐
│  KV Storage    │
└────────┬───────┘
         │
         │ Returns:
         │ {
         │   status: "processing"  (or)
         │   status: "succeeded",
         │   imageUrl: "https://..."
         │ }
         ▼
┌────────────────┐
│  React App     │
│  - If processing: wait 2s, poll again
│  - If succeeded: display image
│  - If failed: show error
└────────────────┘
```

## Component Breakdown

### Frontend (React)

**Location:** `src/`

**Key Files:**
- `App.tsx` - Main application logic
- `lib/transformApi.ts` - Worker API client
- `components/ImageUploader.tsx` - Upload UI

**Responsibilities:**
- Handle file uploads
- Submit to worker
- Poll for completion
- Display results

**Tech Stack:**
- React 18
- TypeScript
- Tailwind CSS
- Vite

### Worker (Cloudflare)

**Location:** `workers/transform-image/`

**Key File:** `index.ts`

**Routes:**
1. `POST /transform` - Submit image
2. `GET /status/:id` - Check status
3. `POST /webhook` - Receive Replicate callback

**Responsibilities:**
- Accept image uploads
- Convert to base64
- Submit to Replicate with webhook
- Store results in KV
- Serve status requests

**Tech Stack:**
- TypeScript
- Cloudflare Workers Runtime
- KV Storage

### Storage (KV)

**Purpose:** Store transformation results

**Schema:**
```typescript
{
  [predictionId: string]: {
    id: string;
    status: "processing" | "succeeded" | "failed";
    imageUrl?: string;
    processingTime?: number;
    error?: string;
    created_at?: string;
    updated_at?: string;
  }
}
```

**TTL:** 1 hour (auto-cleanup)

**Replication:** Global (low-latency reads worldwide)

### External Services

#### Replicate API

**Purpose:** AI image transformation

**Model:** Flux (version: `8c41dc7a...`)

**Input:**
- `prompt` - Transformation instructions
- `image` - Base64-encoded image
- `guidance_scale` - 7.5
- `num_inference_steps` - 30
- `strength` - 0.75

**Output:**
- Array of image URLs

**Webhook:**
- Called when processing completes
- Includes result or error

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         DATA FLOW                                │
└─────────────────────────────────────────────────────────────────┘

User Image (File)
    │
    ▼
FormData
    │
    ▼
Worker: Convert to Base64
    │
    ▼
Replicate API: Process
    │
    ├─────────────────┐
    │                 │
    ▼                 ▼
Webhook          KV Storage
    │                 │
    │                 │
    └────────┬────────┘
             │
             ▼
    Client: Poll Status
             │
             ▼
    Display Result
```

## Security Architecture

### Secrets Management

```
┌────────────────┐
│  Developer     │
│  Local Machine │
└────────┬───────┘
         │
         │ wrangler secret put REPLICATE_API_TOKEN
         ▼
┌────────────────┐
│  Cloudflare    │
│  Secrets Store │
│  (Encrypted)   │
└────────┬───────┘
         │
         │ Injected at runtime
         ▼
┌────────────────┐
│  Worker        │
│  env.REPLICATE_API_TOKEN
└────────────────┘
```

**Security Features:**
- ✅ Secrets never in code
- ✅ Encrypted at rest
- ✅ Only accessible to worker
- ✅ Not logged or exposed

### CORS Configuration

```typescript
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};
```

**Current:** Permissive (allows all origins)

**Production Recommendation:**
```typescript
const corsHeaders = {
  "Access-Control-Allow-Origin": "https://yourdomain.com",
  // ... rest
};
```

## Performance Characteristics

### Latency

| Operation | Typical Time |
|-----------|-------------|
| Worker cold start | < 10ms |
| Worker warm request | < 1ms |
| KV read | < 50ms (global) |
| KV write | < 100ms |
| Replicate processing | 10-30 seconds |
| Total user wait | 10-30 seconds |

### Throughput

| Metric | Free Tier | Paid Tier |
|--------|-----------|-----------|
| Requests/day | 100,000 | Unlimited |
| CPU time/request | 10ms | 30ms |
| KV reads/day | 100,000 | Unlimited |
| KV writes/day | 1,000 | Unlimited |

### Scalability

**Horizontal Scaling:**
- ✅ Automatic (Cloudflare handles)
- ✅ Global distribution
- ✅ No configuration needed

**Vertical Scaling:**
- ⚠️ Limited by Worker CPU time
- ⚠️ Max 30ms CPU time (paid tier)
- ✅ Async operations don't count toward CPU time

## Error Handling

### Error Flow

```
┌────────────────┐
│  Error Occurs  │
└────────┬───────┘
         │
         ▼
┌────────────────┐
│  Worker        │
│  try/catch     │
└────────┬───────┘
         │
         ├─────────────────┬─────────────────┐
         │                 │                 │
         ▼                 ▼                 ▼
    Log Error      Store in KV      Return Error Response
         │                 │                 │
         │                 │                 │
         ▼                 ▼                 ▼
    wrangler tail    Client polls     Client displays
```

### Error Types

1. **Upload Errors**
   - Missing image
   - Invalid format
   - File too large

2. **API Errors**
   - Missing API key
   - Invalid credentials
   - Rate limit exceeded

3. **Processing Errors**
   - Transformation failed
   - Timeout
   - Invalid input

4. **Storage Errors**
   - KV write failed
   - KV read failed
   - Expired result

## Monitoring & Observability

### Logging

```bash
# Real-time logs
wrangler tail

# Example output:
[2025-10-01 18:00:00] POST /transform - 200 OK (123ms)
[2025-10-01 18:00:15] POST /webhook - 200 OK (45ms)
[2025-10-01 18:00:17] GET /status/abc123 - 200 OK (12ms)
```

### Metrics

**Available via Cloudflare Dashboard:**
- Request count
- Error rate
- CPU time
- KV operations
- Bandwidth

### Debugging

```bash
# View KV contents
wrangler kv:key list --binding TRANSFORM_RESULTS

# Get specific result
wrangler kv:key get "prediction-id" --binding TRANSFORM_RESULTS

# View deployment history
wrangler deployments list

# Rollback if needed
wrangler rollback
```

## Deployment Architecture

### CI/CD Flow

```
┌────────────────┐
│  Git Push      │
└────────┬───────┘
         │
         ▼
┌────────────────┐
│  GitHub Actions│  (optional)
│  or Manual     │
└────────┬───────┘
         │
         │ wrangler deploy
         ▼
┌────────────────┐
│  Cloudflare    │
│  Edge Network  │
│  (300+ POPs)   │
└────────┬───────┘
         │
         │ Deployed globally in seconds
         ▼
┌────────────────┐
│  Live Traffic  │
└────────────────┘
```

### Zero-Downtime Deployment

1. New version deployed
2. Gradual rollout (automatic)
3. Old version remains active
4. Traffic shifts to new version
5. Old version decommissioned

**Rollback:** Instant if issues detected

## Cost Optimization

### Current Architecture

**Efficient because:**
- ✅ No long-polling (saves CPU time)
- ✅ KV caching (reduces API calls)
- ✅ Webhook-based (no wasted requests)
- ✅ 1-hour TTL (auto-cleanup)

### Cost Breakdown (100 transformations/day)

```
Cloudflare Workers:
- Requests: ~300/day (submit + status checks + webhook)
- FREE (under 100k limit)

KV Storage:
- Writes: ~100/day (results)
- Reads: ~200/day (status checks)
- FREE (under limits)

Replicate:
- Transformations: 100/day
- Cost: ~$1-5/day
```

**Total:** ~$30-150/month (Replicate only)

## Comparison: Webhook vs Long-Polling

### Long-Polling (Original Supabase Approach)

```
Worker receives request
    │
    ▼
Submit to Replicate
    │
    ▼
while (not complete) {
    wait 1 second
    check status
}  ← CPU time accumulates!
    │
    ▼
Return result
```

**Issues:**
- ⚠️ High CPU time usage
- ⚠️ Risk of timeout
- ⚠️ Wastes resources
- ⚠️ Poor scalability

### Webhook (Current Approach)

```
Worker receives request
    │
    ▼
Submit to Replicate with webhook
    │
    ▼
Return prediction ID immediately
    │
    └─────────────────────────────┐
                                  │
Replicate processes...            │
    │                             │
    ▼                             │
Webhook called                    │
    │                             │
    ▼                             │
Store in KV                       │
                                  │
Client polls status ◄─────────────┘
```

**Benefits:**
- ✅ Low CPU time usage
- ✅ No timeout risk
- ✅ Efficient resource use
- ✅ Excellent scalability

## Future Enhancements

### Potential Improvements

1. **Batch Processing**
   - Process multiple images in parallel
   - Aggregate results

2. **Caching Layer**
   - Cache similar transformations
   - Reduce Replicate API calls

3. **Progressive Updates**
   - Stream partial results
   - Show preview while processing

4. **Analytics**
   - Track usage patterns
   - Monitor costs
   - User behavior insights

5. **Rate Limiting**
   - Per-IP limits
   - API key quotas
   - Abuse prevention

6. **Authentication**
   - User accounts
   - API keys
   - Usage tracking

---

**This architecture provides:**
- ✅ Low latency
- ✅ High scalability
- ✅ Cost efficiency
- ✅ Great UX
- ✅ Easy maintenance
