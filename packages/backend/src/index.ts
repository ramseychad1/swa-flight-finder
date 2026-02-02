import dotenv from 'dotenv';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables from .env file
dotenv.config({ path: '../../.env' });
import { searchFlights, validateSearchParams } from './services/flightService.js';
import type { SearchParams, HealthResponse, ErrorResponse } from '@swa-flight-finder/shared';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response<HealthResponse>) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

// SerpAPI account usage endpoint
app.get('/api/serpapi-usage', async (_req: Request, res: Response) => {
  try {
    const { getSerpApiAccountInfo, calculateUsagePercentage } = await import('./services/serpApiAccountService.js');
    const accountInfo = await getSerpApiAccountInfo();

    if (!accountInfo) {
      return res.status(500).json({
        error: 'Unable to fetch SerpAPI account information'
      });
    }

    res.json({
      plan: accountInfo.plan_name,
      monthlyLimit: accountInfo.searches_per_month,
      usedThisMonth: accountInfo.this_month_usage,
      remaining: accountInfo.total_searches_left,
      usagePercentage: calculateUsagePercentage(accountInfo),
      hourlyRateLimit: accountInfo.account_rate_limit_per_hour,
      lastHourUsage: accountInfo.last_hour_searches,
    });
  } catch (error) {
    console.error('❌ Error in /api/serpapi-usage:', error);
    res.status(500).json({
      error: 'Failed to fetch account usage',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Cache stats endpoint (for debugging)
app.get('/api/cache-stats', async (_req: Request, res: Response) => {
  try {
    const { flightCache } = await import('./services/cacheService.js');
    const stats = flightCache.getStats();

    res.json({
      cacheSize: stats.size,
      cachedKeys: stats.entries,
      ttl: '6 hours',
    });
  } catch (error) {
    console.error('❌ Error in /api/cache-stats:', error);
    res.status(500).json({
      error: 'Failed to fetch cache stats',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Clear cache endpoint (for debugging)
app.post('/api/clear-cache', async (_req: Request, res: Response) => {
  try {
    const { flightCache } = await import('./services/cacheService.js');
    flightCache.clear();

    res.json({
      success: true,
      message: 'Cache cleared successfully'
    });
  } catch (error) {
    console.error('❌ Error in /api/clear-cache:', error);
    res.status(500).json({
      error: 'Failed to clear cache',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Debug endpoint to see raw SerpAPI response
app.get('/api/debug-serpapi', async (req: Request, res: Response) => {
  try {
    const { getJson } = await import('serpapi');
    const SERPAPI_KEY = process.env.SERPAPI_KEY;

    if (!SERPAPI_KEY) {
      return res.status(500).json({ error: 'SerpAPI key not configured' });
    }

    // Use date 10 days from now to ensure future flights
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 10);
    const dateStr = futureDate.toISOString().split('T')[0];

    const params = {
      engine: 'google_flights',
      departure_id: 'CMH',
      arrival_id: req.query.destination || 'LAS',
      outbound_date: req.query.date || dateStr,
      type: '2', // One-way
      currency: 'USD',
      hl: 'en',
      api_key: SERPAPI_KEY,
    };

    console.log('\n🔍 DEBUG: SerpAPI Request Parameters:', JSON.stringify(params, null, 2));

    const response = await getJson(params);

    console.log('\n📦 DEBUG: Raw SerpAPI Response:');
    console.log('  - search_metadata:', response.search_metadata);
    console.log('  - flights array length:', response.flights?.length || 0);

    if (response.flights && response.flights.length > 0) {
      console.log('\n✈️  DEBUG: First 3 flights:');
      response.flights.slice(0, 3).forEach((flight: any, i: number) => {
        console.log(`\n  Flight ${i + 1}:`);
        console.log('    - airline:', flight.airline);
        console.log('    - airline_logo:', flight.airline_logo);
        console.log('    - flight_number:', flight.flight_number);
        console.log('    - price:', flight.price);
        console.log('    - departure_airport:', flight.departure_airport);
        console.log('    - arrival_airport:', flight.arrival_airport);
        console.log('    - All fields:', Object.keys(flight));
      });
    }

    res.json({
      request_params: params,
      response_metadata: response.search_metadata,
      total_flights: response.flights?.length || 0,
      flights: response.flights || [],
      raw_response: response,
    });
  } catch (error) {
    console.error('❌ DEBUG: Error calling SerpAPI:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error,
    });
  }
});

// Flight search endpoint
app.get('/api/flights', async (req: Request, res: Response) => {
  try {
    // Parse destinations (can be comma-separated string or array)
    let destinations: string[] | undefined;
    if (req.query.destinations) {
      if (typeof req.query.destinations === 'string') {
        destinations = req.query.destinations.split(',').filter(d => d.trim());
      } else if (Array.isArray(req.query.destinations)) {
        destinations = req.query.destinations as string[];
      }
    }

    const params: Partial<SearchParams> = {
      origin: req.query.origin as string,
      from: req.query.from as string,
      to: req.query.to as string,
      sortBy: req.query.sortBy as 'price' | 'destination' | 'date' | undefined,
      destinations
    };

    // Validate parameters
    const validation = validateSearchParams(params);
    if (!validation.valid) {
      const errorResponse: ErrorResponse = {
        error: 'Validation Error',
        message: validation.errors.join(', '),
        statusCode: 400
      };
      return res.status(400).json(errorResponse);
    }

    // Search flights (now async)
    const result = await searchFlights(params as SearchParams);
    res.json(result);
  } catch (error) {
    console.error('Error searching flights:', error);
    const errorResponse: ErrorResponse = {
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      statusCode: 500
    };
    res.status(500).json(errorResponse);
  }
});

// Serve frontend static files in production
if (process.env.NODE_ENV === 'production') {
  const frontendDistPath = path.join(__dirname, '../../frontend/dist');
  app.use(express.static(frontendDistPath));

  // SPA fallback - serve index.html for all non-API routes
  app.get('*', (_req: Request, res: Response) => {
    res.sendFile(path.join(frontendDistPath, 'index.html'));
  });
}

// Error handling middleware
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled error:', err);
  const errorResponse: ErrorResponse = {
    error: 'Internal Server Error',
    message: err.message || 'Something went wrong',
    statusCode: 500
  };
  res.status(500).json(errorResponse);
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}/api`);
  console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
});

export default app;
