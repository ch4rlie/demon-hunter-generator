# D1 Database Setup

## 1. Create D1 Database

```bash
cd workers/transform-image
wrangler d1 create demon-hunter-db
```

This will output something like:
```
✅ Successfully created DB 'demon-hunter-db'
binding = "DB"
database_name = "demon-hunter-db"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

## 2. Update wrangler.toml

Add this to `wrangler.toml`:

```toml
[[d1_databases]]
binding = "DB"
database_name = "demon-hunter-db"
database_id = "YOUR_DATABASE_ID_HERE"
```

## 3. Initialize Schema

```bash
wrangler d1 execute demon-hunter-db --file=schema.sql
```

## 4. Deploy Worker

```bash
npm run deploy
```

## 5. Export User Emails

Visit: `https://transform-image.grovefactor.workers.dev/admin/emails`

This will return all stored emails in JSON format.

## Querying Data (Optional)

```bash
# Count total users
wrangler d1 execute demon-hunter-db --command="SELECT COUNT(*) as total FROM users"

# Get all emails
wrangler d1 execute demon-hunter-db --command="SELECT email, name, transform_count FROM users ORDER BY created_at DESC"

# Get transformation stats
wrangler d1 execute demon-hunter-db --command="SELECT status, COUNT(*) as count FROM transformations GROUP BY status"
```
