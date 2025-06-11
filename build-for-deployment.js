#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

function log(message) {
  console.log(`[BUILD] ${message}`);
}

function cleanDist() {
  if (fs.existsSync('dist')) {
    fs.rmSync('dist', { recursive: true, force: true });
    log('Cleaned existing dist directory');
  }
}

function moveFilesFromPublic() {
  const publicPath = path.join('dist', 'public');
  
  if (fs.existsSync(publicPath)) {
    log('Found files in dist/public, restructuring...');
    
    // Get all files and directories in dist/public
    const items = fs.readdirSync(publicPath);
    
    // Move each item from dist/public to dist
    items.forEach(item => {
      const srcPath = path.join(publicPath, item);
      const destPath = path.join('dist', item);
      
      fs.renameSync(srcPath, destPath);
    });
    
    // Remove empty public directory
    fs.rmSync(publicPath, { recursive: true });
    log('Moved files from dist/public to dist/');
  }
}

function verifyBuild() {
  if (!fs.existsSync('dist/index.html')) {
    throw new Error('index.html not found in dist/ directory');
  }
  
  const files = fs.readdirSync('dist');
  log(`Build verified: ${files.join(', ')}`);
  
  return true;
}

async function buildStatic() {
  log('Starting static deployment build...');
  
  try {
    cleanDist();
    
    // First try with static config
    log('Building with static configuration...');
    try {
      execSync('npx vite build --config vite.config.static.ts --mode production', {
        stdio: 'pipe',
        timeout: 180000 // 3 minutes
      });
      
      if (verifyBuild()) {
        log('Static build completed successfully');
        return true;
      }
    } catch (error) {
      log('Static config failed, trying fallback...');
      cleanDist();
    }
    
    // Fallback: use default config and restructure
    log('Building with default configuration...');
    execSync('npx vite build --mode production', {
      stdio: 'pipe',
      timeout: 180000
    });
    
    moveFilesFromPublic();
    
    if (verifyBuild()) {
      log('Fallback build completed successfully');
      return true;
    }
    
  } catch (error) {
    log(`Build failed: ${error.message}`);
    return false;
  }
}

// Execute build
if (await buildStatic()) {
  log('✅ Deployment build ready!');
  log('The dist/ directory is properly structured for static deployment');
} else {
  log('❌ Build failed');
  process.exit(1);
}