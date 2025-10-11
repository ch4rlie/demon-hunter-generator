#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WORKER_URL = 'https://transform-image.grovefactor.workers.dev';

// Example images from the public/examples folder
const EXAMPLE_IMAGES = [
  './public/examples/chaeyoung-before.jpg',
  './public/examples/jihoon-before.jpg',
  './public/examples/minjun-before.jpg',
  './public/examples/soyeon-before.jpg',
  './public/examples/taehyung-before.jpg',
  './public/examples/yuna-before.jpg',
];

async function transformImage(imagePath) {
  console.log(`\n📸 Transforming: ${path.basename(imagePath)}`);
  
  try {
    // Read the image file
    const imageBuffer = fs.readFileSync(imagePath);
    const blob = new Blob([imageBuffer]);
    
    // Create form data
    const formData = new FormData();
    formData.append('image', blob, path.basename(imagePath));
    formData.append('email', ''); // No email for examples
    formData.append('name', 'Example');
    
    // Submit transformation
    const submitResponse = await fetch(`${WORKER_URL}/transform`, {
      method: 'POST',
      body: formData,
    });
    
    if (!submitResponse.ok) {
      throw new Error(`Submit failed: ${await submitResponse.text()}`);
    }
    
    const submitData = await submitResponse.json();
    const predictionId = submitData.predictionId;
    
    console.log(`⏳ Processing (ID: ${predictionId})...`);
    
    // Poll for completion
    let attempts = 0;
    const maxAttempts = 60; // 5 minutes max
    
    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
      
      const statusResponse = await fetch(`${WORKER_URL}/status/${predictionId}`);
      const statusData = await statusResponse.json();
      
      if (statusData.status === 'succeeded') {
        console.log(`✅ Success! Image URL: ${statusData.imageUrl}`);
        return {
          original: path.basename(imagePath),
          imageUrl: statusData.imageUrl,
          predictionId,
        };
      }
      
      if (statusData.status === 'failed') {
        console.log(`❌ Failed: ${statusData.error || 'Unknown error'}`);
        return null;
      }
      
      attempts++;
      process.stdout.write('.');
    }
    
    console.log(`\n⏱️ Timeout after ${maxAttempts * 5} seconds`);
    return null;
    
  } catch (error) {
    console.log(`\n❌ Error: ${error.message}`);
    return null;
  }
}

async function main() {
  console.log('🎨 K-Pop Demon Hunter Example Generator\n');
  console.log(`Worker URL: ${WORKER_URL}`);
  console.log(`Images to transform: ${EXAMPLE_IMAGES.length}\n`);
  
  if (EXAMPLE_IMAGES.length === 0) {
    console.log('⚠️  No example images configured!');
    console.log('Edit this script and add image paths to the EXAMPLE_IMAGES array.');
    return;
  }
  
  const results = [];
  
  for (const imagePath of EXAMPLE_IMAGES) {
    if (!fs.existsSync(imagePath)) {
      console.log(`\n⚠️  File not found: ${imagePath}`);
      continue;
    }
    
    const result = await transformImage(imagePath);
    if (result) {
      results.push(result);
    }
  }
  
  console.log('\n\n📊 Summary:');
  console.log(`Total: ${EXAMPLE_IMAGES.length}`);
  console.log(`Successful: ${results.length}`);
  console.log(`Failed: ${EXAMPLE_IMAGES.length - results.length}`);
  
  if (results.length > 0) {
    console.log('\n✅ Successful transformations:');
    results.forEach(r => {
      console.log(`  ${r.original}: ${r.imageUrl}`);
    });
    
    // Save results to JSON
    const outputPath = path.join(__dirname, 'example-results.json');
    fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
    console.log(`\n💾 Results saved to: ${outputPath}`);
  }
}

main().catch(console.error);
