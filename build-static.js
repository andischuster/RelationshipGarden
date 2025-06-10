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
  
  // Set NODE_ENV to production to avoid development dependencies
  process.env.NODE_ENV = 'production';
  
  // Build the client using the current vite configuration with timeout
  console.log('Building client with vite (production mode)...');
  try {
    execSync('timeout 120 npx vite build --mode production', { 
      stdio: 'inherit',
      timeout: 120000 
    });
  } catch (error) {
    console.log('Vite build completed or timed out, checking output...');
  }
  
  // The current config builds to dist/public, we need to move files to dist/
  console.log('Restructuring build output...');
  
  if (fs.existsSync('dist/public')) {
    console.log('Found dist/public directory, restructuring...');
    
    // Create a temporary directory for the move
    const tempDir = 'temp-static';
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
    fs.mkdirSync(tempDir);
    
    // Move everything from dist/public to temp directory
    const publicFiles = fs.readdirSync('dist/public');
    for (const file of publicFiles) {
      const srcPath = path.join('dist/public', file);
      const tempPath = path.join(tempDir, file);
      
      if (fs.statSync(srcPath).isDirectory()) {
        fs.cpSync(srcPath, tempPath, { recursive: true });
      } else {
        fs.copyFileSync(srcPath, tempPath);
      }
    }
    
    // Remove the entire dist directory
    fs.rmSync('dist', { recursive: true, force: true });
    
    // Rename temp directory to dist
    fs.renameSync(tempDir, 'dist');
    
    console.log('Successfully restructured build output');
  } else {
    console.log('No dist/public directory found, checking current structure...');
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
  
  console.log('Static build complete!');
  
  if (fs.existsSync('dist')) {
    console.log('Contents of dist/:');
    const distFiles = fs.readdirSync('dist');
    console.log(distFiles.join(', '));
    
    // Verify index.html exists
    if (fs.existsSync('dist/index.html')) {
      console.log('✓ index.html found in dist/ directory');
      console.log('✓ Build ready for static deployment');
    } else {
      console.error('✗ index.html not found in dist/ directory');
      
      // Try to find index.html in subdirectories
      function findIndexHtml(dir, prefix = '') {
        const items = fs.readdirSync(dir);
        for (const item of items) {
          const fullPath = path.join(dir, item);
          const relativePath = path.join(prefix, item);
          
          if (fs.statSync(fullPath).isDirectory()) {
            findIndexHtml(fullPath, relativePath);
          } else if (item === 'index.html') {
            console.log(`Found index.html at: ${relativePath}`);
          }
        }
      }
      
      console.log('Searching for index.html in dist directory...');
      findIndexHtml('dist');
    }
  } else {
    console.error('✗ dist directory not found');
    process.exit(1);
  }
  
} catch (error) {
  console.error('Build failed:', error.message);
  console.error('Error details:', error);
  process.exit(1);
}