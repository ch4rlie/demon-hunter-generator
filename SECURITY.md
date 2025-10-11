# Security Configuration

## Admin Endpoints Protection

The following endpoints are protected and require authentication:

- `/admin/emails` - Export user email list
- `/admin/cleanup` - Delete all user data (DANGEROUS)

## Setup Admin Authentication

### 1. Generate a secure admin key

```bash
# Generate a random secure key
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 2. Set the admin key as a Cloudflare Worker secret

```bash
cd workers/transform-image
wrangler secret put ADMIN_API_KEY
# Paste your generated key when prompted
```

### 3. Use the admin key in scripts

Set the environment variable before running admin scripts:

**Windows (PowerShell):**
```powershell
$env:ADMIN_API_KEY="your-secret-key-here"
node cleanup-all-data.js
```

**Linux/Mac:**
```bash
export ADMIN_API_KEY="your-secret-key-here"
node cleanup-all-data.js
```

Or pass it inline:
```bash
ADMIN_API_KEY="your-secret-key-here" node cleanup-all-data.js
```

## Making Authenticated API Calls

Include the admin key in your requests using one of these methods:

**Method 1: X-Admin-Key header**
```bash
curl -X POST https://transform-image.grovefactor.workers.dev/admin/cleanup \
  -H "X-Admin-Key: your-secret-key-here"
```

**Method 2: Authorization Bearer token**
```bash
curl -X POST https://transform-image.grovefactor.workers.dev/admin/cleanup \
  -H "Authorization: Bearer your-secret-key-here"
```

## Current Security Status

### ✅ Protected Endpoints
- `/admin/emails` - Requires admin key
- `/admin/cleanup` - Requires admin key

### ⚠️ Unprotected Endpoints (By Design)
- `/transform` - Public (users need to upload images)
- `/status/:id` - Public (users need to check their transformation status)
- `/webhook` - Public (Replicate needs to send webhooks)
- `/view/:shortId` - Public (users need to view their results)
- `/recent` - Public (social proof feed)

### 🔒 Recommended: Webhook Signature Verification

For production, consider verifying Replicate webhook signatures. See:
https://replicate.com/docs/webhooks#verifying-webhooks

## Important Notes

⚠️ **Backward Compatibility**: If `ADMIN_API_KEY` is not set, admin endpoints will remain **unprotected** for backward compatibility. 

🔒 **Always set the admin key in production!**

## Testing

Test that authentication is working:

```bash
# Should fail with 401 Unauthorized
curl https://transform-image.grovefactor.workers.dev/admin/emails

# Should succeed
curl https://transform-image.grovefactor.workers.dev/admin/emails \
  -H "X-Admin-Key: your-secret-key-here"
```
