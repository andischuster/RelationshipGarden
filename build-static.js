#!/usr/bin/env node

import { execSync } from 'child_process';
import { copyFileSync, mkdirSync, existsSync, readdirSync, statSync, rmSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function buildForStaticDeployment() {
  console.log('Building for static deployment...');
  
  // Clean existing dist directory
  const distPath = join(__dirname, 'dist');
  if (existsSync(distPath)) {
    rmSync(distPath, { recursive: true, force: true });
  }
  
  // Build with default configuration
  execSync('npm run build', { stdio: 'inherit' });
  
  // Check if files are in dist/public/
  const publicPath = join(distPath, 'public');
  if (existsSync(publicPath)) {
    console.log('Moving files from dist/public/ to dist/...');
    
    // Move all files from dist/public/ to dist/
    const files = readdirSync(publicPath);
    files.forEach(file => {
      const sourcePath = join(publicPath, file);
      const targetPath = join(distPath, file);
      
      const stats = statSync(sourcePath);
      if (stats.isDirectory()) {
        copyDirectoryRecursive(sourcePath, targetPath);
      } else {
        copyFileSync(sourcePath, targetPath);
      }
    });
    
    // Remove the public directory
    rmSync(publicPath, { recursive: true, force: true });
  }
  
  // Verify final structure
  if (existsSync(join(distPath, 'index.html'))) {
    console.log('✓ Static deployment structure ready!');
    console.log('Files in dist/:');
    readdirSync(distPath).forEach(file => {
      const stats = statSync(join(distPath, file));
      console.log(`  ${stats.isDirectory() ? 'd' : '-'} ${file}`);
    });
  } else {
    console.error('✗ Build failed - index.html not found');
    process.exit(1);
  }
}

function copyDirectoryRecursive(src, dest) {
  if (!existsSync(dest)) {
    mkdirSync(dest, { recursive: true });
  }
  
  const files = readdirSync(src);
  files.forEach(file => {
    const srcPath = join(src, file);
    const destPath = join(dest, file);
    const stats = statSync(srcPath);
    
    if (stats.isDirectory()) {
      copyDirectoryRecursive(srcPath, destPath);
    } else {
      copyFileSync(srcPath, destPath);
    }
  });
}

buildForStaticDeployment();