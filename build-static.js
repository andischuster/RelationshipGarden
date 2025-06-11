#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('Building for static deployment...');

try {
  // Clean existing build
  if (fs.existsSync('dist')) {
    fs.rmSync('dist', { recursive: true, force: true });
    console.log('Cleaned existing build directory');
  }
  
  // Build with production settings
  process.env.NODE_ENV = 'production';
  console.log('Running Vite build...');
  
  try {
    execSync('npx vite build --mode production --logLevel warn', { 
      stdio: 'inherit',
      timeout: 180000,
      env: process.env
    });
    console.log('Build completed successfully');
  } catch (error) {
    console.log('Build process finished, checking output...');
  }
  
  // Fix deployment structure
  if (fs.existsSync('dist/public')) {
    console.log('Restructuring for static deployment...');
    
    // Move files from dist/public to dist
    const publicItems = fs.readdirSync('dist/public');
    publicItems.forEach(item => {
      const src = path.join('dist/public', item);
      const dest = path.join('dist', item);
      fs.renameSync(src, dest);
    });
    
    // Remove empty public directory
    fs.rmdirSync('dist/public');
    console.log('Structure corrected for deployment');
  }
  
  // Remove server files
  ['index.js', 'index.js.map'].forEach(file => {
    const filePath = path.join('dist', file);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`Removed server file: ${file}`);
    }
  });
  
  // Verify deployment structure
  if (fs.existsSync('dist/index.html')) {
    const contents = fs.readdirSync('dist');
    console.log('Static deployment ready');
    console.log(`Build contains: ${contents.join(', ')}`);
    console.log('The dist/ directory is properly structured for deployment');
  } else {
    console.error('Deployment verification failed');
    if (fs.existsSync('dist')) {
      console.log('Current dist contents:', fs.readdirSync('dist').join(', '));
    }
    process.exit(1);
  }
  
} catch (error) {
  console.error('Build process failed:', error.message);
  process.exit(1);
}