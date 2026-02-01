# Railway Deployment Guide

This guide walks you through deploying the Southwest Flight Finder to Railway.

## Prerequisites

- Railway account ([railway.app](https://railway.app))
- GitHub repository with the code
- SerpAPI key

## Deployment Steps

### 1. Create New Project in Railway

1. Go to [railway.app](https://railway.app) and sign in
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Choose the **`swa-flight-finder`** repository
5. Railway will detect the monorepo structure automatically

### 2. Configure Environment Variables

In the Railway dashboard, add these environment variables:

```
NODE_ENV=production
PORT=3000
SERPAPI_KEY=your_serpapi_key_here
DATA_PROVIDER=hybrid
```

**Important:** Replace `your_serpapi_key_here` with your actual SerpAPI key.

### 3. Configure Build Settings

Railway should auto-detect the build configuration from `railway.json`, but verify:

- **Build Command**: `pnpm install && pnpm build`
- **Start Command**: `pnpm start`
- **Root Directory**: `/` (leave as root)

### 4. Deploy

1. Click **"Deploy"** in the Railway dashboard
2. Wait for the build to complete (3-5 minutes)
3. Railway will provide a public URL like: `https://your-app.railway.app`

### 5. Verify Deployment

1. Visit your Railway URL
2. You should see the Southwest Flight Finder interface
3. Try searching for flights to verify the API is working

Test URLs:
- **Health Check**: `https://your-app.railway.app/api/health`
- **Flight Search**: `https://your-app.railway.app/api/flights?origin=CMH&from=2026-03-15&to=2026-03-20`

## Architecture

Railway serves both the frontend and backend from a single service:

```
Railway Container
├── Backend (Express API) - Port 3000
│   ├── /api/health
│   ├── /api/flights
│   └── /api/debug-serpapi
│
└── Frontend (Static Files)
    └── /* (all other routes)
```

The backend serves the frontend's static files and provides API endpoints.

## Monitoring

### Logs

View real-time logs in the Railway dashboard:
- Click on your project
- Go to the **"Logs"** tab
- Filter by log level (info, warn, error)

### Metrics

Railway provides built-in metrics:
- CPU usage
- Memory usage
- Network traffic
- Request count

## Cost Estimates

### Railway
- **Free Tier**: $5 credit/month
- **Hobby Plan**: $5/month for unlimited usage
- **Estimated usage**: ~$5-10/month for moderate traffic

### SerpAPI
- **Free Tier**: 100 searches/month
- **Paid Plans**: Starting at $50/month for 5,000 searches
- **Current usage**: 94 flights = ~15 API calls per search (one per destination)

**Cost-saving tip**: Implement aggressive caching (6+ hours) to reduce API calls.

## Updating the Deployment

### Automatic Deployments

Railway automatically deploys when you push to the `main` branch:

```bash
git add .
git commit -m "Your update message"
git push origin main
```

Railway will:
1. Detect the new commit
2. Trigger a new build
3. Deploy automatically (zero downtime)

### Manual Deployment

In the Railway dashboard:
1. Click **"Deploy"** dropdown
2. Select **"Redeploy"**

## Troubleshooting

### Build Fails

**Problem**: `pnpm install` fails
**Solution**: Check that `pnpm-lock.yaml` is committed to Git

**Problem**: TypeScript errors during build
**Solution**: Run `pnpm build` locally first to catch errors

### Application Crashes

**Problem**: App crashes on startup
**Solution**:
- Check logs for error messages
- Verify all environment variables are set
- Ensure `SERPAPI_KEY` is valid

### No Flights Returned

**Problem**: API returns 0 flights
**Solution**:
- Check SerpAPI key is valid and has credits
- Verify `DATA_PROVIDER=hybrid` is set
- Test with debug endpoint: `/api/debug-serpapi?destination=LAS`

### 404 Errors on Frontend Routes

**Problem**: Refreshing page shows 404
**Solution**: Verify the backend serves static files correctly. Check `index.ts` has:
```typescript
app.use(express.static(path.join(__dirname, '../../frontend/dist')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/dist/index.html'));
});
```

## Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NODE_ENV` | No | `development` | Set to `production` for Railway |
| `PORT` | No | `3000` | Port for the server (Railway sets automatically) |
| `SERPAPI_KEY` | Yes | - | Your SerpAPI key for flight data |
| `DATA_PROVIDER` | No | `mock` | Set to `hybrid` for SerpAPI + scraper |

## Custom Domain (Optional)

### Add Custom Domain

1. In Railway dashboard, go to **Settings** → **Domains**
2. Click **"Add Domain"**
3. Enter your domain (e.g., `flights.yourdomain.com`)
4. Add the provided CNAME record to your DNS provider
5. Wait for DNS propagation (5-30 minutes)

### SSL Certificate

Railway automatically provisions SSL certificates for custom domains via Let's Encrypt.

## Performance Optimization

### Caching Strategy

The app uses in-memory caching with 6-hour TTL to reduce API calls:

```typescript
// Backend caches responses for 6 hours
const TTL = 6 * 60 * 60 * 1000;
```

To adjust cache duration, modify `packages/backend/src/services/cacheService.ts`.

### Monitoring API Usage

Check your SerpAPI dashboard regularly:
- [serpapi.com/account](https://serpapi.com/account)
- Monitor daily usage
- Set up alerts for quota limits

## Support

- **Railway Docs**: https://docs.railway.app
- **SerpAPI Docs**: https://serpapi.com/docs
- **Project Issues**: https://github.com/ramseychad1/swa-flight-finder/issues
