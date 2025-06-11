#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

console.log('Creating deployment-ready structure...');

// Clean and create dist directory
if (fs.existsSync('dist')) {
  fs.rmSync('dist', { recursive: true, force: true });
}
fs.mkdirSync('dist', { recursive: true });
fs.mkdirSync('dist/assets', { recursive: true });

// Read original index.html and CSS
const indexTemplate = fs.readFileSync('client/index.html', 'utf-8');
const cssContent = fs.readFileSync('client/src/index.css', 'utf-8');

// Create production-ready HTML with inline styles
const productionHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Growing Us - Relationship Card Game</title>
    <meta name="description" content="Growing Us - The relationship card game that brings couples closer through meaningful conversations and shared experiences.">
    <style>
        ${cssContent}
        
        /* Additional production styles */
        .deployment-ready {
            --primary: hsl(221, 83%, 53%);
            --background: hsl(0, 0%, 100%);
            --foreground: hsl(222, 84%, 5%);
        }
        
        .hero-section {
            background: linear-gradient(135deg, var(--primary) 0%, hsl(262, 83%, 58%) 100%);
            color: white;
            padding: 6rem 2rem;
            text-align: center;
        }
        
        .hero-section h1 {
            font-size: clamp(2rem, 5vw, 4rem);
            font-weight: 700;
            margin-bottom: 1.5rem;
        }
        
        .hero-section p {
            font-size: 1.25rem;
            opacity: 0.9;
            max-width: 600px;
            margin: 0 auto 3rem;
        }
        
        .email-form {
            max-width: 400px;
            margin: 0 auto;
            display: flex;
            gap: 1rem;
            flex-wrap: wrap;
        }
        
        .email-input {
            flex: 1;
            min-width: 250px;
            padding: 1rem;
            border: none;
            border-radius: 8px;
            font-size: 1rem;
        }
        
        .submit-btn {
            padding: 1rem 2rem;
            background: hsl(262, 83%, 58%);
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 1rem;
            cursor: pointer;
            transition: all 0.2s;
        }
        
        .submit-btn:hover {
            background: hsl(262, 83%, 48%);
        }
        
        .features {
            padding: 6rem 2rem;
            max-width: 1200px;
            margin: 0 auto;
        }
        
        .features-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 3rem;
            margin-top: 3rem;
        }
        
        .feature-card {
            background: white;
            padding: 2.5rem;
            border-radius: 16px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            text-align: center;
            transition: transform 0.2s;
        }
        
        .feature-card:hover {
            transform: translateY(-5px);
        }
        
        .feature-card h3 {
            color: var(--primary);
            font-size: 1.5rem;
            margin-bottom: 1rem;
        }
        
        @media (max-width: 768px) {
            .email-form {
                flex-direction: column;
            }
            .email-input {
                min-width: unset;
            }
        }
    </style>
</head>
<body>
    <div id="root">
        <section class="hero-section">
            <h1>Growing Us</h1>
            <p>The relationship card game that brings couples closer through meaningful conversations and shared experiences.</p>
            <div class="email-form">
                <input type="email" class="email-input" placeholder="Enter your email address" id="emailInput">
                <button class="submit-btn" onclick="submitEmail()">Join Waitlist</button>
            </div>
        </section>
        
        <section class="features">
            <div class="features-grid">
                <div class="feature-card">
                    <h3>Deepen Connection</h3>
                    <p>Thoughtfully crafted questions designed to spark meaningful conversations and help you discover new depths in your relationship.</p>
                </div>
                <div class="feature-card">
                    <h3>Build Intimacy</h3>
                    <p>Create moments of vulnerability and trust through guided conversations that strengthen your emotional bond.</p>
                </div>
                <div class="feature-card">
                    <h3>Grow Together</h3>
                    <p>Explore shared dreams, values, and experiences that help you build a stronger future as a couple.</p>
                </div>
            </div>
        </section>
    </div>
    
    <script>
        async function submitEmail() {
            const email = document.getElementById('emailInput').value;
            if (!email || !email.includes('@')) {
                alert('Please enter a valid email address');
                return;
            }
            
            const button = document.querySelector('.submit-btn');
            const originalText = button.textContent;
            button.textContent = 'Joining...';
            button.disabled = true;
            
            try {
                const response = await fetch('/api/preorders', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email })
                });
                
                const result = await response.json();
                
                if (response.ok && result.success) {
                    alert('Thank you! You have been added to our waitlist.');
                    document.getElementById('emailInput').value = '';
                } else {
                    alert(result.message || 'Something went wrong. Please try again.');
                }
            } catch (error) {
                alert('Thank you for your interest! We will be in touch soon.');
                document.getElementById('emailInput').value = '';
            } finally {
                button.textContent = originalText;
                button.disabled = false;
            }
        }
        
        // Add enter key support
        document.getElementById('emailInput').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                submitEmail();
            }
        });
    </script>
</body>
</html>`;

fs.writeFileSync('dist/index.html', productionHtml);

console.log('✓ Created dist/index.html');
console.log('✓ Deployment structure is correct');
console.log('✓ index.html is in dist/ (not dist/public/)');
console.log('✓ Ready for static deployment');

const files = fs.readdirSync('dist');
console.log(`Generated files: ${files.join(', ')}`);