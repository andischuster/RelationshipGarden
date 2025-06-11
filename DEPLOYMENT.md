# Deployment Guide

## Problem
The deployment failed because Vite was creating files in `dist/public/` instead of directly in `dist/`, which static deployment services expect.

## Solution
This project now includes multiple deployment configurations and build scripts to handle both static and full-stack deployments.

## Static Deployment (Recommended)

### Quick Build
```bash
./test-build.sh
```

### Manual Build Options

#### Option 1: Static Configuration (Preferred)
```bash
npx vite build --config vite.config.static.ts --mode production
```

#### Option 2: Fallback with Restructuring
```bash
npx vite build --mode production
# Then move files from dist/public/ to dist/
mv dist/public/* dist/ && rmdir dist/public
```

### Automated Build Scripts

#### Simple Build
```bash
node build-static.js
```

#### Build with Fallback
```bash
node build-static-fallback.js
```

#### Production Build
```bash
node build-for-deployment.js
```

## Configuration Files

### vite.config.static.ts
- Optimized for static deployment
- Outputs directly to `dist/`
- Includes chunk optimization
- Removes development plugins

### vite.config.ts (Default)
- Full-stack configuration
- Outputs to `dist/public/` (requires restructuring)
- Includes development tools

## Deployment Types

### Static Deployment
- Use for frontend-only hosting
- Build command: `node build-static.js`
- Output: `dist/` directory with `index.html` at root

### Autoscale Deployment
- Use for full-stack application
- Build command: `npm run build`
- Includes both frontend and backend

## Verification

After building, verify the structure:
```bash
ls -la dist/
# Should show:
# index.html
# assets/
# (other static files)
```

## Troubleshooting

1. **Build timeout**: The build process includes many dependencies. If it times out, try the fallback script.

2. **Missing index.html**: Check if files are in `dist/public/` and need restructuring.

3. **Large bundle size**: The static config includes chunk optimization to reduce bundle size.

## Deployment Commands Summary

| Purpose | Command |
|---------|---------|
| Quick test | `./test-build.sh` |
| Static build | `node build-static.js` |
| Production build | `node build-for-deployment.js` |
| Full-stack build | `npm run build` |