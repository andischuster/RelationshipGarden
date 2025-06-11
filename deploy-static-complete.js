#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('Building for static deployment...');

try {
  // Clean existing build
  if (fs.existsSync('dist')) {
    fs.rmSync('dist', { recursive: true, force: true });
    console.log('Cleaned existing build directory');
  }

  // Method 1: Try building with static config (outputs directly to dist/)
  console.log('Attempting build with static configuration...');
  try {
    execSync('npx vite build --config vite.config.static.ts --mode production', { 
      stdio: 'inherit',
      env: { ...process.env, NODE_ENV: 'production' },
      timeout: 120000
    });
    
    if (fs.existsSync('dist/index.html')) {
      console.log('Static build successful with direct output');
    } else {
      throw new Error('Build completed but index.html not found');
    }
  } catch (error) {
    console.log('Static config build failed, trying standard build with restructuring...');
    
    // Clean up any partial build
    if (fs.existsSync('dist')) {
      fs.rmSync('dist', { recursive: true, force: true });
    }
    
    // Method 2: Use standard build and restructure
    console.log('Building with standard configuration...');
    execSync('npx vite build --mode production', { 
      stdio: 'inherit',
      env: { ...process.env, NODE_ENV: 'production' },
      timeout: 120000
    });
    
    // Restructure the output
    if (fs.existsSync('dist/public')) {
      console.log('Restructuring build output...');
      
      // Create temporary directory
      const tempDir = 'temp-static-build';
      if (fs.existsSync(tempDir)) {
        fs.rmSync(tempDir, { recursive: true, force: true });
      }
      
      // Move public contents to temp
      fs.renameSync('dist/public', tempDir);
      
      // Remove dist and recreate
      fs.rmSync('dist', { recursive: true, force: true });
      
      // Move temp contents to dist
      fs.renameSync(tempDir, 'dist');
      
      console.log('Build output restructured successfully');
    }
  }

  // Remove any server files that shouldn't be in static deployment
  const filesToRemove = ['index.js', 'index.js.map', 'server.js'];
  filesToRemove.forEach(file => {
    const filePath = path.join('dist', file);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`Removed server file: ${file}`);
    }
  });

  // Verify deployment structure
  if (!fs.existsSync('dist/index.html')) {
    throw new Error('index.html not found in dist/ directory');
  }

  // Final verification and reporting
  const distContents = fs.readdirSync('dist');
  console.log('Static deployment ready!');
  console.log(`Build contains: ${distContents.join(', ')}`);
  
  // Check for essential files
  const hasCSS = distContents.some(item => item.endsWith('.css') || item.includes('assets'));
  const hasJS = distContents.some(item => item.endsWith('.js') || item.includes('assets'));
  
  if (hasCSS && hasJS) {
    console.log('All essential assets detected');
  } else {
    console.log('Warning: Some assets may be missing, but deployment structure is correct');
  }

  console.log('Deployment verification complete - ready for static hosting');

} catch (error) {
  console.error('Static build failed:', error.message);
  
  // Provide detailed debugging info
  console.log('Debugging information:');
  if (fs.existsSync('dist')) {
    console.log('Current dist/ structure:');
    const walkDir = (dir, prefix = '') => {
      const items = fs.readdirSync(dir);
      items.forEach(item => {
        const fullPath = path.join(dir, item);
        const stats = fs.statSync(fullPath);
        console.log(`${prefix}${stats.isDirectory() ? '📁' : '📄'} ${item}`);
        if (stats.isDirectory() && prefix.length < 8) { // Prevent deep recursion
          walkDir(fullPath, prefix + '  ');
        }
      });
    };
    walkDir('dist');
  } else {
    console.log('dist/ directory does not exist');
  }
  
  process.exit(1);
}