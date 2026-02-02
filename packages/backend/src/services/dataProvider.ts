import { Flight } from '@swa-flight-finder/shared';
import { generateFlights } from './mockDataService.js';
import { searchRealFlights, calculateDealScores } from './serpApiService.js';
import { scrapeSouthwestFlights } from './southwestScraperService.js';
import { consolidateFlights, sortConsolidatedFlights, getConsolidationStats } from './flightConsolidationService.js';
import { flightCache } from './cacheService.js';

/**
 * Interface for flight data providers
 */
export interface IFlightDataProvider {
  searchFlights(origin: string, from: string, to: string, destinations?: string[]): Promise<{
    flights: Flight[];
    cached: boolean;
    timestamp?: number;
  }>;
}

/**
 * Mock data provider (uses generated data)
 */
class MockFlightProvider implements IFlightDataProvider {
  async searchFlights(_origin: string, from: string, to: string, destinations?: string[]): Promise<{
    flights: Flight[];
    cached: boolean;
    timestamp?: number;
  }> {
    console.log('🎭 Using MOCK data provider');
    const flights = generateFlights(from, to, destinations);
    return {
      flights,
      cached: false,
    };
  }
}

/**
 * Live data provider (uses SerpAPI Google Flights)
 */
class LiveFlightProvider implements IFlightDataProvider {
  async searchFlights(origin: string, from: string, to: string, destinations?: string[]): Promise<{
    flights: Flight[];
    cached: boolean;
    timestamp?: number;
  }> {
    console.log('🌐 Using LIVE data provider (SerpAPI)');
    if (destinations && destinations.length > 0) {
      console.log(`  → Searching ${destinations.length} selected destinations: ${destinations.join(', ')}`);
    }

    // Check cache first
    // Note: Cache key currently doesn't include destinations, so cached results may include all destinations
    const cachedFlights = flightCache.get(origin, from, to);
    if (cachedFlights) {
      const metadata = flightCache.getMetadata(origin, from, to);
      return {
        flights: cachedFlights,
        cached: true,
        timestamp: metadata.timestamp,
      };
    }

    // Fetch fresh data from SerpAPI
    try {
      // For now, search just the start date to conserve API credits
      // Future enhancement: search multiple dates in the range
      const flights = await searchRealFlights(origin, from, to, destinations);

      // Calculate deal scores
      const flightsWithDeals = calculateDealScores(flights);

      // Cache the results
      flightCache.set(origin, from, to, flightsWithDeals);

      return {
        flights: flightsWithDeals,
        cached: false,
        timestamp: Date.now(),
      };
    } catch (error) {
      console.error('❌ Error fetching live flights:', error);

      // Fallback to mock data if API fails
      console.log('⚠️  Falling back to mock data');
      const mockFlights = generateFlights(from, to, destinations);
      return {
        flights: mockFlights,
        cached: false,
      };
    }
  }
}

/**
 * Hybrid data provider (uses both SerpAPI and Southwest scraping)
 */
class HybridFlightProvider implements IFlightDataProvider {
  async searchFlights(origin: string, from: string, to: string, destinations?: string[]): Promise<{
    flights: Flight[];
    cached: boolean;
    timestamp?: number;
  }> {
    console.log('🔀 Using HYBRID data provider (SerpAPI + Southwest scraping)');
    if (destinations && destinations.length > 0) {
      console.log(`  → Searching ${destinations.length} selected destinations: ${destinations.join(', ')}`);
    }

    // Check cache first
    const cachedFlights = flightCache.get(origin, from, to);
    if (cachedFlights) {
      const metadata = flightCache.getMetadata(origin, from, to);
      return {
        flights: cachedFlights,
        cached: true,
        timestamp: metadata.timestamp,
      };
    }

    // Query both sources in parallel
    try {
      console.log('🔄 Querying both SerpAPI and Southwest.com in parallel...');

      const [serpApiFlights, southwestFlights] = await Promise.allSettled([
        searchRealFlights(origin, from, to, destinations).catch(err => {
          console.log('⚠️  SerpAPI query failed:', err.message);
          return [];
        }),
        scrapeSouthwestFlights(origin, from, to).catch(err => {
          console.log('⚠️  Southwest scraping failed:', err.message);
          return [];
        }),
      ]);

      const serpFlights = serpApiFlights.status === 'fulfilled' ? serpApiFlights.value : [];
      const swaFlights = southwestFlights.status === 'fulfilled' ? southwestFlights.value : [];

      // Consolidate results from both sources
      const consolidated = consolidateFlights(serpFlights, swaFlights);

      // Calculate deal scores on consolidated results
      // ConsolidatedFlight extends Flight, so we can pass it to calculateDealScores
      const withDeals = calculateDealScores(consolidated as any);

      // Sort with Wanna Get Away priority
      const sorted = sortConsolidatedFlights(withDeals, 'price');

      // Log stats
      const stats = getConsolidationStats(sorted);
      console.log(`📊 Consolidation stats:`, stats);

      // Cache the results
      flightCache.set(origin, from, to, sorted);

      return {
        flights: sorted,
        cached: false,
        timestamp: Date.now(),
      };
    } catch (error) {
      console.error('❌ Error in hybrid provider:', error);

      // Fallback to mock data if both fail
      console.log('⚠️  Falling back to mock data');
      const mockFlights = generateFlights(from, to);
      return {
        flights: mockFlights,
        cached: false,
      };
    }
  }
}

/**
 * Factory to create the appropriate data provider based on configuration
 */
export function createFlightProvider(): IFlightDataProvider {
  const provider = process.env.DATA_PROVIDER || 'mock';

  console.log(`🏭 Creating flight provider: ${provider.toUpperCase()}`);

  switch (provider.toLowerCase()) {
    case 'hybrid':
      return new HybridFlightProvider();
    case 'live':
      return new LiveFlightProvider();
    case 'mock':
    default:
      return new MockFlightProvider();
  }
}
