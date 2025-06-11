#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

function log(message) {
  console.log(`[DEPLOY] ${message}`);
}

function cleanDist() {
  if (fs.existsSync('dist')) {
    fs.rmSync('dist', { recursive: true, force: true });
    log('Cleaned existing dist directory');
  }
}

function verifyStaticBuild() {
  if (!fs.existsSync('dist/index.html')) {
    throw new Error('index.html not found in dist/ directory');
  }
  
  const files = fs.readdirSync('dist');
  log(`Build verified: ${files.join(', ')}`);
  
  // Remove any server files that shouldn't be in static build
  const serverFiles = ['index.js', 'index.js.map', 'server.js'];
  serverFiles.forEach(file => {
    const filePath = path.join('dist', file);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      log(`Removed server file: ${file}`);
    }
  });
  
  return true;
}

function moveFromPublicIfNeeded() {
  if (fs.existsSync('dist/public') && fs.existsSync('dist/public/index.html')) {
    log('Restructuring build output from dist/public/ to dist/');
    
    const publicFiles = fs.readdirSync('dist/public');
    publicFiles.forEach(file => {
      const sourcePath = path.join('dist/public', file);
      const destPath = path.join('dist', file);
      fs.renameSync(sourcePath, destPath);
    });
    
    fs.rmSync('dist/public', { recursive: true });
    log('Restructuring completed');
  }
}

async function buildForDeployment() {
  log('Starting static deployment build...');
  
  try {
    cleanDist();
    
    // First attempt: Use static configuration (preferred)
    log('Building with static configuration...');
    try {
      execSync('npx vite build --config vite.config.static.ts --mode production', {
        stdio: 'inherit',
        env: { ...process.env, NODE_ENV: 'production' },
        timeout: 300000 // 5 minutes
      });
      
      if (verifyStaticBuild()) {
        log('Static build completed successfully');
        return true;
      }
    } catch (error) {
      log('Static config build failed, trying fallback approach...');
      cleanDist();
    }
    
    // Fallback: Use default config and restructure
    log('Building with default configuration and restructuring...');
    execSync('npx vite build --mode production', {
      stdio: 'inherit',
      env: { ...process.env, NODE_ENV: 'production' },
      timeout: 300000
    });
    
    moveFromPublicIfNeeded();
    
    if (verifyStaticBuild()) {
      log('Fallback build completed successfully');
      return true;
    }
    
  } catch (error) {
    log(`Build failed: ${error.message}`);
    return false;
  }
}

// Execute build
const success = await buildForDeployment();

if (success) {
  log('✓ Deployment build ready!');
  log('✓ The dist/ directory contains index.html at root level');
  log('✓ Ready for static deployment');
} else {
  log('✗ Build failed');
  process.exit(1);
}