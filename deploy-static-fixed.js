#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';

console.log('🚀 Building for static deployment...');

try {
  // Clean existing build
  if (fs.existsSync('dist')) {
    fs.rmSync('dist', { recursive: true, force: true });
    console.log('✓ Cleaned existing build');
  }

  // Build with Vite
  console.log('Building client files...');
  execSync('npx vite build --mode production', { 
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'production' }
  });

  // Restructure output for static deployment
  if (fs.existsSync('dist/public')) {
    console.log('✓ Restructuring for static deployment...');
    
    // Move files from dist/public to dist/
    execSync('mv dist/public/* dist/ && rmdir dist/public', { stdio: 'inherit' });
    
    console.log('✓ Files moved to correct location');
  }

  // Verify deployment structure
  if (fs.existsSync('dist/index.html')) {
    console.log('✓ Static deployment ready!');
    console.log('✓ index.html found in dist/');
    
    const contents = fs.readdirSync('dist');
    console.log(`✓ Build contains: ${contents.join(', ')}`);
  } else {
    throw new Error('index.html not found in dist/ directory');
  }

} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}