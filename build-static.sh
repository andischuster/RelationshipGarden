#!/bin/bash

echo "Building static files for deployment..."

# Make the script executable and run it
chmod +x build-static.js
node build-static.js

echo "Build complete! Ready for static deployment."