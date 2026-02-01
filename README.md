# Southwest Flight Finder

A web application for finding low-fare Southwest Airlines flights from Columbus, Ohio (CMH) with flexible date range search.

![Flight Finder Screenshot](https://via.placeholder.com/800x400?text=Southwest+Flight+Finder)

## Features

- 🔍 **Flexible Date Search** - Search flights across any date range
- 💰 **Price Sorting** - View all destinations sorted by price (lowest first)
- 🎯 **Deal Highlighting** - Automatically identifies the best deals (top 20% prices)
- 📱 **Mobile Responsive** - Works perfectly on all devices
- ⚡ **Fast Loading** - Optimized performance with React Query caching
- 🎨 **Clean UI** - Modern, intuitive interface with Tailwind CSS

## Tech Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first styling
- **TanStack Query** - Server state management and caching

### Backend
- **Node.js 20+** - Runtime
- **Express** - Web framework
- **TypeScript** - Type safety
- **CORS** - Cross-origin support

### Architecture
- **Monorepo** - pnpm workspaces with shared types
- **Mock Data** - Realistic flight generation (ready for real data integration)

## Getting Started

### Prerequisites

- Node.js 20 or higher
- pnpm (will be installed automatically if using npm)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/swa-flight-finder.git
cd swa-flight-finder
```

2. Install pnpm (if not already installed):
```bash
npm install -g pnpm
```

3. Install dependencies:
```bash
pnpm install
```

4. Build all packages:
```bash
pnpm build
```

### Development

Run both frontend and backend in development mode:

```bash
pnpm dev
```

This will start:
- Backend API at http://localhost:3000
- Frontend at http://localhost:5173

Or run them separately:

```bash
# Backend only
pnpm dev:backend

# Frontend only
pnpm dev:frontend
```

## Project Structure

```
swa-flight-finder/
├── packages/
│   ├── shared/              # Shared TypeScript types
│   │   └── src/
│   │       ├── types/       # Flight, Airport, API types
│   │       └── constants/   # Airport data (20 destinations)
│   │
│   ├── backend/             # Express API server
│   │   └── src/
│   │       ├── index.ts     # Server entry point
│   │       ├── routes/      # API routes
│   │       ├── services/    # Business logic
│   │       │   ├── mockDataService.ts    # Flight generation
│   │       │   └── flightService.ts      # Search/filter/sort
│   │       └── data/
│   │           └── routes.json           # Base route data
│   │
│   └── frontend/            # React application
│       └── src/
│           ├── App.tsx              # Main component
│           ├── components/          # React components
│           ├── hooks/               # Custom hooks
│           └── utils/               # Helper functions
│
├── package.json             # Root package config
├── pnpm-workspace.yaml      # Workspace configuration
└── railway.json             # Railway deployment config
```

## API Documentation

### Base URL
- Development: `http://localhost:3000/api`
- Production: `https://your-app.railway.app/api`

### Endpoints

#### Health Check
```
GET /api/health
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2024-03-15T10:30:00.000Z"
}
```

#### Search Flights
```
GET /api/flights?origin=CMH&from=2024-03-15&to=2024-03-30&sortBy=price
```

Query Parameters:
- `origin` (required) - Airport code (e.g., "CMH")
- `from` (required) - Start date (YYYY-MM-DD)
- `to` (required) - End date (YYYY-MM-DD)
- `sortBy` (optional) - Sort order: "price", "destination", or "date" (default: "price")

Response:
```json
{
  "flights": [
    {
      "id": "MDW-2024-03-15-0",
      "flightNumber": "WN 1234",
      "origin": { "code": "CMH", "name": "...", "city": "Columbus", "state": "OH" },
      "destination": { "code": "MDW", "name": "...", "city": "Chicago", "state": "IL" },
      "departureDate": "2024-03-15",
      "departureTime": "08:30",
      "arrivalDate": "2024-03-15",
      "arrivalTime": "09:45",
      "price": 9900,
      "duration": 75,
      "stops": 0,
      "isDeal": true,
      "dealScore": 95
    }
  ],
  "meta": {
    "totalResults": 145,
    "dateRange": { "from": "2024-03-15", "to": "2024-03-30" },
    "origin": "CMH",
    "cheapestPrice": 9900,
    "averagePrice": 15600,
    "priceRange": { "min": 9900, "max": 25900 }
  }
}
```

## Mock Data

The application currently uses mock data with realistic flight generation:

### 20 Destinations from CMH
- **West Coast**: LAX, SAN, SFO, SJC, OAK, SEA, PDX
- **Southwest**: LAS, PHX, DEN
- **Southeast**: MCO, FLL, TPA, MSY
- **Texas**: AUS, DAL, HOU
- **East Coast**: BWI, DCA
- **Midwest**: MDW, BNA

### Pricing Algorithm
Mock prices are calculated using:
- Base price by route (distance-based)
- Day of week modifier (+10% for Fri/Sun)
- Advance booking modifier (+25% if < 7 days)
- Time of day modifier (-10% for early/late flights)
- Random variation (±15%)

### Deal Detection
Flights are marked as "deals" if their price is in the top 20% (lowest prices) for their destination.

## Deployment

### Deploy to Railway

1. Create a Railway account at [railway.app](https://railway.app)

2. Install Railway CLI:
```bash
npm install -g @railway/cli
```

3. Login and link your project:
```bash
railway login
railway init
```

4. Deploy:
```bash
railway up
```

Railway will automatically:
- Detect the `railway.json` configuration
- Install dependencies with pnpm
- Build all packages
- Start the production server
- Serve both API and frontend

5. Set environment variables (if needed):
```bash
railway variables set NODE_ENV=production
```

### Manual Deployment

For other platforms (Heroku, DigitalOcean, etc.):

1. Build the project:
```bash
pnpm build
```

2. Set environment variables:
```bash
export NODE_ENV=production
export PORT=3000
```

3. Start the server:
```bash
pnpm start
```

The server will serve:
- API endpoints at `/api/*`
- Frontend static files at `/*`

## Future Enhancements

### Phase 2: Real Data Integration
- Implement web scraping module (Puppeteer/Playwright)
- Add data adapter interface for easy provider switching
- Implement caching layer (Redis)
- Add rate limiting

### Phase 3: Advanced Features
- Multi-origin search (search from multiple airports)
- Price tracking and alerts
- Historical price charts
- Flight recommendations based on preferences
- Email notifications for price drops
- Calendar view of prices
- Multi-airline support

### Phase 4: User Features
- User accounts and saved searches
- Favorite routes
- Travel preferences
- Price alerts configuration

## Testing

Run tests (when implemented):
```bash
pnpm test
```

Type checking:
```bash
pnpm type-check
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see LICENSE file for details

## Acknowledgments

- Southwest Airlines for inspiration (not affiliated)
- Tailwind CSS for the excellent styling framework
- TanStack Query for powerful data fetching

## Support

For issues and questions, please open an issue on GitHub.

---

Built with ❤️ using React, TypeScript, and Vite
