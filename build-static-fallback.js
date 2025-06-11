#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🚀 Building for static deployment with fallback...');

function copyDirectoryRecursive(src, dest) {
  if (!fs.existsSync(src)) return;
  
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      copyDirectoryRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function buildForStaticDeployment() {
  try {
    // Clean existing build
    if (fs.existsSync('dist')) {
      fs.rmSync('dist', { recursive: true, force: true });
      console.log('✓ Cleaned existing build');
    }

    // Method 1: Try building with static config (outputs directly to dist/)
    console.log('📦 Attempting build with static configuration...');
    try {
      execSync('npx vite build --config vite.config.static.ts --mode production', { 
        stdio: 'inherit',
        env: { ...process.env, NODE_ENV: 'production' },
        timeout: 120000
      });
      
      if (fs.existsSync('dist/index.html')) {
        console.log('✅ Static build successful with direct output');
        return true;
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
      console.log('📦 Building with standard configuration...');
      execSync('npx vite build --mode production', { 
        stdio: 'inherit',
        env: { ...process.env, NODE_ENV: 'production' },
        timeout: 120000
      });
      
      // Check if build created output in dist/public/
      if (fs.existsSync('dist/public')) {
        console.log('🔧 Restructuring build output...');
        
        // Create temporary directory
        const tempDir = 'temp-static-build';
        if (fs.existsSync(tempDir)) {
          fs.rmSync(tempDir, { recursive: true, force: true });
        }
        
        // Copy public contents to temp
        copyDirectoryRecursive('dist/public', tempDir);
        
        // Remove dist and replace with temp contents
        fs.rmSync('dist', { recursive: true, force: true });
        fs.mkdirSync('dist');
        copyDirectoryRecursive(tempDir, 'dist');
        
        // Clean up temp directory
        fs.rmSync(tempDir, { recursive: true, force: true });
        
        console.log('✓ Files moved to correct location');
        
        if (fs.existsSync('dist/index.html')) {
          console.log('✅ Restructuring successful');
          return true;
        } else {
          throw new Error('Restructuring failed - index.html not found');
        }
      } else {
        throw new Error('No build output found in either dist/ or dist/public/');
      }
    }
  } catch (error) {
    console.error('❌ Build failed:', error.message);
    return false;
  }
}

// Main execution
if (buildForStaticDeployment()) {
  console.log('✅ Static deployment ready!');
  
  // Verify and display final structure
  if (fs.existsSync('dist')) {
    const contents = fs.readdirSync('dist');
    console.log(`✓ Build contains: ${contents.join(', ')}`);
    
    // Check for essential files
    if (contents.includes('index.html')) {
      console.log('✓ index.html found');
    }
    if (contents.some(file => file.startsWith('assets'))) {
      console.log('✓ Static assets found');
    }
    
    console.log('🎉 Ready for static hosting!');
  }
} else {
  console.error('❌ Static deployment preparation failed');
  process.exit(1);
}