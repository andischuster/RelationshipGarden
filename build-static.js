#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🚀 Building for static deployment...');

try {
  // Clean existing build
  if (fs.existsSync('dist')) {
    fs.rmSync('dist', { recursive: true, force: true });
    console.log('✓ Cleaned existing build');
  }

  // Build with static Vite config that outputs directly to dist/
  console.log('📦 Building frontend with static configuration...');
  execSync('npx vite build --config vite.config.static.ts --mode production', { 
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'production' }
  });

  // Verify the build output
  if (fs.existsSync('dist/index.html')) {
    console.log('✅ Static build successful!');
    console.log('✓ index.html found in dist/');
    
    // List contents of dist directory
    const contents = fs.readdirSync('dist');
    console.log(`✓ Build contains: ${contents.join(', ')}`);
    
    // Check for assets directory
    if (contents.some(file => file.startsWith('assets'))) {
      console.log('✓ Static assets found');
    }
    
    console.log('🎉 Ready for static deployment!');
  } else {
    throw new Error('Build completed but index.html not found in dist/');
  }

} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}