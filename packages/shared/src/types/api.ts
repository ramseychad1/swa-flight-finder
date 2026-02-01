import { Flight } from './flight.js';

export interface FlightSearchResponse {
  flights: Flight[];
  meta: {
    totalResults: number;
    dateRange: {
      from: string;
      to: string;
    };
    origin: string;
    cheapestPrice: number;
    averagePrice: number;
    priceRange: {
      min: number;
      max: number;
    };
    cached?: boolean;
    timestamp?: number;
    dataSource?: 'mock' | 'live' | 'hybrid';
    sources?: {
      serpapi: number;
      southwest: number;
      both: number;
    };
  };
}

export interface HealthResponse {
  status: 'ok' | 'error';
  timestamp: string;
}

export interface ErrorResponse {
  error: string;
  message: string;
  statusCode: number;
}
