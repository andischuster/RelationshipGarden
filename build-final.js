#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('Building for static deployment...');

// Clean dist directory
if (fs.existsSync('dist')) {
  fs.rmSync('dist', { recursive: true, force: true });
  console.log('Cleaned existing build');
}

try {
  // Build with static config
  console.log('Building frontend...');
  execSync('npx vite build --config vite.config.static.ts --mode production', {
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'production' }
  });

  // Check output structure
  if (fs.existsSync('dist/index.html')) {
    console.log('Build successful - index.html found in dist/');
    
    const files = fs.readdirSync('dist');
    console.log(`Generated files: ${files.join(', ')}`);
    
    console.log('Static deployment ready!');
  } else if (fs.existsSync('dist/public/index.html')) {
    console.log('Restructuring output...');
    
    // Move files from dist/public to dist
    const publicFiles = fs.readdirSync('dist/public');
    publicFiles.forEach(file => {
      fs.renameSync(
        path.join('dist/public', file),
        path.join('dist', file)
      );
    });
    
    // Remove empty public directory
    fs.rmSync('dist/public', { recursive: true });
    
    console.log('Restructuring complete - static deployment ready!');
  } else {
    throw new Error('Build output not found');
  }
  
} catch (error) {
  console.error(`Build failed: ${error.message}`);
  process.exit(1);
}