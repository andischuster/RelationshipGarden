#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('Building full-stack deployment...');

try {
  // Clean existing build
  if (fs.existsSync('dist')) {
    fs.rmSync('dist', { recursive: true, force: true });
    console.log('Cleaned existing build directory');
  }

  // Set production environment
  process.env.NODE_ENV = 'production';

  // Build frontend and backend using the existing build script
  console.log('Building frontend and backend...');
  execSync('npm run build', {
    stdio: 'inherit',
    env: process.env,
    timeout: 300000 // 5 minutes
  });

  console.log('Build completed, verifying structure...');

  // Check if both frontend and backend are built
  const hasIndexHtml = fs.existsSync('dist/public/index.html');
  const hasServerJs = fs.existsSync('dist/index.js');

  if (hasIndexHtml && hasServerJs) {
    console.log('Full-stack build successful');
    console.log('Frontend: dist/public/');
    console.log('Backend: dist/index.js');
    
    // Show contents
    if (fs.existsSync('dist/public')) {
      const publicContents = fs.readdirSync('dist/public');
      console.log('Frontend files:', publicContents.join(', '));
    }
    
    console.log('Server file created:', fs.existsSync('dist/index.js') ? 'Yes' : 'No');
    
    console.log('Full-stack deployment ready');
    console.log('Start with: npm start');
    
  } else {
    console.error('Build verification failed:');
    console.log('Frontend ready:', hasIndexHtml);
    console.log('Backend ready:', hasServerJs);
    
    if (fs.existsSync('dist')) {
      console.log('Dist contents:', fs.readdirSync('dist'));
    }
  }

} catch (error) {
  console.error('Build failed:', error.message);
  process.exit(1);
}