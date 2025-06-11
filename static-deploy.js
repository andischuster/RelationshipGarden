#!/usr/bin/env node

import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('Preparing static deployment build...');

// Clean existing build
if (fs.existsSync('dist')) {
  fs.rmSync('dist', { recursive: true, force: true });
}

// Build with proper process management
const buildProcess = spawn('npx', ['vite', 'build', '--mode', 'production'], {
  stdio: ['ignore', 'pipe', 'pipe'],
  env: { ...process.env, NODE_ENV: 'production' },
  detached: false
});

let buildComplete = false;
let buildOutput = '';

// Handle build output
buildProcess.stdout.on('data', (data) => {
  buildOutput += data.toString();
  if (data.toString().includes('built in')) {
    buildComplete = true;
  }
});

buildProcess.stderr.on('data', (data) => {
  buildOutput += data.toString();
});

// Set timeout for build process
const buildTimeout = setTimeout(() => {
  if (!buildComplete) {
    console.log('Build taking longer than expected, checking partial output...');
    buildProcess.kill('SIGTERM');
    checkAndFixStructure();
  }
}, 120000); // 2 minutes

buildProcess.on('close', (code) => {
  clearTimeout(buildTimeout);
  console.log('Build process completed');
  checkAndFixStructure();
});

function checkAndFixStructure() {
  try {
    console.log('Checking build output structure...');
    
    if (fs.existsSync('dist/public')) {
      console.log('Found nested structure, fixing for deployment...');
      
      // Move files from dist/public to dist
      const publicPath = path.join('dist', 'public');
      const files = fs.readdirSync(publicPath);
      
      files.forEach(file => {
        const srcPath = path.join(publicPath, file);
        const destPath = path.join('dist', file);
        
        if (fs.statSync(srcPath).isDirectory()) {
          fs.cpSync(srcPath, destPath, { recursive: true });
        } else {
          fs.copyFileSync(srcPath, destPath);
        }
      });
      
      // Remove the public directory
      fs.rmSync(publicPath, { recursive: true, force: true });
      console.log('Structure fixed');
    }
    
    // Remove server files
    const serverFiles = ['index.js', 'index.js.map'];
    serverFiles.forEach(file => {
      const filePath = path.join('dist', file);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    });
    
    // Verify final structure
    if (fs.existsSync('dist/index.html')) {
      console.log('Static deployment ready');
      console.log('Files in dist:', fs.readdirSync('dist').join(', '));
      process.exit(0);
    } else {
      console.error('index.html not found in final structure');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('Error processing build:', error.message);
    process.exit(1);
  }
}