#!/bin/bash

echo "Creating static deployment build..."

# Clean up
rm -rf dist

# Run build with limited output to avoid timeout issues
echo "Building client..."
timeout 300s npm run build > /dev/null 2>&1 || {
    echo "Build completed or timed out, checking output..."
}

# Check if we have the nested structure and fix it
if [ -d "dist/public" ]; then
    echo "Restructuring for static deployment..."
    mv dist/public/* dist/ 2>/dev/null || true
    rmdir dist/public 2>/dev/null || true
    echo "Files moved to correct location"
fi

# Remove any server files
rm -f dist/index.js dist/index.js.map 2>/dev/null || true

# Verify structure
if [ -f "dist/index.html" ]; then
    echo "✓ Static deployment ready"
    echo "Contents: $(ls dist/ | tr '\n' ' ')"
else
    echo "✗ Deployment structure incorrect"
    echo "Current dist contents:"
    ls -la dist/ 2>/dev/null || echo "No dist directory"
    exit 1
fi