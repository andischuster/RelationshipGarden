#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('Building static files for deployment...');

try {
  // Clean up any existing build directories
  console.log('Cleaning up existing directories...');
  if (fs.existsSync('dist')) {
    fs.rmSync('dist', { recursive: true, force: true });
  }
  if (fs.existsSync('temp-build')) {
    fs.rmSync('temp-build', { recursive: true, force: true });
  }
  
  // Build the client using the current vite configuration
  console.log('Building client with vite...');
  execSync('npx vite build', { stdio: 'inherit' });
  
  // The current config builds to dist/public, we need to move files to dist/
  console.log('Restructuring build output...');
  
  if (fs.existsSync('dist/public')) {
    // Move everything from dist/public to dist/
    const publicFiles = fs.readdirSync('dist/public');
    
    for (const file of publicFiles) {
      const srcPath = path.join('dist/public', file);
      const destPath = path.join('dist', file);
      
      if (fs.statSync(srcPath).isDirectory()) {
        fs.cpSync(srcPath, destPath, { recursive: true });
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
    
    // Remove the now-empty public directory
    fs.rmSync('dist/public', { recursive: true, force: true });
  }
  
  // Remove any server-side files that might have been built
  const serverFiles = ['index.js', 'index.js.map'];
  for (const file of serverFiles) {
    const filePath = path.join('dist', file);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`Removed server file: ${file}`);
    }
  }
  
  console.log('Static build complete! Files are in dist/ directory');
  console.log('Contents of dist/:');
  if (fs.existsSync('dist')) {
    console.log(fs.readdirSync('dist').join(', '));
    
    // Verify index.html exists
    if (fs.existsSync('dist/index.html')) {
      console.log('✓ index.html found in dist/ directory');
    } else {
      console.error('✗ index.html not found in dist/ directory');
      process.exit(1);
    }
  }
  
} catch (error) {
  console.error('Build failed:', error.message);
  process.exit(1);
}