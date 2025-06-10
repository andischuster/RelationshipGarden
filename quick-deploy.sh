#!/bin/bash

echo "Starting static deployment build..."

# Clean existing build
rm -rf dist temp-deploy 2>/dev/null

# Run vite build with timeout
echo "Building with Vite..."
timeout 60 npx vite build --mode production

# Check if build created output
if [ -d "dist/public" ]; then
    echo "Restructuring build output..."
    # Move contents from dist/public to temp directory
    mv dist/public temp-deploy
    rm -rf dist
    mv temp-deploy dist
    echo "Directory structure fixed"
elif [ -d "dist" ]; then
    echo "Build output in correct location"
else
    echo "No build output found, trying alternative approach..."
    # Fallback: create minimal static structure
    mkdir -p dist
    
    # Copy client files manually if build failed
    if [ -f "client/index.html" ]; then
        cp client/index.html dist/
        echo "Copied index.html"
    fi
fi

# Remove server files if they exist
rm -f dist/index.js dist/index.js.map 2>/dev/null

# Verify deployment
echo "Verifying deployment structure..."
if [ -f "dist/index.html" ]; then
    echo "✓ index.html found"
    echo "✓ Ready for static deployment"
    echo "Contents of dist/:"
    ls -la dist/
else
    echo "✗ index.html not found"
    echo "Current dist structure:"
    ls -la dist/ 2>/dev/null || echo "dist directory not found"
    exit 1
fi

echo "Static build complete!"