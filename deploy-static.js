#!/usr/bin/env node

import { execSync } from 'child_process';
import { copyFileSync, mkdirSync, existsSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function processStaticBuild() {
  console.log('Building static frontend...');
  
  // Build using the static config
  execSync('npx vite build --config vite.config.static.ts', { stdio: 'inherit' });
  
  console.log('Static build completed successfully!');
  
  // Verify the output
  const distPath = join(__dirname, 'dist');
  if (existsSync(join(distPath, 'index.html'))) {
    console.log('✓ index.html found in dist/');
  } else {
    console.error('✗ index.html not found in dist/');
  }
  
  // List contents of dist directory
  if (existsSync(distPath)) {
    console.log('Contents of dist/:');
    const files = readdirSync(distPath);
    files.forEach(file => {
      const filePath = join(distPath, file);
      const stats = statSync(filePath);
      console.log(`  ${stats.isDirectory() ? 'd' : '-'} ${file}`);
    });
  }
}

processStaticBuild();