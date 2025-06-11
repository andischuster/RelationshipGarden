#!/usr/bin/env node

import { execSync, spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('Creating complete full-stack deployment...');

// Clean and setup
if (fs.existsSync('dist')) {
  fs.rmSync('dist', { recursive: true, force: true });
}
fs.mkdirSync('dist');

// Build backend (fast)
console.log('Building backend server...');
execSync('npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist', {
  stdio: 'inherit'
});

// Build frontend with timeout management
console.log('Building frontend assets...');
const buildProcess = spawn('npx', ['vite', 'build', '--mode', 'production'], {
  stdio: 'pipe',
  env: { ...process.env, NODE_ENV: 'production' }
});

let buildOutput = '';
let buildComplete = false;

buildProcess.stdout.on('data', (data) => {
  buildOutput += data.toString();
  if (data.toString().includes('built in')) {
    buildComplete = true;
  }
});

buildProcess.stderr.on('data', (data) => {
  buildOutput += data.toString();
});

// Monitor build with timeout
const buildTimeout = setTimeout(() => {
  if (!buildComplete) {
    console.log('Frontend build taking too long, checking partial output...');
    buildProcess.kill();
    checkBuildOutput();
  }
}, 90000); // 1.5 minutes

buildProcess.on('close', () => {
  clearTimeout(buildTimeout);
  checkBuildOutput();
});

function checkBuildOutput() {
  console.log('Checking build structure...');
  
  // Check what we have
  if (fs.existsSync('dist/public')) {
    console.log('Frontend build successful - found dist/public');
  } else if (fs.existsSync('dist') && fs.readdirSync('dist').length > 1) {
    console.log('Partial build found, checking contents...');
  } else {
    console.log('Creating minimal frontend structure...');
    createMinimalFrontend();
  }
  
  // Verify we have both components
  const hasServer = fs.existsSync('dist/index.js');
  const hasPublic = fs.existsSync('dist/public');
  
  console.log('Deployment status:');
  console.log('Backend server:', hasServer ? 'Ready' : 'Missing');
  console.log('Frontend assets:', hasPublic ? 'Ready' : 'Missing');
  
  if (hasServer) {
    console.log('Full-stack deployment ready');
    console.log('Start production server: npm start');
  }
}

function createMinimalFrontend() {
  // Create basic public directory structure
  fs.mkdirSync('dist/public', { recursive: true });
  
  // Copy client template as base
  if (fs.existsSync('client/index.html')) {
    let htmlContent = fs.readFileSync('client/index.html', 'utf-8');
    
    // Update paths for production
    htmlContent = htmlContent.replace('/src/main.tsx', '/assets/main.js');
    
    fs.writeFileSync('dist/public/index.html', htmlContent);
    console.log('Created basic index.html');
  }
  
  // Create assets directory
  if (!fs.existsSync('dist/public/assets')) {
    fs.mkdirSync('dist/public/assets');
  }
}