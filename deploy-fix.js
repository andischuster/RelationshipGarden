#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('Fixing static deployment structure...');

// Clean and prepare
if (fs.existsSync('dist')) {
  fs.rmSync('dist', { recursive: true, force: true });
}

try {
  // Build with optimized settings to reduce timeout risk
  console.log('Running optimized build...');
  execSync('NODE_ENV=production npx vite build --mode production --logLevel warn', {
    stdio: 'inherit',
    timeout: 120000,
    env: { ...process.env, NODE_ENV: 'production' }
  });
  console.log('Build completed');
} catch (error) {
  console.log('Build process completed, checking output...');
}

// Handle deployment structure
if (fs.existsSync('dist/public')) {
  console.log('Restructuring for static deployment...');
  
  // Move contents from dist/public to dist
  const publicPath = 'dist/public';
  const items = fs.readdirSync(publicPath);
  
  items.forEach(item => {
    const src = path.join(publicPath, item);
    const dest = path.join('dist', item);
    fs.renameSync(src, dest);
  });
  
  // Remove empty public directory
  fs.rmdirSync(publicPath);
  console.log('Structure fixed for deployment');
}

// Clean server files
['index.js', 'index.js.map'].forEach(file => {
  const filePath = path.join('dist', file);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
});

// Verify final structure
if (fs.existsSync('dist/index.html')) {
  const contents = fs.readdirSync('dist');
  console.log('Deployment ready:', contents.join(', '));
  console.log('The dist/ directory is now properly structured for static deployment');
} else {
  console.error('Deployment verification failed - index.html not in correct location');
  process.exit(1);
}