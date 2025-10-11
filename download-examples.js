#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Read the results
const results = JSON.parse(fs.readFileSync('./example-results.json', 'utf8'));

console.log('📥 Downloading new example transformations...\n');

async function downloadImage(url, outputPath) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const buffer = await response.arrayBuffer();
    fs.writeFileSync(outputPath, Buffer.from(buffer));
    return true;
  } catch (error) {
    console.error(`Failed to download: ${error.message}`);
    return false;
  }
}

async function main() {
  let success = 0;
  let failed = 0;
  
  for (const result of results) {
    // Extract name without extension (e.g., "chaeyoung-before.jpg" -> "chaeyoung")
    const name = result.original.replace('-before.jpg', '');
    const outputPath = path.join(__dirname, 'public', 'examples', `${name}-after.webp`);
    
    console.log(`Downloading ${name}...`);
    
    const downloaded = await downloadImage(result.imageUrl, outputPath);
    
    if (downloaded) {
      console.log(`✅ Saved to: ${outputPath}\n`);
      success++;
    } else {
      console.log(`❌ Failed: ${name}\n`);
      failed++;
    }
  }
  
  console.log('\n📊 Summary:');
  console.log(`✅ Downloaded: ${success}`);
  console.log(`❌ Failed: ${failed}`);
  
  if (success > 0) {
    console.log('\n✨ New example images are ready in public/examples/');
  }
}

main().catch(console.error);
