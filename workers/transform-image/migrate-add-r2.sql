-- Migration: Add R2 storage columns
ALTER TABLE transformations ADD COLUMN original_image_r2_key TEXT;
ALTER TABLE transformations ADD COLUMN transformed_image_r2_key TEXT;
ALTER TABLE transformations ADD COLUMN replicate_output_url TEXT;
