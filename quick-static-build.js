#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';

console.log('Building for static deployment...');

// Clean existing build
if (fs.existsSync('dist')) {
  fs.rmSync('dist', { recursive: true, force: true });
}

try {
  // Use the static config with a shorter timeout
  execSync('timeout 300 npx vite build --config vite.config.static.ts --mode production', { 
    stdio: 'inherit',
    shell: true
  });
  
  // Check if build succeeded
  if (fs.existsSync('dist/index.html')) {
    console.log('Static build successful!');
    const files = fs.readdirSync('dist');
    console.log('Files in dist:', files.join(', '));
  } else {
    console.log('Build may have failed - no index.html found');
  }
} catch (error) {
  console.log('Build process interrupted or failed');
  console.log('Checking for any partial output...');
  
  if (fs.existsSync('dist')) {
    const files = fs.readdirSync('dist');
    console.log('Partial build contents:', files.join(', '));
  }
}