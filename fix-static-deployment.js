#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('Fixing static deployment structure...');

try {
  // Clean existing build
  if (fs.existsSync('dist')) {
    fs.rmSync('dist', { recursive: true, force: true });
  }

  // Build with standard Vite
  console.log('Building client...');
  execSync('npx vite build --mode production', { 
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'production' }
  });

  // Fix the output structure
  if (fs.existsSync('dist/public')) {
    console.log('Restructuring output...');
    
    // Move all files from dist/public to dist
    const files = fs.readdirSync('dist/public');
    files.forEach(file => {
      const src = path.join('dist/public', file);
      const dest = path.join('dist', file);
      fs.renameSync(src, dest);
    });
    
    // Remove empty public directory
    fs.rmdirSync('dist/public');
  }

  // Verify structure
  if (fs.existsSync('dist/index.html')) {
    console.log('Static deployment ready');
    console.log('Files:', fs.readdirSync('dist').join(', '));
  } else {
    throw new Error('index.html not found');
  }

} catch (error) {
  console.error('Build failed:', error.message);
  process.exit(1);
}