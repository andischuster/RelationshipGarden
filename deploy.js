#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🚀 Building for static deployment...');

// Clean existing build
if (fs.existsSync('dist')) {
  fs.rmSync('dist', { recursive: true, force: true });
  console.log('✓ Cleaned dist directory');
}

try {
  // Use static configuration that outputs directly to dist/
  console.log('📦 Building with static configuration...');
  execSync('npx vite build --config vite.config.static.ts --mode production', {
    stdio: 'pipe',
    env: { ...process.env, NODE_ENV: 'production' },
    timeout: 180000 // 3 minutes
  });
  
  console.log('✓ Build completed');
  
} catch (error) {
  console.log('⚠️ Static build failed, trying fallback approach...');
  
  // Clean and try fallback
  if (fs.existsSync('dist')) {
    fs.rmSync('dist', { recursive: true, force: true });
  }
  
  try {
    // Use default config and restructure
    execSync('npx vite build --mode production', {
      stdio: 'pipe',
      env: { ...process.env, NODE_ENV: 'production' },
      timeout: 180000
    });
    
    // Move files from dist/public to dist/
    if (fs.existsSync('dist/public')) {
      console.log('🔧 Restructuring output directory...');
      
      const publicFiles = fs.readdirSync('dist/public');
      publicFiles.forEach(file => {
        fs.renameSync(
          path.join('dist/public', file),
          path.join('dist', file)
        );
      });
      
      fs.rmSync('dist/public', { recursive: true });
      console.log('✓ Restructuring completed');
    }
    
  } catch (fallbackError) {
    console.error('❌ Both build attempts failed');
    process.exit(1);
  }
}

// Verify final structure
if (fs.existsSync('dist/index.html')) {
  console.log('✅ Static deployment ready!');
  
  const files = fs.readdirSync('dist');
  console.log(`📁 Generated files: ${files.join(', ')}`);
  
  // Remove any server files
  const serverFiles = ['index.js', 'index.js.map'];
  serverFiles.forEach(file => {
    const filePath = path.join('dist', file);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`🗑️ Removed server file: ${file}`);
    }
  });
  
  console.log('🎉 Ready for static deployment!');
  console.log('📋 To deploy: Set public directory to "dist"');
  
} else {
  console.error('❌ index.html not found in dist/');
  if (fs.existsSync('dist')) {
    const files = fs.readdirSync('dist');
    console.log(`Current dist contents: ${files.join(', ')}`);
  }
  process.exit(1);
}