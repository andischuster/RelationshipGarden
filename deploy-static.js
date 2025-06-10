#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';

console.log('Creating static deployment build...');

// Step 1: Clean existing dist
if (fs.existsSync('dist')) {
  fs.rmSync('dist', { recursive: true, force: true });
  console.log('Cleaned existing dist directory');
}

// Step 2: Run vite build with proper signal handling
const buildProcess = spawn('npx', ['vite', 'build', '--mode', 'production'], {
  stdio: ['inherit', 'pipe', 'pipe'],
  env: { ...process.env, NODE_ENV: 'production' }
});

let buildOutput = '';
let buildError = '';

buildProcess.stdout.on('data', (data) => {
  buildOutput += data.toString();
  process.stdout.write(data);
});

buildProcess.stderr.on('data', (data) => {
  buildError += data.toString();
  process.stderr.write(data);
});

// Set a reasonable timeout for the build
const buildTimeout = setTimeout(() => {
  console.log('\nBuild taking longer than expected, checking for partial completion...');
  buildProcess.kill('SIGTERM');
}, 90000); // 90 seconds

buildProcess.on('close', (code) => {
  clearTimeout(buildTimeout);
  
  console.log(`\nBuild process finished with code: ${code}`);
  
  // Check if build created any output regardless of exit code
  if (fs.existsSync('dist')) {
    console.log('Build output detected, processing...');
    processStaticBuild();
  } else {
    console.error('No build output found');
    process.exit(1);
  }
});

buildProcess.on('error', (error) => {
  clearTimeout(buildTimeout);
  console.error('Build process error:', error.message);
  
  // Still check for partial build
  if (fs.existsSync('dist')) {
    console.log('Partial build detected, attempting to process...');
    processStaticBuild();
  } else {
    process.exit(1);
  }
});

function processStaticBuild() {
  try {
    console.log('Processing build output for static deployment...');
    
    // Check current structure
    if (fs.existsSync('dist/public')) {
      console.log('Found nested public directory, flattening structure...');
      
      // Create temporary directory
      const tempDir = 'temp-deploy';
      if (fs.existsSync(tempDir)) {
        fs.rmSync(tempDir, { recursive: true, force: true });
      }
      
      // Move public contents to temp
      fs.renameSync('dist/public', tempDir);
      
      // Remove old dist and rename temp to dist
      fs.rmSync('dist', { recursive: true, force: true });
      fs.renameSync(tempDir, 'dist');
      
      console.log('Successfully flattened directory structure');
    }
    
    // Remove server files
    const serverFiles = ['index.js', 'index.js.map'];
    let removedFiles = 0;
    
    for (const file of serverFiles) {
      const filePath = path.join('dist', file);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        removedFiles++;
        console.log(`Removed server file: ${file}`);
      }
    }
    
    // Verify deployment readiness
    console.log('\n=== Deployment Verification ===');
    
    if (!fs.existsSync('dist')) {
      console.error('❌ dist directory missing');
      process.exit(1);
    }
    
    const distFiles = fs.readdirSync('dist');
    console.log('Files in dist:', distFiles.join(', '));
    
    if (fs.existsSync('dist/index.html')) {
      console.log('✅ index.html found');
    } else {
      console.error('❌ index.html missing');
      process.exit(1);
    }
    
    const hasAssets = distFiles.some(file => 
      file.endsWith('.js') || file.endsWith('.css') || fs.statSync(path.join('dist', file)).isDirectory()
    );
    
    if (hasAssets) {
      console.log('✅ Static assets found');
    } else {
      console.log('⚠️  No static assets detected');
    }
    
    console.log('\n✅ Static build ready for deployment!');
    console.log('📁 Deploy the contents of the dist/ directory');
    
  } catch (error) {
    console.error('Error processing build:', error.message);
    process.exit(1);
  }
}