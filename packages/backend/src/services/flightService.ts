import { Flight, SearchParams, FlightSearchResponse } from '@swa-flight-finder/shared';
import { createFlightProvider, IFlightDataProvider } from './dataProvider.js';

let dataProvider: IFlightDataProvider | null = null;

function getDataProvider(): IFlightDataProvider {
  if (!dataProvider) {
    dataProvider = createFlightProvider();
  }
  return dataProvider;
}

/**
 * Searches for flights based on search parameters
 */
export async function searchFlights(params: SearchParams): Promise<FlightSearchResponse> {
  // Fetch flights using the configured data provider (mock or live)
  const { flights: allFlights, cached, timestamp } = await getDataProvider().searchFlights(
    params.origin || 'CMH',
    params.from,
    params.to,
    params.destinations
  );

  // Filter by origin (if specified and not CMH)
  let flights = allFlights;
  if (params.origin && params.origin !== 'CMH') {
    flights = allFlights.filter(f => f.origin.code === params.origin);
  }

  // Sort flights
  flights = sortFlights(flights, params.sortBy || 'price');

  // Calculate metadata
  const prices = flights.map(f => f.price);
  const providerType = process.env.DATA_PROVIDER || 'mock';
  const dataSource = providerType === 'hybrid' ? 'hybrid' : (providerType === 'live' ? 'live' : 'mock');

  // Calculate source statistics for hybrid mode
  const sources = dataSource === 'hybrid' ? {
    serpapi: flights.filter(f => f.source === 'serpapi').length,
    southwest: flights.filter(f => f.source === 'southwest').length,
    both: flights.filter(f => f.source === 'both').length,
  } : undefined;

  const meta = {
    totalResults: flights.length,
    dateRange: {
      from: params.from,
      to: params.to
    },
    origin: params.origin || 'CMH',
    cheapestPrice: prices.length > 0 ? Math.min(...prices) : 0,
    averagePrice: prices.length > 0 ? Math.round(prices.reduce((sum, p) => sum + p, 0) / prices.length) : 0,
    priceRange: {
      min: prices.length > 0 ? Math.min(...prices) : 0,
      max: prices.length > 0 ? Math.max(...prices) : 0
    },
    cached,
    timestamp,
    dataSource: dataSource as 'mock' | 'live' | 'hybrid',
    sources
  };

  return { flights, meta };
}

/**
 * Sorts flights by the specified field
 */
function sortFlights(flights: Flight[], sortBy: string): Flight[] {
  const sorted = [...flights];

  switch (sortBy) {
    case 'price':
      sorted.sort((a, b) => a.price - b.price);
      break;
    case 'destination':
      sorted.sort((a, b) => a.destination.city.localeCompare(b.destination.city));
      break;
    case 'date':
      sorted.sort((a, b) => {
        const dateCompare = a.departureDate.localeCompare(b.departureDate);
        if (dateCompare !== 0) return dateCompare;
        return a.departureTime.localeCompare(b.departureTime);
      });
      break;
    default:
      // Default to price
      sorted.sort((a, b) => a.price - b.price);
  }

  return sorted;
}

/**
 * Validates search parameters
 */
export function validateSearchParams(params: Partial<SearchParams>): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!params.origin) {
    errors.push('origin is required');
  }

  if (!params.from) {
    errors.push('from date is required');
  } else if (!isValidDate(params.from)) {
    errors.push('from date must be in YYYY-MM-DD format');
  }

  if (!params.to) {
    errors.push('to date is required');
  } else if (!isValidDate(params.to)) {
    errors.push('to date must be in YYYY-MM-DD format');
  }

  if (params.from && params.to && params.from > params.to) {
    errors.push('from date must be before or equal to to date');
  }

  if (params.sortBy && !['price', 'destination', 'date'].includes(params.sortBy)) {
    errors.push('sortBy must be one of: price, destination, date');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validates date format (YYYY-MM-DD)
 */
function isValidDate(dateString: string): boolean {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) return false;

  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
}
