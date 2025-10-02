# 🚀 D1 Database Setup Guide

This will store all user emails and transformation data permanently in Cloudflare D1 (SQLite).

## Step 1: Create D1 Database

```bash
cd workers/transform-image
wrangler d1 create demon-hunter-db
```

**Copy the output** - you'll need the `database_id`. It looks like:
```
✅ Successfully created DB 'demon-hunter-db'

[[d1_databases]]
binding = "DB"
database_name = "demon-hunter-db"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"  ← COPY THIS
```

## Step 2: Update wrangler.toml

Add the D1 binding to `wrangler.toml`:

```toml
name = "transform-image"
main = "index.ts"
compatibility_date = "2024-01-01"

# KV namespace for storing transformation results
kv_namespaces = [
  { binding = "TRANSFORM_RESULTS", id = "802279cd441d4b189691a7a213433d68", preview_id = "398977c3d6d24b349af2d82cdda90a03" }
]

# D1 Database for permanent user storage
[[d1_databases]]
binding = "DB"
database_name = "demon-hunter-db"
database_id = "YOUR_DATABASE_ID_FROM_STEP_1"  ← PASTE HERE

# Environment variables
[vars]
WORKER_URL = "https://transform-image.grovefactor.workers.dev"
```

## Step 3: Initialize Database Schema

```bash
wrangler d1 execute demon-hunter-db --file=schema.sql
```

You should see:
```
✅ Successfully executed SQL on demon-hunter-db
```

## Step 4: Deploy Worker

```bash
npm run deploy
```

## Step 5: Test It!

1. Go to your site: `https://kpopdemonz.com`
2. Upload a photo and enter your email
3. Wait for transformation to complete
4. Check stored data:

```bash
# View all users
wrangler d1 execute demon-hunter-db --command="SELECT * FROM users"

# View all transformations
wrangler d1 execute demon-hunter-db --command="SELECT * FROM transformations"
```

## Step 6: Export Your Email List

Visit: `https://transform-image.grovefactor.workers.dev/admin/emails`

This returns JSON with all user emails, names, and stats:
```json
{
  "total": 5,
  "users": [
    {
      "email": "user@example.com",
      "name": "John",
      "first_seen": "2025-10-01T15:30:00",
      "last_seen": "2025-10-01T15:45:00",
      "transform_count": 3
    }
  ],
  "exportedAt": "2025-10-01T20:00:00Z"
}
```

## 📊 Useful Queries

```bash
# Total users
wrangler d1 execute demon-hunter-db --command="SELECT COUNT(*) as total_users FROM users"

# Top users by transforms
wrangler d1 execute demon-hunter-db --command="SELECT email, name, transform_count FROM users ORDER BY transform_count DESC LIMIT 10"

# Recent transformations
wrangler d1 execute demon-hunter-db --command="SELECT user_email, created_at FROM transformations ORDER BY created_at DESC LIMIT 20"

# Total transformations
wrangler d1 execute demon-hunter-db --command="SELECT COUNT(*) as total_transforms FROM transformations"

# Export emails as CSV (copy to clipboard)
wrangler d1 execute demon-hunter-db --command="SELECT email, name FROM users" > emails.csv
```

## ⚠️ Important Notes

- **Data is permanent** - Not deleted after 24 hours like KV
- **No cost** - D1 is free up to 100k reads/day
- **Backup regularly** - Export your data periodically
- **Add auth later** - The `/admin/emails` endpoint is currently public (add a secret token)

## 🔐 Securing the Admin Endpoint (Optional)

Add to `wrangler.toml`:
```toml
[vars]
ADMIN_SECRET = "your-secret-token-here"
```

Update worker code to check token before exporting.
