# 🚀 Deploy R2 Image Storage

## Run These Commands (5 minutes):

```bash
cd workers/transform-image

# 1. Create R2 bucket
wrangler r2 bucket create demon-hunter-images

# 2. Migrate database to add R2 columns
wrangler d1 execute demon-hunter-db --remote --file=migrate-add-r2.sql

# 3. Deploy worker with R2 support
npm run deploy

# 4. Test by uploading a photo at kpopdemonz.com

# 5. Verify storage
wrangler r2 object list demon-hunter-images
```

---

## What's Now Stored:

### Original Images (Training Input):
- Path: `originals/[prediction-id].jpg`
- Purpose: Raw user uploads for model training
- Never expires

### Transformed Images (Training Output):
- Path: `transformed/[prediction-id].webp`  
- Purpose: AI-generated results for model training
- Downloaded from Replicate and saved permanently

### Database Records:
- Original R2 key
- Transformed R2 key
- Replicate URL (backup)
- User email
- Processing time

---

## Export Training Data Later:

```bash
# List all stored images
wrangler r2 object list demon-hunter-images

# Export database pairs
wrangler d1 execute demon-hunter-db --remote --command="SELECT original_image_r2_key, transformed_image_r2_key FROM transformations WHERE status='succeeded'" --json > training-dataset.json
```

You now have a complete training dataset! 🎉

---

See `R2_SETUP_GUIDE.md` for detailed docs.
