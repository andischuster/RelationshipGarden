#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🚀 Building for static deployment...');

try {
  // Clean existing build
  if (fs.existsSync('dist')) {
    fs.rmSync('dist', { recursive: true, force: true });
    console.log('✓ Cleaned existing build directory');
  }

  // Set production environment
  process.env.NODE_ENV = 'production';

  // Build using the static configuration that outputs directly to dist/
  console.log('📦 Building with static configuration...');
  execSync('npx vite build --config vite.config.static.ts --mode production', { 
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'production' },
    timeout: 300000 // 5 minutes timeout
  });

  // Verify the build output
  if (fs.existsSync('dist/index.html')) {
    console.log('✅ Static build successful!');
    console.log('✓ index.html found in dist/');
    
    // List contents of dist directory
    const contents = fs.readdirSync('dist');
    console.log(`✓ Build contains: ${contents.join(', ')}`);
    
    // Check for assets directory
    if (contents.some(file => file.startsWith('assets'))) {
      console.log('✓ Static assets found');
    }
    
    // Remove any server-side files that shouldn't be in static deployment
    const serverFiles = ['index.js', 'index.js.map', 'server.js', 'server.js.map'];
    serverFiles.forEach(file => {
      const filePath = path.join('dist', file);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`✓ Removed server file: ${file}`);
      }
    });
    
    console.log('🎉 Ready for static deployment!');
    console.log('📁 Final structure:');
    const finalContents = fs.readdirSync('dist');
    finalContents.forEach(item => {
      const itemPath = path.join('dist', item);
      const stats = fs.statSync(itemPath);
      console.log(`  ${stats.isDirectory() ? 'd' : '-'} ${item}`);
    });
    
  } else {
    throw new Error('Build completed but index.html not found in dist/');
  }

} catch (error) {
  console.error('❌ Build failed:', error.message);
  
  // Check if there's any output to diagnose
  if (fs.existsSync('dist')) {
    console.log('Partial build contents:');
    const contents = fs.readdirSync('dist');
    contents.forEach(item => console.log(`  ${item}`));
  }
  
  process.exit(1);
}