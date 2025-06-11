#!/usr/bin/env node

import { execSync } from 'child_process';
import { copyFileSync, mkdirSync, existsSync, readdirSync, statSync, rmSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function fixStaticDeployment() {
  console.log('Running default build...');
  
  // Run the default build which creates dist/public/
  execSync('npm run build', { stdio: 'inherit' });
  
  const publicPath = join(__dirname, 'dist', 'public');
  const distPath = join(__dirname, 'dist');
  
  if (existsSync(publicPath)) {
    console.log('Moving files from dist/public/ to dist/...');
    
    // Get all files from dist/public/
    const files = readdirSync(publicPath);
    
    files.forEach(file => {
      const sourcePath = join(publicPath, file);
      const targetPath = join(distPath, file);
      
      const stats = statSync(sourcePath);
      if (stats.isDirectory()) {
        // Copy directory recursively
        copyDirectorySync(sourcePath, targetPath);
      } else {
        // Copy file
        copyFileSync(sourcePath, targetPath);
      }
      console.log(`Moved: ${file}`);
    });
    
    // Remove the public directory
    rmSync(publicPath, { recursive: true, force: true });
    console.log('Removed dist/public/ directory');
  }
  
  // Verify the final structure
  console.log('\nFinal dist/ contents:');
  if (existsSync(distPath)) {
    const files = readdirSync(distPath);
    files.forEach(file => {
      const filePath = join(distPath, file);
      const stats = statSync(filePath);
      console.log(`  ${stats.isDirectory() ? 'd' : '-'} ${file}`);
    });
  }
  
  if (existsSync(join(distPath, 'index.html'))) {
    console.log('\n✓ Static deployment structure is ready!');
  } else {
    console.error('\n✗ index.html still not found in dist/');
  }
}

function copyDirectorySync(src, dest) {
  if (!existsSync(dest)) {
    mkdirSync(dest, { recursive: true });
  }
  
  const files = readdirSync(src);
  files.forEach(file => {
    const srcPath = join(src, file);
    const destPath = join(dest, file);
    const stats = statSync(srcPath);
    
    if (stats.isDirectory()) {
      copyDirectorySync(srcPath, destPath);
    } else {
      copyFileSync(srcPath, destPath);
    }
  });
}

fixStaticDeployment();