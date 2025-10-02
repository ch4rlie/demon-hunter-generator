# Transform Image Cloudflare Worker

A Cloudflare Worker that transforms images into K-Pop Demon Hunter characters using Replicate's AI models with webhook-based async processing.

## Architecture

1. **POST /transform** - Upload an image, get a prediction ID back immediately
2. **Webhook** - Replicate calls back when processing completes, result stored in KV
3. **GET /status/:id** - Client polls this endpoint to check if transformation is ready
4. **KV Storage** - Results cached for 1 hour

## Setup Instructions

### 1. Install Wrangler CLI

```bash
npm install -g wrangler
```

### 2. Login to Cloudflare

```bash
wrangler login
```

### 3. Create KV Namespace

```bash
# Production namespace
wrangler kv:namespace create "TRANSFORM_RESULTS"

# Preview namespace (for local dev)
wrangler kv:namespace create "TRANSFORM_RESULTS" --preview
```

This will output namespace IDs. Copy them into `wrangler.toml`:

```toml
kv_namespaces = [
  { binding = "TRANSFORM_RESULTS", id = "abc123...", preview_id = "xyz789..." }
]
```

### 4. Set Replicate API Token

Get your API token from [Replicate](https://replicate.com/account/api-tokens), then:

```bash
wrangler secret put REPLICATE_API_TOKEN
# Paste your token when prompted
```

### 5. Update Worker URL

After your first deployment, Cloudflare will give you a worker URL like:
`https://transform-image.your-subdomain.workers.dev`

Update this in `wrangler.toml`:

```toml
[vars]
WORKER_URL = "https://transform-image.your-subdomain.workers.dev"
```

Then redeploy so the webhook URL is correct.

### 7. Deploy

```bash
wrangler deploy
```

## Local Development

To run the worker locally using `wrangler dev`, you need to provide local environment variables.

1.  Create a file named `.dev.vars` in the `workers/transform-image` directory.
2.  Add your secrets to this file. It should look like this:

    ```
    REPLICATE_API_TOKEN="your_replicate_api_token"
    HCAPTCHA_SECRET_KEY="your_hcaptcha_secret_key"
    RESEND_API_KEY="your_resend_api_key"
    ```

3.  Run the local development server:

    ```bash
    wrangler dev
    ```

Wrangler will automatically load the variables from `.dev.vars` when you run the `dev` command. This file is included in `.gitignore`, so your secrets will not be committed to your repository.

Note: Webhooks from the Replicate API will not work with your local server unless you use a tunneling service like `cloudflared` or `ngrok`.

## API Usage

### Submit Image for Transformation

```bash
curl -X POST https://transform-image.your-subdomain.workers.dev/transform \
  -F "image=@photo.jpg"
```

Response:
```json
{
  "success": true,
  "predictionId": "abc123",
  "status": "processing",
  "statusUrl": "/status/abc123"
}
```

### Check Status

```bash
curl https://transform-image.your-subdomain.workers.dev/status/abc123
```

Response (processing):
```json
{
  "id": "abc123",
  "status": "processing",
  "created_at": "2025-10-01T18:00:00Z"
}
```

Response (completed):
```json
{
  "id": "abc123",
  "status": "succeeded",
  "imageUrl": "https://replicate.delivery/...",
  "processingTime": 12.5,
  "updated_at": "2025-10-01T18:00:15Z"
}
```

## Client-Side Integration

```typescript
// 1. Upload image
const formData = new FormData();
formData.append('image', imageFile);

const uploadResponse = await fetch('https://transform-image.your-subdomain.workers.dev/transform', {
  method: 'POST',
  body: formData,
});

const { predictionId } = await uploadResponse.json();

// 2. Poll for completion
const pollStatus = async () => {
  const statusResponse = await fetch(
    `https://transform-image.your-subdomain.workers.dev/status/${predictionId}`
  );
  const result = await statusResponse.json();

  if (result.status === 'succeeded') {
    console.log('Transformed image:', result.imageUrl);
    return result;
  } else if (result.status === 'failed') {
    console.error('Transformation failed:', result.error);
    return result;
  } else {
    // Still processing, check again in 2 seconds
    await new Promise(resolve => setTimeout(resolve, 2000));
    return pollStatus();
  }
};

const finalResult = await pollStatus();
```

## Cost Considerations

- **Cloudflare Workers**: Free tier includes 100k requests/day
- **KV Storage**: Free tier includes 100k reads/day, 1k writes/day
- **Replicate API**: Charged per prediction (varies by model)

## Troubleshooting

### Webhook not being called

1. Make sure `WORKER_URL` in `wrangler.toml` is set to your actual deployed worker URL
2. Check Cloudflare logs: `wrangler tail`
3. Verify the webhook URL is publicly accessible (not localhost)

### KV namespace errors

Make sure you've created the KV namespace and updated the IDs in `wrangler.toml`.

### CORS errors

The worker includes permissive CORS headers. If you need to restrict origins, update the `corsHeaders` object in `index.ts`.

## Security Notes

- Never commit `REPLICATE_API_TOKEN` to git
- Use Wrangler secrets for sensitive values
- Consider adding authentication to prevent abuse
- Rate limiting can be added via Cloudflare's Rate Limiting rules

## License

MIT
