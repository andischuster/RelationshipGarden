#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🚀 Building and fixing deployment structure...');

try {
  // Clean existing build
  if (fs.existsSync('dist')) {
    fs.rmSync('dist', { recursive: true, force: true });
    console.log('✓ Cleaned existing build');
  }

  // Use the default build (which outputs to dist/public)
  console.log('📦 Building frontend...');
  execSync('npx vite build --mode production', { 
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'production' },
    timeout: 180000 // 3 minutes
  });

  // Check if files are in dist/public and move them to dist/
  if (fs.existsSync('dist/public/index.html')) {
    console.log('🔧 Restructuring for static deployment...');
    
    // Get all files/folders from dist/public
    const items = fs.readdirSync('dist/public');
    
    // Move each item from dist/public to dist/
    items.forEach(item => {
      const sourcePath = path.join('dist/public', item);
      const destPath = path.join('dist', item);
      fs.renameSync(sourcePath, destPath);
    });
    
    // Remove the now-empty public directory
    fs.rmSync('dist/public', { recursive: true });
    
    console.log('✓ Files moved to correct structure');
  }

  // Verify the final structure
  if (fs.existsSync('dist/index.html')) {
    console.log('✅ Static deployment ready!');
    console.log('✓ index.html found in dist/');
    
    const contents = fs.readdirSync('dist');
    console.log(`✓ Build contains: ${contents.join(', ')}`);
    
    // Show file sizes for key files
    const indexSize = fs.statSync('dist/index.html').size;
    console.log(`✓ index.html size: ${Math.round(indexSize / 1024)}KB`);
    
    if (contents.some(file => file.startsWith('assets'))) {
      console.log('✓ Static assets found');
    }
    
    console.log('🎉 Deployment structure fixed!');
  } else {
    throw new Error('index.html not found in dist/ after restructuring');
  }

} catch (error) {
  console.error('❌ Build or restructure failed:', error.message);
  
  // Diagnostic information
  if (fs.existsSync('dist')) {
    console.log('Current dist contents:');
    try {
      const walkDir = (dir, indent = '') => {
        const items = fs.readdirSync(dir);
        items.forEach(item => {
          const itemPath = path.join(dir, item);
          const stats = fs.statSync(itemPath);
          console.log(`${indent}${stats.isDirectory() ? 'd' : '-'} ${item}`);
          if (stats.isDirectory() && indent.length < 8) {
            walkDir(itemPath, indent + '  ');
          }
        });
      };
      walkDir('dist');
    } catch (e) {
      console.log('Could not list dist contents');
    }
  }
  
  process.exit(1);
}