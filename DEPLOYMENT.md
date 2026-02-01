# Deployment Guide

This guide explains how to deploy the Southwest Flight Finder to Railway.

## Prerequisites

- Git repository (GitHub, GitLab, or Bitbucket)
- Railway account (free tier available)
- Code pushed to your repository

## Railway Deployment (Recommended)

Railway is the recommended platform because it:
- Automatically detects the build configuration
- Supports monorepos with pnpm
- Provides free tier for development
- Has excellent support for Node.js applications
- Serves both frontend and backend in a single service

### Step 1: Prepare Your Repository

1. Initialize git (if not already done):
```bash
git init
git add .
git commit -m "Initial commit"
```

2. Push to GitHub:
```bash
git remote add origin https://github.com/yourusername/swa-flight-finder.git
git push -u origin main
```

### Step 2: Deploy to Railway

#### Option A: Using Railway Dashboard (Easiest)

1. Go to [railway.app](https://railway.app) and sign in

2. Click "New Project"

3. Select "Deploy from GitHub repo"

4. Choose your repository

5. Railway will automatically:
   - Detect the `railway.json` configuration
   - Install pnpm
   - Run `pnpm install`
   - Run `pnpm build`
   - Start the server with `pnpm start`

6. Your app will be deployed! Railway provides a URL like:
   `https://your-app.railway.app`

#### Option B: Using Railway CLI

1. Install Railway CLI:
```bash
npm install -g @railway/cli
```

2. Login:
```bash
railway login
```

3. Initialize project:
```bash
railway init
```

4. Deploy:
```bash
railway up
```

### Step 3: Configure Environment Variables

In Railway dashboard:

1. Go to your project
2. Click "Variables"
3. Add:
   - `NODE_ENV` = `production`
   - `PORT` = `3000` (optional, Railway sets this automatically)

### Step 4: Verify Deployment

1. Wait for deployment to complete (usually 2-3 minutes)

2. Test the health endpoint:
```bash
curl https://your-app.railway.app/api/health
```

3. Open the app in your browser:
```
https://your-app.railway.app
```

## Alternative Platforms

### Heroku

1. Install Heroku CLI:
```bash
npm install -g heroku
```

2. Create app:
```bash
heroku create swa-flight-finder
```

3. Add buildpack:
```bash
heroku buildpacks:set https://github.com/pnpm/heroku-buildpack.git
```

4. Deploy:
```bash
git push heroku main
```

### DigitalOcean App Platform

1. Connect your GitHub repository in DigitalOcean dashboard

2. Configure build:
   - Build Command: `pnpm install && pnpm build`
   - Run Command: `pnpm start`

3. Set environment variables:
   - `NODE_ENV=production`

### Vercel (Frontend Only)

Note: Vercel works best for the frontend. You'd need separate backend hosting.

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Deploy frontend:
```bash
cd packages/frontend
vercel
```

3. Deploy backend separately to Railway or other Node.js host

## Production Checklist

Before deploying to production:

- [ ] Environment variables configured
- [ ] Build succeeds locally (`pnpm build`)
- [ ] Production server starts (`pnpm start`)
- [ ] API endpoints tested
- [ ] Frontend loads correctly
- [ ] Mobile responsive design verified
- [ ] Error handling works
- [ ] CORS configured for production domain
- [ ] README updated with production URL
- [ ] SSL/HTTPS enabled (automatic on Railway)

## Monitoring

### Railway Logs

View logs in Railway dashboard or CLI:
```bash
railway logs
```

### Health Check

Monitor your app with uptime services like:
- UptimeRobot
- Pingdom
- StatusCake

Configure them to check:
```
https://your-app.railway.app/api/health
```

## Troubleshooting

### Build Fails

1. Check pnpm version:
   - Railway uses latest pnpm by default
   - Verify locally: `pnpm --version`

2. Check dependencies:
   ```bash
   pnpm install
   pnpm build
   ```

3. Review Railway build logs

### App Crashes on Start

1. Check `startCommand` in `railway.json`
2. Verify all packages built:
   ```bash
   ls -la packages/*/dist
   ```
3. Check Railway logs for errors

### Frontend Shows But API Fails

1. Verify backend serves frontend in production:
   - Check `packages/backend/src/index.ts`
   - Look for `express.static` and SPA fallback

2. Check API routes work:
   ```bash
   curl https://your-app.railway.app/api/health
   ```

### CORS Errors

Update CORS configuration in `packages/backend/src/index.ts`:
```typescript
app.use(cors({
  origin: ['https://your-app.railway.app'],
  credentials: true
}));
```

## Scaling

### Railway Pro

Upgrade to Railway Pro for:
- More resources (RAM, CPU)
- Custom domains
- Better uptime SLA
- Priority support

### Database Integration

If adding a database in the future:

1. Add PostgreSQL/MongoDB in Railway dashboard
2. Railway provides connection string automatically
3. Update backend to use database
4. Add connection pooling

## Continuous Deployment

Railway automatically redeploys when you push to your main branch:

```bash
git add .
git commit -m "Update feature"
git push origin main
```

Railway will:
1. Detect the push
2. Build the application
3. Run tests (if configured)
4. Deploy if successful

## Rollback

If deployment fails:

1. In Railway dashboard, go to "Deployments"
2. Find previous successful deployment
3. Click "Rollback"

Or via CLI:
```bash
railway rollback
```

## Custom Domain

1. In Railway dashboard, go to "Settings"
2. Click "Generate Domain" or add custom domain
3. Update DNS records as instructed
4. Wait for SSL certificate (automatic)

---

Need help? Check Railway's [documentation](https://docs.railway.app) or open an issue.
