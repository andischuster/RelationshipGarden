#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🚀 Building for static deployment...');

try {
  // Clean existing build
  if (fs.existsSync('dist')) {
    fs.rmSync('dist', { recursive: true, force: true });
    console.log('✓ Cleaned existing build directory');
  }

  // Set production environment
  process.env.NODE_ENV = 'production';

  // Build the client with Vite
  console.log('📦 Building client files...');
  try {
    execSync('npx vite build --mode production', { 
      stdio: 'inherit',
      env: { ...process.env, NODE_ENV: 'production' },
      timeout: 180000 // 3 minutes timeout
    });
    console.log('✓ Vite build completed');
  } catch (error) {
    console.log('⚠️  Build process finished with warnings, checking output...');
  }

  // Handle the output restructuring
  if (fs.existsSync('dist/public')) {
    console.log('🔧 Restructuring output for static deployment...');
    
    // Get all items in dist/public
    const publicItems = fs.readdirSync('dist/public');
    
    // Move each item from dist/public to dist
    publicItems.forEach(item => {
      const sourcePath = path.join('dist/public', item);
      const destPath = path.join('dist', item);
      
      try {
        if (fs.statSync(sourcePath).isDirectory()) {
          // For directories, use recursive copy
          fs.cpSync(sourcePath, destPath, { recursive: true });
        } else {
          // For files, use simple copy
          fs.copyFileSync(sourcePath, destPath);
        }
      } catch (err) {
        console.warn(`Warning: Could not move ${item}:`, err.message);
      }
    });
    
    // Remove the now-empty public directory
    try {
      fs.rmSync('dist/public', { recursive: true, force: true });
      console.log('✓ Removed nested public directory');
    } catch (err) {
      console.warn('Warning: Could not remove public directory:', err.message);
    }
  }

  // Clean up any server-side files that shouldn't be in static deployment
  const serverFiles = ['index.js', 'index.js.map'];
  serverFiles.forEach(file => {
    const filePath = path.join('dist', file);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`✓ Removed server file: ${file}`);
    }
  });

  // Verify the deployment structure
  if (fs.existsSync('dist/index.html')) {
    console.log('✅ Static deployment ready!');
    console.log('✓ index.html found in dist/');
    
    // Show the final structure
    const contents = fs.readdirSync('dist');
    console.log(`📁 Build contains: ${contents.join(', ')}`);
    
    // Additional verification
    const stats = fs.statSync('dist/index.html');
    console.log(`📄 index.html size: ${Math.round(stats.size / 1024)}KB`);
    
    // Check for essential assets
    const hasAssets = contents.some(item => item.includes('assets') || item.includes('.css') || item.includes('.js'));
    if (hasAssets) {
      console.log('✓ Static assets found');
    } else {
      console.log('⚠️  No static assets detected - this may be expected for some builds');
    }
    
  } else {
    throw new Error('❌ index.html not found in dist/ directory after restructuring');
  }

  console.log('\n🎉 Static build completed successfully!');
  console.log('📋 Next steps:');
  console.log('   1. Your app is ready for static deployment');
  console.log('   2. The dist/ directory contains all necessary files');
  console.log('   3. index.html is correctly positioned in the root of dist/');

} catch (error) {
  console.error('❌ Static build failed:', error.message);
  
  // Provide debugging information
  console.log('\n🔍 Debugging information:');
  if (fs.existsSync('dist')) {
    console.log('📁 Current dist/ contents:');
    try {
      const contents = fs.readdirSync('dist');
      contents.forEach(item => {
        const itemPath = path.join('dist', item);
        const stats = fs.statSync(itemPath);
        const type = stats.isDirectory() ? 'dir' : 'file';
        console.log(`   ${type}: ${item}`);
      });
    } catch (err) {
      console.log('   Could not read dist/ directory');
    }
  } else {
    console.log('   dist/ directory does not exist');
  }
  
  process.exit(1);
}