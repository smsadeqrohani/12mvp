# Vercel Deployment Guide

## 🚀 Deploying Your Expo React Native Web App to Vercel

### Prerequisites
- Vercel account
- GitHub repository with your code
- Convex project set up

### Step 1: Environment Variables
In your Vercel dashboard, add these environment variables:

**For Development:**
```
EXPO_PUBLIC_CONVEX_URL=your_convex_url_here
NODE_ENV=development
```

**For Production (when ready):**
```
EXPO_PUBLIC_CONVEX_URL=your_convex_url_here
NODE_ENV=production
```

### Step 2: Vercel Configuration
The `vercel.json` file is already configured with:
- Build command: `npm run build`
- Output directory: `dist`
- Static build configuration for Expo web

### Step 3: Deploy
1. Connect your GitHub repository to Vercel
2. Vercel will automatically detect the configuration
3. The build should now work with `expo export:web`

### Troubleshooting

#### If build still fails:
1. Make sure your Convex URL is set in environment variables
2. Check that all dependencies are in `package.json`
3. Ensure your Expo version is compatible

#### Common Issues:
- **"vite: command not found"** - Fixed by using `expo export:web` instead of `vite build`
- **Missing environment variables** - Add `EXPO_PUBLIC_CONVEX_URL` to Vercel
- **Build timeout** - Increase build timeout in Vercel settings if needed

### Build Process
1. `npm install` - Install dependencies
2. `npm run build` - Export web build using Expo
3. Output goes to `dist/` directory
4. Vercel serves the static files

### Post-Deployment
- Your app will be available at your Vercel URL
- Make sure Convex is deployed and accessible
- Test all functionality in the deployed version
