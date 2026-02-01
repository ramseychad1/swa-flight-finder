import { Flight } from '@swa-flight-finder/shared';

export type FlightSource = 'serpapi' | 'southwest' | 'both' | 'mock';

export interface ConsolidatedFlight extends Flight {
  source?: FlightSource;
  fareClass?: string; // "Wanna Get Away", "Anytime", "Business Select"
}

/**
 * Consolidate flights from multiple sources
 */
export function consolidateFlights(
  serpApiFlights: Flight[],
  southwestFlights: Flight[]
): ConsolidatedFlight[] {
  console.log(`\n🔀 Consolidating flights:`);
  console.log(`  → SerpAPI: ${serpApiFlights.length} flights`);
  console.log(`  → Southwest: ${southwestFlights.length} flights`);

  const consolidated: Map<string, ConsolidatedFlight> = new Map();

  // Add SerpAPI flights
  for (const flight of serpApiFlights) {
    const key = getFlightKey(flight);
    consolidated.set(key, {
      ...flight,
      source: 'serpapi',
    });
  }

  // Add or merge Southwest flights
  for (const flight of southwestFlights) {
    const key = getFlightKey(flight);
    const existing = consolidated.get(key);

    if (existing) {
      // Flight exists in both sources
      // Keep the cheaper price
      if (flight.price < existing.price) {
        consolidated.set(key, {
          ...flight,
          source: 'both',
          fareClass: 'Wanna Get Away', // Southwest direct usually has these
        });
      } else {
        // Keep existing but mark as both
        consolidated.set(key, {
          ...existing,
          source: 'both',
        });
      }
    } else {
      // New flight only from Southwest
      consolidated.set(key, {
        ...flight,
        source: 'southwest',
        fareClass: 'Wanna Get Away',
      });
    }
  }

  const result = Array.from(consolidated.values());
  console.log(`  ✓ Consolidated: ${result.length} unique flights`);
  console.log(`    - SerpAPI only: ${result.filter(f => f.source === 'serpapi').length}`);
  console.log(`    - Southwest only: ${result.filter(f => f.source === 'southwest').length}`);
  console.log(`    - Both sources: ${result.filter(f => f.source === 'both').length}\n`);

  return result;
}

/**
 * Generate a unique key for a flight to detect duplicates
 * Based on: flight number, date, time, route
 */
function getFlightKey(flight: Flight): string {
  return `${flight.flightNumber}-${flight.departureDate}-${flight.departureTime}-${flight.origin.code}-${flight.destination.code}`;
}

/**
 * Deduplicate flights that are exact matches
 * Keeps the flight with the lowest price
 */
export function deduplicateFlights(flights: ConsolidatedFlight[]): ConsolidatedFlight[] {
  const seen = new Map<string, ConsolidatedFlight>();

  for (const flight of flights) {
    const key = getFlightKey(flight);
    const existing = seen.get(key);

    if (!existing || flight.price < existing.price) {
      seen.set(key, flight);
    }
  }

  return Array.from(seen.values());
}

/**
 * Sort consolidated flights with source priority
 * Priority: Southwest-only "Wanna Get Away" fares first (cheapest), then by price
 */
export function sortConsolidatedFlights(
  flights: ConsolidatedFlight[],
  sortBy: string = 'price'
): ConsolidatedFlight[] {
  const sorted = [...flights];

  if (sortBy === 'price') {
    sorted.sort((a, b) => {
      // Prioritize Wanna Get Away fares
      if (a.fareClass === 'Wanna Get Away' && b.fareClass !== 'Wanna Get Away') {
        return -1;
      }
      if (b.fareClass === 'Wanna Get Away' && a.fareClass !== 'Wanna Get Away') {
        return 1;
      }

      // Then sort by price
      return a.price - b.price;
    });
  } else if (sortBy === 'destination') {
    sorted.sort((a, b) => a.destination.city.localeCompare(b.destination.city));
  } else if (sortBy === 'date') {
    sorted.sort((a, b) => {
      const dateCompare = a.departureDate.localeCompare(b.departureDate);
      if (dateCompare !== 0) return dateCompare;
      return a.departureTime.localeCompare(b.departureTime);
    });
  }

  return sorted;
}

/**
 * Calculate statistics for consolidated results
 */
export function getConsolidationStats(flights: ConsolidatedFlight[]) {
  return {
    total: flights.length,
    bySource: {
      serpapi: flights.filter(f => f.source === 'serpapi').length,
      southwest: flights.filter(f => f.source === 'southwest').length,
      both: flights.filter(f => f.source === 'both').length,
    },
    wannaGetAway: flights.filter(f => f.fareClass === 'Wanna Get Away').length,
    deals: flights.filter(f => f.isDeal).length,
  };
}
