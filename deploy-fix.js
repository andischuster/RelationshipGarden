#!/usr/bin/env node

import { execSync } from 'child_process';
import { existsSync, readdirSync, statSync, copyFileSync, mkdirSync, rmSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🔧 Fixing deployment structure...');

const distPath = join(__dirname, 'dist');
const publicPath = join(distPath, 'public');

// Check current structure
if (existsSync(publicPath)) {
  console.log('📁 Found files in dist/public/, moving to dist/...');
  
  // Move all files from public to dist root
  const files = readdirSync(publicPath);
  
  files.forEach(file => {
    const src = join(publicPath, file);
    const dest = join(distPath, file);
    
    if (statSync(src).isDirectory()) {
      // Copy directory recursively
      if (existsSync(dest)) {
        rmSync(dest, { recursive: true });
      }
      copyDirectory(src, dest);
    } else {
      // Copy file
      copyFileSync(src, dest);
    }
    
    console.log(`✓ Moved ${file}`);
  });
  
  // Remove the public directory
  rmSync(publicPath, { recursive: true });
  console.log('✓ Removed dist/public/ directory');
}

// Verify the structure
if (existsSync(join(distPath, 'index.html'))) {
  console.log('✅ Static deployment structure is ready!');
  console.log('\nFinal structure:');
  listDirectory(distPath, '');
} else {
  console.error('❌ index.html not found in dist/');
  process.exit(1);
}

function copyDirectory(src, dest) {
  mkdirSync(dest, { recursive: true });
  
  const files = readdirSync(src);
  files.forEach(file => {
    const srcPath = join(src, file);
    const destPath = join(dest, file);
    
    if (statSync(srcPath).isDirectory()) {
      copyDirectory(srcPath, destPath);
    } else {
      copyFileSync(srcPath, destPath);
    }
  });
}

function listDirectory(dir, indent) {
  const files = readdirSync(dir);
  files.forEach(file => {
    const filePath = join(dir, file);
    const stats = statSync(filePath);
    const type = stats.isDirectory() ? 'd' : '-';
    console.log(`${indent}${type} ${file}`);
    
    if (stats.isDirectory() && indent.length < 4) { // Limit depth
      listDirectory(filePath, indent + '  ');
    }
  });
}