#!/usr/bin/env node

import readline from 'readline';

const WORKER_URL = 'https://transform-image.grovefactor.workers.dev';
const ADMIN_API_KEY = process.env.ADMIN_API_KEY || '';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('\x1b[31m⚠️  WARNING: This will DELETE ALL user data!\x1b[0m');
console.log('\x1b[33m   - All R2 images (originals and transformed)\x1b[0m');
console.log('\x1b[33m   - All KV entries\x1b[0m');
console.log('\x1b[33m   - All D1 database records (transformations and users)\x1b[0m');
console.log('');

rl.question("Type 'DELETE ALL' to confirm: ", async (answer) => {
  if (answer !== 'DELETE ALL') {
    console.log('\x1b[32mCancelled.\x1b[0m');
    rl.close();
    return;
  }

  console.log('');
  console.log('\x1b[31mDeleting all data...\x1b[0m');

  try {
    const headers = {
      'Content-Type': 'application/json'
    };
    
    // Add admin key if available
    if (ADMIN_API_KEY) {
      headers['X-Admin-Key'] = ADMIN_API_KEY;
    }
    
    const response = await fetch(`${WORKER_URL}/admin/cleanup`, {
      method: 'POST',
      headers
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }

    const data = await response.json();

    console.log('');
    console.log('\x1b[32m✅ Cleanup complete!\x1b[0m');
    console.log('');
    console.log('\x1b[36mDeletion statistics:\x1b[0m');
    console.log(`  R2 Originals:       ${data.stats.r2_originals}`);
    console.log(`  R2 Transformed:     ${data.stats.r2_transformed}`);
    console.log(`  KV Keys:            ${data.stats.kv_keys}`);
    console.log(`  DB Transformations: ${data.stats.db_transformations}`);
    console.log(`  DB Users:           ${data.stats.db_users}`);
  } catch (error) {
    console.log('');
    console.log('\x1b[31m❌ Error during cleanup:\x1b[0m');
    console.log('\x1b[31m' + error.message + '\x1b[0m');
  } finally {
    rl.close();
  }
});
