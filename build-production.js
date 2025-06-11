#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

function restructureForDeployment() {
  console.log('Restructuring build for static deployment...');
  
  if (fs.existsSync('dist/public')) {
    // Move all files from dist/public to dist/
    const publicFiles = fs.readdirSync('dist/public');
    publicFiles.forEach(file => {
      const sourcePath = path.join('dist/public', file);
      const destPath = path.join('dist', file);
      
      if (fs.existsSync(destPath)) {
        fs.rmSync(destPath, { recursive: true, force: true });
      }
      
      fs.renameSync(sourcePath, destPath);
    });
    
    // Remove empty public directory
    fs.rmSync('dist/public', { recursive: true, force: true });
    console.log('Build restructured: moved files from dist/public/ to dist/');
  }
}

function verifyDeploymentStructure() {
  if (!fs.existsSync('dist/index.html')) {
    throw new Error('index.html not found in dist/ directory');
  }
  
  // Remove server files that shouldn't be in static deployment
  const serverFiles = ['index.js', 'index.js.map', 'server.js'];
  serverFiles.forEach(file => {
    const filePath = path.join('dist', file);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`Removed server file: ${file}`);
    }
  });
  
  function findHtmlFiles(dir, prefix = '') {
    const files = fs.readdirSync(dir);
    const htmlFiles = files.filter(f => f.endsWith('.html'));
    if (htmlFiles.length > 0) {
      console.log(`HTML files in ${prefix || 'root'}: ${htmlFiles.join(', ')}`);
    }
    
    files.forEach(file => {
      const fullPath = path.join(dir, file);
      if (fs.statSync(fullPath).isDirectory() && file !== 'node_modules') {
        findHtmlFiles(fullPath, `${prefix}${file}/`);
      }
    });
  }
  
  console.log('Final deployment structure:');
  findHtmlFiles('dist');
  
  const distFiles = fs.readdirSync('dist');
  console.log(`Files in dist/: ${distFiles.join(', ')}`);
}

async function buildProduction() {
  console.log('Building for production deployment...');
  
  // Clean existing build
  if (fs.existsSync('dist')) {
    fs.rmSync('dist', { recursive: true, force: true });
    console.log('Cleaned existing build');
  }
  
  try {
    // Build with default Vite config (outputs to dist/public/)
    console.log('Running Vite build...');
    execSync('NODE_ENV=production npx vite build --mode production', {
      stdio: 'inherit',
      timeout: 300000 // 5 minutes
    });
    
    console.log('Build completed, restructuring for deployment...');
    restructureForDeployment();
    verifyDeploymentStructure();
    
    console.log('Production build ready for static deployment!');
    console.log('Set deployment public directory to: dist');
    
  } catch (error) {
    console.error('Production build failed:', error.message);
    process.exit(1);
  }
}

buildProduction();