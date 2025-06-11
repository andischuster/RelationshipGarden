#!/bin/bash

echo "🚀 Building for static deployment..."

# Clean existing build
rm -rf dist temp-build 2>/dev/null
echo "✓ Cleaned existing build"

# Build with Vite
echo "📦 Building client files..."
NODE_ENV=production npx vite build --mode production

# Check build output and restructure if needed
if [ -d "dist/public" ]; then
    echo "🔧 Restructuring for static deployment..."
    
    # Move contents from dist/public to temp directory
    mv dist/public temp-build
    
    # Remove dist and replace with temp
    rm -rf dist
    mv temp-build dist
    
    echo "✓ Files moved to correct location"
elif [ -d "dist" ] && [ -f "dist/index.html" ]; then
    echo "✓ Build output already in correct structure"
else  
    echo "❌ Build failed - no output directory found"
    exit 1
fi

# Remove server files if they exist
rm -f dist/index.js dist/index.js.map dist/server.js 2>/dev/null

# Verify deployment structure
if [ -f "dist/index.html" ]; then
    echo "✅ Static deployment ready!"
    echo "📁 Contents: $(ls -1 dist/ | tr '\n' ', ' | sed 's/,$//')"
    
    # Check file sizes
    echo "📄 index.html: $(du -h dist/index.html | cut -f1)"
    
    # Look for assets
    if ls dist/assets* 1> /dev/null 2>&1; then
        echo "✓ Static assets found"
    fi
    
    echo "🎉 Ready for static hosting!"
else
    echo "❌ index.html not found in dist/"
    echo "Current structure:"
    ls -la dist/ 2>/dev/null || echo "dist directory not found"
    exit 1
fi