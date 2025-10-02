# 🖼️ R2 Image Storage Setup

Store ALL images permanently for model training!

## What Gets Stored:

✅ **Original uploads** → `originals/[prediction-id].jpg`  
✅ **Transformed results** → `transformed/[prediction-id].webp`  
✅ **Replicate URLs** → Backed up in database  

## Step 1: Create R2 Bucket

```bash
cd workers/transform-image
wrangler r2 bucket create demon-hunter-images
```

## Step 2: Migrate Database

Add new columns for R2 storage:

```bash
wrangler d1 execute demon-hunter-db --remote --file=migrate-add-r2.sql
```

## Step 3: Deploy Worker

```bash
npm run deploy
```

## Step 4: Test It!

Upload a photo with email, then check R2:

```bash
# List stored images
wrangler r2 object list demon-hunter-images

# Check originals folder
wrangler r2 object list demon-hunter-images --prefix=originals/

# Check transformed folder
wrangler r2 object list demon-hunter-images --prefix=transformed/
```

## Step 5: Verify Database

```bash
# View transformation records with R2 keys
wrangler d1 execute demon-hunter-db --remote --command="SELECT prediction_id, original_image_r2_key, transformed_image_r2_key FROM transformations LIMIT 5"
```

---

## 📦 Folder Structure in R2:

```
demon-hunter-images/
├── originals/
│   ├── abc123xyz.jpg
│   ├── def456uvw.png
│   └── ...
└── transformed/
    ├── abc123xyz.webp
    ├── def456uvw.webp
    └── ...
```

---

## 🔄 Data Flow:

1. **User uploads photo** → Saved to R2 `originals/`
2. **Sent to Replicate** for transformation
3. **Transformation completes** → Worker downloads from Replicate
4. **Saved to R2 `transformed/`** 
5. **Database updated** with both R2 keys and Replicate URL

---

## 📊 Export Training Data:

### Get All Images for Training:

```bash
# Download all originals
wrangler r2 object list demon-hunter-images --prefix=originals/ > originals-list.txt

# Download all transformed
wrangler r2 object list demon-hunter-images --prefix=transformed/ > transformed-list.txt

# Export pairs from database
wrangler d1 execute demon-hunter-db --remote --command="SELECT original_image_r2_key, transformed_image_r2_key FROM transformations WHERE status='succeeded'" --json > training-pairs.json
```

### Bulk Download (for training):

```bash
# Download a specific image
wrangler r2 object get demon-hunter-images/originals/abc123.jpg > original.jpg

# Or use rclone for bulk downloads (setup: https://rclone.org/)
```

---

## 💾 Storage Limits:

- **Free tier**: 10 GB storage
- **Operations**: Class A (write) 1M/month, Class B (read) 10M/month
- **No egress fees** 🎉

---

## 🌐 Optional: Public Access Setup

To serve images directly from R2 with custom domain:

1. Go to Cloudflare dashboard → R2 → demon-hunter-images
2. Settings → **Public Access** → Enable
3. Add custom domain: `images.kpopdemonz.com`
4. Images will be accessible at: `https://images.kpopdemonz.com/transformed/[id].webp`

This makes your app fully self-hosted! No Replicate dependency for serving images.

---

## 🔐 Backup Strategy:

```bash
# Export database with all R2 keys
wrangler d1 export demon-hunter-db --remote --output=backup.sql

# R2 automatically replicates across regions
# For extra safety: download everything monthly
```

Your training dataset is now permanent and owned by you! 🚀
