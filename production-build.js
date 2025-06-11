#!/usr/bin/env node

import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('Starting production build for static deployment...');

// Clean existing build
if (fs.existsSync('dist')) {
  fs.rmSync('dist', { recursive: true, force: true });
  console.log('Cleaned existing build directory');
}

// Start the Vite build process
const buildProcess = spawn('npx', ['vite', 'build'], {
  stdio: 'pipe',
  env: { ...process.env, NODE_ENV: 'production' }
});

let buildOutput = '';
let buildComplete = false;

buildProcess.stdout.on('data', (data) => {
  const output = data.toString();
  buildOutput += output;
  
  // Check for completion indicators
  if (output.includes('built in') || output.includes('✓ built')) {
    buildComplete = true;
    console.log('Build completed successfully');
  }
  
  // Show progress for large builds
  if (output.includes('transforming')) {
    process.stdout.write('.');
  }
});

buildProcess.stderr.on('data', (data) => {
  buildOutput += data.toString();
});

// Monitor build progress and handle completion
buildProcess.on('close', (code) => {
  console.log('\nProcessing build output...');
  restructureForDeployment();
});

// Also set a reasonable timeout
setTimeout(() => {
  if (!buildComplete && buildProcess.pid) {
    console.log('\nBuild taking longer than expected, checking current output...');
    buildProcess.kill('SIGTERM');
    setTimeout(() => restructureForDeployment(), 1000);
  }
}, 150000); // 2.5 minutes

function restructureForDeployment() {
  try {
    console.log('Checking build structure...');
    
    if (fs.existsSync('dist/public')) {
      console.log('Found nested public directory, restructuring...');
      
      // Get all items in dist/public
      const publicItems = fs.readdirSync('dist/public');
      
      // Move each item to dist root
      publicItems.forEach(item => {
        const sourcePath = path.join('dist/public', item);
        const targetPath = path.join('dist', item);
        
        // Remove target if it exists
        if (fs.existsSync(targetPath)) {
          fs.rmSync(targetPath, { recursive: true, force: true });
        }
        
        // Move the item
        fs.renameSync(sourcePath, targetPath);
      });
      
      // Remove empty public directory
      fs.rmSync('dist/public', { recursive: true, force: true });
      console.log('Restructuring completed');
    }
    
    // Remove any server-side files
    const serverFiles = ['index.js', 'index.js.map'];
    serverFiles.forEach(file => {
      const filePath = path.join('dist', file);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`Removed server file: ${file}`);
      }
    });
    
    // Verify the final structure
    verifyDeploymentStructure();
    
  } catch (error) {
    console.error('Error during restructuring:', error.message);
    process.exit(1);
  }
}

function verifyDeploymentStructure() {
  console.log('Verifying deployment structure...');
  
  if (!fs.existsSync('dist')) {
    console.error('No dist directory found');
    process.exit(1);
  }
  
  const distContents = fs.readdirSync('dist');
  console.log('Dist directory contents:', distContents.join(', '));
  
  if (fs.existsSync('dist/index.html')) {
    console.log('Success: index.html found in correct location');
    console.log('Static deployment structure is ready');
    
    // Show file sizes for verification
    const indexStat = fs.statSync('dist/index.html');
    console.log(`index.html size: ${indexStat.size} bytes`);
    
    if (fs.existsSync('dist/assets')) {
      const assetsCount = fs.readdirSync('dist/assets').length;
      console.log(`Assets directory contains ${assetsCount} files`);
    }
    
    console.log('Deploy the dist/ directory for static hosting');
  } else {
    console.error('Warning: index.html not found in dist/');
    
    // Look for HTML files in subdirectories
    function findHtmlFiles(dir, prefix = '') {
      const items = fs.readdirSync(dir);
      items.forEach(item => {
        const fullPath = path.join(dir, item);
        const relativePath = prefix ? path.join(prefix, item) : item;
        
        if (fs.statSync(fullPath).isDirectory()) {
          findHtmlFiles(fullPath, relativePath);
        } else if (item.endsWith('.html')) {
          console.log(`Found HTML file: ${relativePath}`);
        }
      });
    }
    
    findHtmlFiles('dist');
  }
}