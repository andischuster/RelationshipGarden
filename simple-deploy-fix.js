#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

console.log('Fixing deployment structure...');

// Check if dist/public exists (from regular build)
if (fs.existsSync('dist/public') && fs.existsSync('dist/public/index.html')) {
  console.log('Found files in dist/public/, moving to dist/...');
  
  // Get all items in dist/public
  const items = fs.readdirSync('dist/public');
  
  // Move each item to dist root
  items.forEach(item => {
    const source = path.join('dist/public', item);
    const dest = path.join('dist', item);
    
    // If destination exists, remove it first
    if (fs.existsSync(dest)) {
      fs.rmSync(dest, { recursive: true, force: true });
    }
    
    fs.renameSync(source, dest);
    console.log(`Moved ${item}`);
  });
  
  // Remove empty public directory
  fs.rmSync('dist/public', { recursive: true, force: true });
  console.log('Removed empty public directory');
  
} else if (fs.existsSync('dist/index.html')) {
  console.log('Files already in correct location');
} else {
  console.log('No build output found');
  process.exit(1);
}

// Verify final structure
if (fs.existsSync('dist/index.html')) {
  const contents = fs.readdirSync('dist');
  console.log('Deployment ready! Contents:', contents.join(', '));
} else {
  console.log('Error: index.html not found in dist/');
  process.exit(1);
}