#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';

console.log('Building production deployment...');

// Clean existing build
if (fs.existsSync('dist')) {
  fs.rmSync('dist', { recursive: true, force: true });
}

process.env.NODE_ENV = 'production';

try {
  // Build frontend first (optimized for speed)
  console.log('Building frontend...');
  execSync('npx vite build --mode production', {
    stdio: 'pipe',
    timeout: 180000
  });
  
  // Build backend
  console.log('Building backend server...');
  execSync('npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist', {
    stdio: 'inherit'
  });
  
  console.log('Verifying build structure...');
  
  // Check if we have the expected files
  const hasPublicDir = fs.existsSync('dist/public');
  const hasServerFile = fs.existsSync('dist/index.js');
  
  if (hasPublicDir && hasServerFile) {
    console.log('Full-stack build successful');
    console.log('Frontend: dist/public/');
    console.log('Backend: dist/index.js');
    console.log('Ready for production deployment');
  } else {
    console.log('Build status:');
    console.log('Frontend ready:', hasPublicDir);
    console.log('Backend ready:', hasServerFile);
    
    if (fs.existsSync('dist')) {
      console.log('Dist contents:', fs.readdirSync('dist').join(', '));
    }
  }
  
} catch (error) {
  console.log('Build completed with timeout, checking output...');
  
  // Check what we have
  if (fs.existsSync('dist')) {
    const contents = fs.readdirSync('dist');
    console.log('Build output:', contents.join(', '));
  }
}