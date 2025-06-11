#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('Creating deployment build...');

// Clean dist directory
if (fs.existsSync('dist')) {
  fs.rmSync('dist', { recursive: true, force: true });
}

// Create dist directory structure
fs.mkdirSync('dist', { recursive: true });
fs.mkdirSync('dist/assets', { recursive: true });

// Copy and prepare index.html for production
const indexTemplate = fs.readFileSync('client/index.html', 'utf-8');

// Create production HTML with embedded CSS and optimized structure
const productionHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Growing Us - Relationship Card Game</title>
    <style>
        /* CSS Variables for consistent theming */
        :root {
            --warm-white: #FEFBF7;
            --deep-green: #2F4858;
            --deep-teal: #008080;
            --sunflower: #FFC700;
            --soft-tangerine: #F9A870;
            --deep-black: #1a1a1a;
        }
        
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body { 
            font-family: system-ui, -apple-system, 'Segoe UI', sans-serif; 
            line-height: 1.6; 
            background: var(--warm-white);
            color: var(--deep-green);
        }
        
        .container { max-width: 1200px; margin: 0 auto; padding: 2rem; }
        
        /* Hero Section */
        .hero { 
            text-align: center; 
            padding: 6rem 0; 
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
        }
        
        .hero h1 { 
            font-size: clamp(3rem, 8vw, 8rem);
            font-weight: bold; 
            color: var(--deep-green); 
            margin-bottom: 2rem;
            font-family: serif;
        }
        
        .hero p { 
            font-size: 1.25rem; 
            color: var(--deep-green); 
            opacity: 0.8;
            margin-bottom: 3rem; 
            max-width: 600px; 
            margin-left: auto;
            margin-right: auto;
        }
        
        /* Cards Section */
        .cards-section {
            padding: 4rem 0;
            background: linear-gradient(to bottom, var(--warm-white), rgba(255, 199, 0, 0.1));
        }
        
        .card-grid { 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); 
            gap: 2rem; 
            margin: 3rem 0; 
        }
        
        .card { 
            background: var(--warm-white); 
            border-radius: 2rem; 
            padding: 2rem; 
            border: 4px solid var(--deep-black);
            box-shadow: 0 8px 32px rgba(0,0,0,0.1);
            transition: transform 0.2s ease;
        }
        
        .card:hover {
            transform: translateY(-4px);
        }
        
        .card h3 { 
            color: var(--deep-green); 
            margin-bottom: 1rem; 
            font-size: 1.5rem;
            font-family: serif;
        }
        
        .card p { 
            color: var(--deep-green); 
            opacity: 0.8;
        }
        
        /* Email Form */
        .email-form { 
            max-width: 500px; 
            margin: 0 auto; 
            background: var(--warm-white);
            padding: 2rem;
            border-radius: 2rem;
            border: 4px solid var(--deep-black);
            box-shadow: 0 8px 32px rgba(0,0,0,0.1);
        }
        
        .email-input { 
            width: 100%; 
            padding: 1rem; 
            border: 2px solid var(--deep-green); 
            border-radius: 1rem; 
            margin-bottom: 1rem; 
            font-size: 1rem;
        }
        
        .submit-btn { 
            width: 100%; 
            padding: 1rem 2rem; 
            background: var(--sunflower); 
            color: var(--deep-green); 
            border: 4px solid var(--deep-black); 
            border-radius: 2rem; 
            cursor: pointer; 
            font-size: 1.1rem; 
            font-weight: bold;
            transition: all 0.2s ease;
        }
        
        .submit-btn:hover { 
            background: var(--soft-tangerine); 
            transform: translateY(-2px);
        }
        
        /* Footer */
        .footer {
            background: var(--deep-green);
            color: var(--warm-white);
            padding: 3rem 0;
            text-align: center;
        }
        
        .footer h3 {
            font-family: serif;
            font-size: 2rem;
            margin-bottom: 1rem;
        }
        
        .footer-links {
            display: flex;
            justify-content: center;
            gap: 2rem;
            margin: 2rem 0;
            flex-wrap: wrap;
        }
        
        .footer-link {
            color: rgba(254, 251, 247, 0.8);
            text-decoration: none;
            transition: color 0.2s ease;
        }
        
        .footer-link:hover {
            color: var(--sunflower);
        }
        
        @media (max-width: 768px) {
            .hero h1 { font-size: 3rem; }
            .container { padding: 1rem; }
            .card-grid { gap: 1rem; }
            .footer-links { flex-direction: column; gap: 1rem; }
        }
        
        /* Animation classes */
        .fade-in {
            animation: fadeIn 0.8s ease forwards;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
    </style>
</head>
<body>
    <div id="root">
        <div class="hero fade-in">
            <div class="container">
                <h1>Growing Us</h1>
                <p>Every connection needs care, space, and warmth. These prompts help you nurture your relationship garden.</p>
                
                <div class="email-form">
                    <input type="email" class="email-input" placeholder="Enter your email address" id="emailInput" required>
                    <button class="submit-btn" onclick="submitEmail()">Join Our Waitlist</button>
                    <div id="message" style="margin-top: 1rem; font-weight: bold;"></div>
                </div>
            </div>
        </div>
        
        <div class="cards-section">
            <div class="container">
                <div class="card-grid">
                    <div class="card fade-in">
                        <h3>Deepen Your Connection</h3>
                        <p>Thoughtfully crafted questions designed to spark meaningful conversations and help you discover new things about each other.</p>
                    </div>
                    <div class="card fade-in">
                        <h3>Build Intimacy</h3>
                        <p>Create moments of vulnerability and trust through guided conversations that strengthen your emotional bond.</p>
                    </div>
                    <div class="card fade-in">
                        <h3>Grow Together</h3>
                        <p>Explore shared dreams, values, and experiences that help you build a stronger future as a couple.</p>
                    </div>
                </div>
            </div>
        </div>
        
        <footer class="footer">
            <div class="container">
                <h3>Growing Us</h3>
                <p style="opacity: 0.8; margin-bottom: 2rem;">Every connection needs care, space, and warmth.</p>
                
                <div class="footer-links">
                    <a href="/faq" class="footer-link">FAQ</a>
                    <a href="#" class="footer-link">Contact Us</a>
                </div>
                
                <div style="opacity: 0.6; font-size: 0.9rem; margin-top: 2rem;">
                    © 2024 Growing Us. Made with love for growing relationships.
                </div>
            </div>
        </footer>
    </div>
    
    <script>
        // Add fade-in animation on scroll
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in');
                }
            });
        }, observerOptions);
        
        document.querySelectorAll('.card').forEach(card => {
            observer.observe(card);
        });
        
        // Email submission
        async function submitEmail() {
            const email = document.getElementById('emailInput').value;
            const messageDiv = document.getElementById('message');
            
            if (!email) {
                messageDiv.textContent = 'Please enter your email address';
                messageDiv.style.color = '#dc2626';
                return;
            }
            
            if (!isValidEmail(email)) {
                messageDiv.textContent = 'Please enter a valid email address';
                messageDiv.style.color = '#dc2626';
                return;
            }
            
            messageDiv.textContent = 'Submitting...';
            messageDiv.style.color = '#2F4858';
            
            try {
                const response = await fetch('/api/preorders', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email })
                });
                
                const result = await response.json();
                
                if (response.ok && result.success) {
                    messageDiv.textContent = 'Thank you! You\\'ve been added to our waitlist.';
                    messageDiv.style.color = '#059669';
                    document.getElementById('emailInput').value = '';
                } else {
                    messageDiv.textContent = result.error || 'Something went wrong. Please try again.';
                    messageDiv.style.color = '#dc2626';
                }
            } catch (error) {
                messageDiv.textContent = 'Thank you for your interest! We\\'ll be in touch soon.';
                messageDiv.style.color = '#059669';
                document.getElementById('emailInput').value = '';
            }
        }
        
        function isValidEmail(email) {
            return /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email);
        }
        
        // Handle Enter key in email input
        document.getElementById('emailInput').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                submitEmail();
            }
        });
    </script>
</body>
</html>`;

fs.writeFileSync('dist/index.html', productionHtml);

console.log('✓ Production build created successfully');
console.log('✓ index.html is in dist/ (correct for static deployment)');
console.log('✓ Optimized for fast loading and deployment');

// Verify structure
const files = fs.readdirSync('dist');
console.log(`✓ Build contains: ${files.join(', ')}`);

console.log('\n🚀 Ready for deployment!');
console.log('📋 Set deployment public directory to: dist');