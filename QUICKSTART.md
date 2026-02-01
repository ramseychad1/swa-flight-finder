# Quick Start Guide

Get the Southwest Flight Finder running in 5 minutes!

## Installation

```bash
# Install pnpm globally
npm install -g pnpm

# Install dependencies
pnpm install

# Build all packages
pnpm build
```

## Run Development Server

```bash
# Start both frontend and backend
pnpm dev
```

Open your browser to:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000/api

## Try It Out

1. The app will open with default dates (tomorrow through 2 weeks)
2. Click "Search Flights" to see results
3. Try different date ranges
4. Change sort order (Price, Destination, Date)
5. Look for "Great Deal!" badges on the cheapest flights

## API Testing

Test the health check:
```bash
curl http://localhost:3000/api/health
```

Search for flights:
```bash
curl "http://localhost:3000/api/flights?origin=CMH&from=2026-03-15&to=2026-03-17&sortBy=price"
```

## Features to Explore

1. **Search Flexibility**
   - Try different date ranges (1 day, 1 week, 1 month)
   - Notice how prices vary by date

2. **Deal Detection**
   - Flights with "Great Deal!" badge are the cheapest 20% for their destination
   - Prices vary by day of week, time of day, and advance booking

3. **Sorting**
   - Price: Lowest to highest (default)
   - Destination: Alphabetical by city
   - Date: Earliest departure first

4. **Destinations**
   - 20 popular destinations from Columbus (CMH)
   - Includes West Coast, Southwest, Southeast, Texas, East Coast, and Midwest

## Mock Data Details

The app generates realistic mock data with:
- **Base prices** by route (distance-based)
- **Day of week pricing** (weekends +10%)
- **Advance booking** (last-minute +25%)
- **Time of day** (early/late flights -10%)
- **Random variation** (±15%)

## Next Steps

1. **Deploy to Railway**: See [DEPLOYMENT.md](DEPLOYMENT.md)
2. **Customize**: Modify components in `packages/frontend/src/components/`
3. **Add features**: Extend the API in `packages/backend/src/`
4. **Real data**: Implement web scraping or find an API

## Troubleshooting

**Port already in use?**
```bash
# Kill process on port 3000
kill -9 $(lsof -ti:3000)

# Kill process on port 5173
kill -9 $(lsof -ti:5173)
```

**Build errors?**
```bash
# Clean and rebuild
rm -rf node_modules packages/*/node_modules packages/*/dist
pnpm install
pnpm build
```

**TypeScript errors?**
```bash
# Check types
pnpm type-check
```

## Development Commands

```bash
# Development (both servers)
pnpm dev

# Backend only
pnpm dev:backend

# Frontend only
pnpm dev:frontend

# Build all packages
pnpm build

# Type checking
pnpm type-check

# Run tests (when added)
pnpm test
```

## Project Structure Overview

```
swa-flight-finder/
├── packages/
│   ├── shared/        # Shared types (Flight, Airport, etc.)
│   ├── backend/       # Express API server
│   └── frontend/      # React + Vite app
├── package.json       # Root config with scripts
└── railway.json       # Deployment config
```

## What's Included

- ✅ Full-stack TypeScript application
- ✅ Mock data service with realistic flight generation
- ✅ React frontend with Tailwind CSS
- ✅ Express backend with RESTful API
- ✅ Monorepo structure with shared types
- ✅ Mobile-responsive design
- ✅ Deal detection algorithm
- ✅ Railway deployment configuration
- ✅ Comprehensive documentation

## Support

Questions or issues? Check:
- [README.md](README.md) - Full documentation
- [DEPLOYMENT.md](DEPLOYMENT.md) - Deployment guide
- GitHub Issues - Report bugs or request features

---

Happy flight finding! ✈️
