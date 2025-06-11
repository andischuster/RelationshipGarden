#!/bin/bash

echo "Testing static build process..."

# Clean any existing dist
rm -rf dist

# Try static config first (should output directly to dist/)
echo "Building with static configuration..."
npx vite build --config vite.config.static.ts --mode production

# Check if successful
if [ -f "dist/index.html" ]; then
    echo "✓ Static build successful"
    echo "Files in dist:"
    ls -la dist/
    exit 0
else
    echo "Static build failed, trying restructure approach..."
    rm -rf dist
    
    # Use default config and restructure
    npx vite build --mode production
    
    if [ -d "dist/public" ]; then
        echo "Restructuring build output..."
        mv dist/public/* dist/
        rmdir dist/public
        
        if [ -f "dist/index.html" ]; then
            echo "✓ Restructure successful"
            echo "Files in dist:"
            ls -la dist/
            exit 0
        fi
    fi
    
    echo "✗ Both build methods failed"
    exit 1
fi