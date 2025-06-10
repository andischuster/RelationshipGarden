# Static Deployment Guide

This project has been configured to support static deployment on Replit. The main issue was that the build process was creating files in `dist/public/` instead of directly in `dist/`, which caused deployment failures.

## Solution Implemented

### 1. Build Script (`build-static.js`)
A dedicated Node.js script that:
- Runs the Vite build process in production mode
- Restructures the output from `dist/public/` to `dist/`
- Removes any server-side files that shouldn't be in static deployment
- Validates that `index.html` is in the correct location

### 2. Shell Script (`build-static.sh`)
A simple wrapper script for easy execution.

## How to Deploy

### Option 1: Using the Node.js Script
```bash
node build-static.js
```

### Option 2: Using the Shell Script
```bash
chmod +x build-static.sh
./build-static.sh
```

### Option 3: Manual Steps
If the automated scripts don't work, you can manually restructure the build:

1. Run the build command:
   ```bash
   npx vite build --mode production
   ```

2. Restructure the output:
   ```bash
   # Move files from dist/public to dist
   mv dist/public/* dist/
   rmdir dist/public
   
   # Remove any server files
   rm -f dist/index.js dist/index.js.map
   ```

## Verification

After running the build script, verify that:
- ✓ `dist/index.html` exists
- ✓ Static assets (CSS, JS, images) are in `dist/`
- ✓ No server-side files (`index.js`) are present
- ✓ All client assets have correct relative paths

## Deployment Process

1. Run one of the build commands above
2. Verify the build structure
3. Deploy using Replit's static deployment feature
4. The app will be available at your `.replit.app` domain

## Troubleshooting

### Build Timeout
If the build process times out due to large dependencies:
- The script includes timeout handling
- The build may complete successfully even if it appears to timeout
- Check for the presence of `dist/index.html` to confirm success

### Missing Files
If `index.html` is not in the root `dist/` directory:
- Check if it's in a subdirectory like `dist/public/`
- The script includes automatic detection and moving of misplaced files

### Static Assets Not Loading
Ensure all asset paths in the built files are relative and not absolute paths starting with `/`.