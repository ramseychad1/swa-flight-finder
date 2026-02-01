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

// Flight search endpoint
app.get('/api/flights', async (req: Request, res: Response) => {
  try {
    const params: Partial<SearchParams> = {
      origin: req.query.origin as string,
      from: req.query.from as string,
      to: req.query.to as string,
      sortBy: req.query.sortBy as 'price' | 'destination' | 'date' | undefined
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
