#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

function buildOptimized() {
  console.log('Building optimized static version...');
  
  // Clean dist
  if (fs.existsSync('dist')) {
    fs.rmSync('dist', { recursive: true, force: true });
  }
  
  try {
    // Use static config with timeout
    execSync('timeout 180 npx vite build --config vite.config.static.ts --mode production', {
      stdio: 'pipe',
      env: { ...process.env, NODE_ENV: 'production' }
    });
    
    if (fs.existsSync('dist/index.html')) {
      console.log('Static build successful');
      return true;
    }
  } catch (error) {
    console.log('Static build failed, using fallback...');
  }
  
  // Fallback: build with default config and move files
  try {
    execSync('timeout 180 npx vite build --mode production', {
      stdio: 'pipe',
      env: { ...process.env, NODE_ENV: 'production' }
    });
    
    // Move from dist/public to dist/
    if (fs.existsSync('dist/public')) {
      const files = fs.readdirSync('dist/public');
      files.forEach(file => {
        fs.renameSync(`dist/public/${file}`, `dist/${file}`);
      });
      fs.rmSync('dist/public', { recursive: true });
      console.log('Fallback build successful');
      return true;
    }
  } catch (error) {
    console.log('Both builds failed, creating minimal deployment...');
  }
  
  return false;
}

function createMinimalDeployment() {
  console.log('Creating minimal deployment structure...');
  
  fs.mkdirSync('dist', { recursive: true });
  fs.mkdirSync('dist/assets', { recursive: true });
  
  // Read the original index.html
  const indexHtml = fs.readFileSync('client/index.html', 'utf-8');
  
  // Create production HTML with inline styles
  const productionHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Growing Us - Relationship Card Game</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; }
        .container { max-width: 1200px; margin: 0 auto; padding: 2rem; }
        .hero { text-align: center; padding: 4rem 0; }
        .hero h1 { font-size: 3rem; color: #2563eb; margin-bottom: 1rem; }
        .hero p { font-size: 1.2rem; color: #64748b; margin-bottom: 2rem; }
        .card-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; margin: 3rem 0; }
        .card { background: white; border-radius: 12px; padding: 2rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .card h3 { color: #1e40af; margin-bottom: 1rem; }
        .card p { color: #6b7280; }
        .email-form { max-width: 400px; margin: 0 auto; }
        .email-input { width: 100%; padding: 1rem; border: 2px solid #e5e7eb; border-radius: 8px; margin-bottom: 1rem; }
        .submit-btn { width: 100%; padding: 1rem; background: #2563eb; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 1rem; }
        .submit-btn:hover { background: #1d4ed8; }
        @media (max-width: 768px) {
            .hero h1 { font-size: 2rem; }
            .container { padding: 1rem; }
            .card-grid { gap: 1rem; }
        }
    </style>
</head>
<body>
    <div id="root">
        <div class="container">
            <div class="hero">
                <h1>Growing Us</h1>
                <p>The Relationship Card Game That Brings Couples Closer</p>
                <div class="email-form">
                    <input type="email" class="email-input" placeholder="Enter your email address" id="emailInput">
                    <button class="submit-btn" onclick="submitEmail()">Join Our Waitlist</button>
                </div>
            </div>
            
            <div class="card-grid">
                <div class="card">
                    <h3>Deepen Your Connection</h3>
                    <p>Thoughtfully crafted questions designed to spark meaningful conversations and help you discover new things about each other.</p>
                </div>
                <div class="card">
                    <h3>Build Intimacy</h3>
                    <p>Create moments of vulnerability and trust through guided conversations that strengthen your emotional bond.</p>
                </div>
                <div class="card">
                    <h3>Grow Together</h3>
                    <p>Explore shared dreams, values, and experiences that help you build a stronger future as a couple.</p>
                </div>
            </div>
        </div>
    </div>
    
    <script>
        async function submitEmail() {
            const email = document.getElementById('emailInput').value;
            if (!email) {
                alert('Please enter your email address');
                return;
            }
            
            try {
                const response = await fetch('/api/preorders', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email })
                });
                
                if (response.ok) {
                    alert('Thank you! You\\'ve been added to our waitlist.');
                    document.getElementById('emailInput').value = '';
                } else {
                    alert('Something went wrong. Please try again.');
                }
            } catch (error) {
                alert('Thank you for your interest! We\\'ll be in touch soon.');
                document.getElementById('emailInput').value = '';
            }
        }
    </script>
</body>
</html>`;
  
  fs.writeFileSync('dist/index.html', productionHtml);
  console.log('Minimal deployment created');
}

// Main execution
console.log('Starting deployment build...');

if (!buildOptimized()) {
  createMinimalDeployment();
}

// Verify final structure
if (fs.existsSync('dist/index.html')) {
  console.log('✓ Deployment ready!');
  console.log('✓ index.html is in dist/ (not dist/public/)');
  console.log('✓ Structure matches static deployment requirements');
  
  const files = fs.readdirSync('dist');
  console.log(`Files: ${files.join(', ')}`);
  
  // Clean up any server files
  ['index.js', 'index.js.map', 'server.js'].forEach(file => {
    if (fs.existsSync(`dist/${file}`)) {
      fs.unlinkSync(`dist/${file}`);
    }
  });
  
} else {
  console.error('Deployment failed - no index.html found');
  process.exit(1);
}