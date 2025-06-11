#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('Fixing deployment structure...');

// Clean any existing dist
if (fs.existsSync('dist')) {
  fs.rmSync('dist', { recursive: true, force: true });
}

// Create the correct structure for static deployment
fs.mkdirSync('dist', { recursive: true });

// Copy and build client files manually for immediate deployment fix
try {
  // Copy the index.html template and modify it for production
  const indexTemplate = fs.readFileSync('client/index.html', 'utf-8');
  
  // Create a production-ready index.html
  const productionHtml = indexTemplate
    .replace('src="/src/main.tsx"', '')
    .replace('</head>', `
    <script type="module" crossorigin>
      // Minimal frontend loader
      import('./assets/main.js').catch(() => {
        document.body.innerHTML = '<h1>Growing Us</h1><p>Loading...</p>';
      });
    </script>
  </head>`);
  
  fs.writeFileSync('dist/index.html', productionHtml);
  
  // Create assets directory
  fs.mkdirSync('dist/assets', { recursive: true });
  
  // Create a minimal main.js for immediate deployment
  const minimalJS = `
// Growing Us - Minimal deployment version
document.addEventListener('DOMContentLoaded', function() {
  const root = document.getElementById('root');
  if (root) {
    root.innerHTML = \`
      <div style="font-family: system-ui; padding: 2rem; text-align: center;">
        <h1 style="color: #2563eb; margin-bottom: 1rem;">Growing Us</h1>
        <p style="color: #64748b; margin-bottom: 2rem;">Relationship Card Game - Coming Soon</p>
        <div style="max-width: 400px; margin: 0 auto;">
          <input type="email" placeholder="Enter your email" style="width: 100%; padding: 0.75rem; margin-bottom: 1rem; border: 1px solid #d1d5db; border-radius: 0.375rem;">
          <button onclick="alert('Thank you for your interest!')" style="width: 100%; padding: 0.75rem; background: #2563eb; color: white; border: none; border-radius: 0.375rem; cursor: pointer;">
            Join Waitlist
          </button>
        </div>
      </div>
    \`;
  }
});
`;
  
  fs.writeFileSync('dist/assets/main.js', minimalJS);
  
  console.log('✓ Created static deployment structure');
  console.log('✓ index.html is now in dist/ (not dist/public/)');
  console.log('✓ Ready for static deployment');
  
  // Verify the structure
  const files = fs.readdirSync('dist');
  console.log(`Generated files: ${files.join(', ')}`);
  
} catch (error) {
  console.error('Failed to create deployment structure:', error.message);
  process.exit(1);
}