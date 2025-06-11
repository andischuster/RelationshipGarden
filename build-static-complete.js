#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('Building complete static deployment with Google Sheets integration...');

// Clean existing build
if (fs.existsSync('dist')) {
  fs.rmSync('dist', { recursive: true, force: true });
  console.log('Cleaned existing build directory');
}

try {
  // Build with static configuration
  console.log('Building frontend with static configuration...');
  execSync('npx vite build --config vite.config.static.ts --mode production', {
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'production' }
  });

  // Verify build output
  if (fs.existsSync('dist/index.html')) {
    console.log('Build successful!');
    
    // List all generated files
    const listFiles = (dir, prefix = '') => {
      const items = fs.readdirSync(dir);
      items.forEach(item => {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
          console.log(`${prefix}📁 ${item}/`);
          listFiles(fullPath, prefix + '  ');
        } else {
          const size = (stat.size / 1024).toFixed(1);
          console.log(`${prefix}📄 ${item} (${size}KB)`);
        }
      });
    };
    
    console.log('\nGenerated files:');
    listFiles('dist');
    
    // Create deployment info
    const deploymentInfo = {
      buildDate: new Date().toISOString(),
      deploymentType: 'static',
      features: {
        googleSheetsIntegration: true,
        emailCollection: true,
        adminPanel: true,
        staticHosting: true
      },
      environmentVariables: {
        required: [
          'VITE_GOOGLE_FORM_URL (for Google Forms integration)',
          'VITE_GOOGLE_FORM_EMAIL_FIELD (for Google Forms integration)',
          'OR',
          'VITE_GOOGLE_SHEET_ID (for direct Sheets API)',
          'VITE_GOOGLE_SHEETS_API_KEY (for direct Sheets API)'
        ]
      }
    };
    
    fs.writeFileSync('dist/deployment-info.json', JSON.stringify(deploymentInfo, null, 2));
    console.log('\nDeployment info saved to dist/deployment-info.json');
    
    console.log('\n✅ Static deployment ready!');
    console.log('📋 Next steps:');
    console.log('1. Set up Google Sheets integration (see GOOGLE-SHEETS-SETUP.md)');
    console.log('2. Configure environment variables for your hosting platform');
    console.log('3. Deploy the dist/ directory to your static hosting service');
    console.log('4. Test email collection functionality');
    
  } else {
    throw new Error('Build completed but index.html not found in dist/');
  }

} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}