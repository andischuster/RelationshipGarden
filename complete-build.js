#!/usr/bin/env node

import { execSync } from 'child_process';
import { existsSync, readdirSync, statSync, copyFileSync, mkdirSync, rmSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function checkBuildOutput() {
  const distPath = join(__dirname, 'dist');
  
  if (!existsSync(distPath)) {
    console.error('❌ No dist directory found');
    return false;
  }
  
  // Check if index.html is in the right place
  if (existsSync(join(distPath, 'index.html'))) {
    console.log('✅ index.html found in dist/');
    return true;
  }
  
  // Check if files are in dist/public/
  const publicPath = join(distPath, 'public');
  if (existsSync(publicPath) && existsSync(join(publicPath, 'index.html'))) {
    console.log('📁 Files found in dist/public/, fixing structure...');
    
    // Move files from public to root
    const files = readdirSync(publicPath);
    files.forEach(file => {
      const src = join(publicPath, file);
      const dest = join(distPath, file);
      
      if (statSync(src).isDirectory()) {
        if (existsSync(dest)) rmSync(dest, { recursive: true });
        copyDirectory(src, dest);
      } else {
        copyFileSync(src, dest);
      }
    });
    
    // Remove public directory
    rmSync(publicPath, { recursive: true });
    console.log('✅ Fixed directory structure');
    return true;
  }
  
  console.error('❌ index.html not found in expected locations');
  return false;
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

function createMinimalFrontend() {
  console.log('🔨 Building static frontend only...');
  
  // Clean dist
  const distPath = join(__dirname, 'dist');
  if (existsSync(distPath)) {
    rmSync(distPath, { recursive: true });
  }
  
  // Use static config if available, otherwise default
  const configFile = existsSync('./vite.config.static.ts') ? 
    '--config vite.config.static.ts' : '';
  
  try {
    execSync(`npx vite build ${configFile}`, { stdio: 'inherit' });
    
    if (checkBuildOutput()) {
      console.log('✅ Static deployment ready');
      
      // List final structure
      console.log('\nDeployment structure:');
      const files = readdirSync(distPath);
      files.forEach(file => {
        const stats = statSync(join(distPath, file));
        console.log(`  ${stats.isDirectory() ? 'd' : '-'} ${file}`);
      });
      
      return true;
    }
  } catch (error) {
    console.error('❌ Build failed:', error.message);
    return false;
  }
  
  return false;
}

// Main execution
console.log('🚀 Preparing static deployment...');

if (createMinimalFrontend()) {
  console.log('\n✅ Ready for static deployment!');
  console.log('The dist/ directory contains all files needed for deployment.');
} else {
  console.error('\n❌ Static deployment preparation failed');
  process.exit(1);
}