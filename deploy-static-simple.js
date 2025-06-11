#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';

console.log('Building for static deployment...');

// Clean existing build
if (fs.existsSync('dist')) {
  fs.rmSync('dist', { recursive: true, force: true });
  console.log('Cleaned existing build');
}

// Build using static configuration
try {
  console.log('Building with static configuration...');
  execSync('npx vite build --config vite.config.static.ts --mode production', {
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'production' }
  });
  
  // Verify build output
  if (fs.existsSync('dist/index.html')) {
    console.log('✓ Build successful - index.html found in dist/');
    const files = fs.readdirSync('dist');
    console.log(`Generated files: ${files.join(', ')}`);
    console.log('✓ Ready for static deployment');
  } else {
    throw new Error('index.html not found in dist/');
  }
  
} catch (error) {
  console.error('Build failed:', error.message);
  process.exit(1);
}