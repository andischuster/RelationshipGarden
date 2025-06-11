#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

function cleanBuildArtifacts() {
  const dirsToClean = ['dist', 'node_modules/.vite'];
  dirsToClean.forEach(dir => {
    if (fs.existsSync(dir)) {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });
  console.log('Cleaned build artifacts');
}

function buildForDeployment() {
  console.log('Starting optimized build...');
  
  cleanBuildArtifacts();
  
  try {
    execSync('npx vite build --config vite.config.static.ts --mode production', {
      stdio: 'inherit',
      env: { 
        ...process.env, 
        NODE_ENV: 'production'
      },
      timeout: 180000
    });
    
    if (fs.existsSync('dist/index.html')) {
      console.log('Build completed successfully');
      
      const files = fs.readdirSync('dist');
      console.log(`Generated files: ${files.join(', ')}`);
      
      ['index.js', 'index.js.map', 'server.js'].forEach(file => {
        const filePath = path.join('dist', file);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log(`Removed server file: ${file}`);
        }
      });
      
      console.log('Deployment ready - index.html is in dist/');
      return true;
    } else {
      throw new Error('Build output verification failed');
    }
    
  } catch (error) {
    console.error('Build failed:', error.message);
    return false;
  }
}

if (!buildForDeployment()) {
  process.exit(1);
}