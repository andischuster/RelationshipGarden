# Static Deployment Instructions

## The Problem
Your build configuration outputs files to `dist/public/` but Replit's static deployment expects `index.html` directly in `dist/`. 

## Solution

### Method 1: Automated Script (Recommended)
Run the deployment script:
```bash
node deploy-static.js
```

### Method 2: Manual Process
If the automated script doesn't complete due to build timeouts:

1. **Start the build process:**
   ```bash
   npx vite build --mode production
   ```

2. **Wait for partial completion** (even if it times out, files may still be created)

3. **Check and restructure the output:**
   ```bash
   # Check if build created files
   ls -la dist/
   
   # If files are in dist/public/, move them up
   if [ -d "dist/public" ]; then
     mv dist/public temp-build
     rm -rf dist
     mv temp-build dist
   fi
   
   # Remove any server files
   rm -f dist/index.js dist/index.js.map
   ```

4. **Verify the structure:**
   ```bash
   ls -la dist/
   # Should show index.html and asset files directly in dist/
   ```

### Method 3: Quick Fix Script
Run the shell script:
```bash
chmod +x quick-deploy.sh
./quick-deploy.sh
```

## Expected Final Structure
```
dist/
├── index.html          ← Must be here (not in a subdirectory)
├── assets/
│   ├── index-[hash].js
│   ├── index-[hash].css
│   └── [other assets]
└── [any other static files]
```

## Verification Checklist
- [ ] `dist/index.html` exists (not in `dist/public/index.html`)
- [ ] CSS and JS files are in `dist/assets/` or directly in `dist/`
- [ ] No server files (`index.js`) in the `dist/` directory
- [ ] All file paths are relative (not absolute)

## Deployment
Once the correct structure is confirmed:
1. Use Replit's deployment feature
2. Point it to the `dist/` directory
3. The static site will be available at your `.replit.app` domain

## Troubleshooting

### Build Never Completes
The build process may timeout due to the large dependency tree, but partial builds often succeed. Check for output files even after timeouts.

### Files in Wrong Location
If you find `dist/public/index.html` instead of `dist/index.html`, move all contents from `dist/public/` to `dist/` and remove the empty `public/` directory.

### Missing Assets
Ensure all imported images and other assets are being copied to the build output. The build process should handle asset imports automatically.