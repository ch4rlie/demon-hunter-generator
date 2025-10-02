# 🎯 Next Steps: D1 Database Setup

## What We Just Added:

✅ **D1 Database Integration** - Permanent storage for:
- User emails & names
- Transformation history
- Usage analytics
- No 24-hour expiration!

✅ **Export Endpoint** - `/admin/emails` to download your full email list

## 🚀 Setup Instructions (5 minutes):

### 1. Create D1 Database
```bash
cd workers/transform-image
wrangler d1 create demon-hunter-db
```

**Important:** Copy the `database_id` from the output!

### 2. Update wrangler.toml

Add this to `workers/transform-image/wrangler.toml`:

```toml
[[d1_databases]]
binding = "DB"
database_name = "demon-hunter-db"
database_id = "YOUR_DATABASE_ID_HERE"  ← Paste your ID
```

### 3. Initialize Schema
```bash
wrangler d1 execute demon-hunter-db --file=schema.sql
```

### 4. Deploy
```bash
npm run deploy
```

### 5. Test
Upload a photo with email, then visit:
`https://transform-image.grovefactor.workers.dev/admin/emails`

## 📊 What Gets Stored:

### Users Table:
- Email address
- Name
- First seen date
- Last seen date  
- Total transformations count

### Transformations Table:
- Prediction ID
- User email
- Original image URL (if stored)
- Transformed image URL
- Processing time
- Created/completed timestamps

## 💾 Exporting Data:

**Web:** `https://transform-image.grovefactor.workers.dev/admin/emails`

**CLI:**
```bash
wrangler d1 execute demon-hunter-db --command="SELECT email, name FROM users"
```

---

See `workers/transform-image/D1_SETUP_GUIDE.md` for full details!
