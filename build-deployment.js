#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('Creating deployment build...');

// Clean existing dist
if (fs.existsSync('dist')) {
  fs.rmSync('dist', { recursive: true, force: true });
  console.log('Cleaned existing build');
}

try {
  // Build with static configuration for deployment
  console.log('Building with static configuration...');
  execSync('npx vite build --config vite.config.static.ts --mode production', {
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'production' },
    timeout: 300000
  });

  // Verify build output
  if (fs.existsSync('dist/index.html')) {
    console.log('✓ Build successful - index.html found in dist/');
    
    // List generated files
    const files = fs.readdirSync('dist');
    console.log(`Generated files: ${files.join(', ')}`);
    
    // Remove any server files that shouldn't be in static build
    const serverFiles = ['index.js', 'index.js.map', 'server.js'];
    serverFiles.forEach(file => {
      const filePath = path.join('dist', file);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`Removed server file: ${file}`);
      }
    });
    
    console.log('✓ Deployment build ready');
    console.log('✓ Structure: index.html is at dist/ root level');
    console.log('✓ Ready for static hosting deployment');
    
  } else if (fs.existsSync('dist/public/index.html')) {
    // Handle case where build outputs to dist/public/
    console.log('Moving files from dist/public/ to dist/...');
    
    const publicFiles = fs.readdirSync('dist/public');
    publicFiles.forEach(file => {
      fs.renameSync(
        path.join('dist/public', file),
        path.join('dist', file)
      );
    });
    
    fs.rmSync('dist/public', { recursive: true });
    console.log('✓ Files moved to correct location');
    console.log('✓ Deployment build ready');
    
  } else {
    throw new Error('Build output not found');
  }
  
} catch (error) {
  console.error('Build failed:', error.message);
  process.exit(1);
}