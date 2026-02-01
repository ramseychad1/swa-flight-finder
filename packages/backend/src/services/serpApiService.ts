import { getJson } from 'serpapi';
import { Flight, CMH, getAirport } from '@swa-flight-finder/shared';

interface SerpApiFlightResult {
  flights?: Array<{
    departure_airport?: { id?: string; name?: string };
    arrival_airport?: { id?: string; name?: string };
    departure_token?: string;
    price?: number;
    airline?: string;
    airline_logo?: string;
    travel_class?: string;
    flight_number?: string;
    legroom?: string;
    extensions?: string[];
    overnight?: boolean;
    duration?: number; // minutes
    stops?: number;
    departure_time?: string;
    arrival_time?: string;
    departure_date?: string;
    arrival_date?: string;
  }>;
  search_metadata?: {
    created_at?: string;
    status?: string;
  };
  search_parameters?: any;
}

/**
 * Searches for real Southwest Airlines flights using SerpAPI Google Flights
 */
export async function searchRealFlights(
  origin: string,
  dateFrom: string,
  dateTo: string
): Promise<Flight[]> {
  const SERPAPI_KEY = process.env.SERPAPI_KEY;

  if (!SERPAPI_KEY) {
    throw new Error('SerpAPI key not configured. Please set SERPAPI_KEY environment variable.');
  }

  console.log(`🔍 Searching flights from ${origin} between ${dateFrom} and ${dateTo}`);

  const allFlights: Flight[] = [];

  // Get all possible destinations from our airport list
  const destinations = getDestinationsFromAirports();

  // Search each destination individually (more reliable than multi-destination)
  // Note: We'll search the start date for each destination to get current pricing
  // For date ranges, we could expand this to multiple dates, but that uses more API credits
  for (const destCode of destinations) {
    try {
      const flights = await searchFlightsByDestination(origin, destCode, dateFrom);
      allFlights.push(...flights);
    } catch (error) {
      console.error(`Error searching ${origin}-${destCode}:`, error instanceof Error ? error.message : 'Unknown error');
      // Continue with other destinations even if one fails
    }
  }

  console.log(`✅ Found ${allFlights.length} total flights`);

  return allFlights;
}

/**
 * Search flights for a specific origin-destination pair
 */
async function searchFlightsByDestination(
  origin: string,
  destination: string,
  date: string
): Promise<Flight[]> {
  const SERPAPI_KEY = process.env.SERPAPI_KEY;

  try {
    const params = {
      engine: 'google_flights',
      departure_id: origin,
      arrival_id: destination,
      outbound_date: date,
      type: '2', // One-way (2 = one-way, 1 = round-trip)
      currency: 'USD',
      hl: 'en',
      api_key: SERPAPI_KEY,
    };

    console.log(`  → Searching ${origin} to ${destination} on ${date}`);

    const response = await getJson(params) as SerpApiFlightResult;

    if (!response.flights || response.flights.length === 0) {
      console.log(`  ✗ No flights found for ${destination}`);
      return [];
    }

    // Filter for Southwest Airlines only
    const southwestFlights = response.flights.filter(flight => {
      const airline = flight.airline?.toLowerCase() || '';
      return airline.includes('southwest');
    });

    if (southwestFlights.length === 0) {
      console.log(`  ✗ No Southwest flights to ${destination}`);
      return [];
    }

    console.log(`  ✓ Found ${southwestFlights.length} Southwest flights to ${destination}`);

    // Convert to our Flight format
    const flights = southwestFlights.map((flight, index) =>
      convertSerpApiFlightToFlight(flight, origin, destination, date, index)
    ).filter(f => f !== null) as Flight[];

    return flights;
  } catch (error) {
    console.error(`Error fetching flights for ${destination}:`, error);
    throw error;
  }
}

/**
 * Convert SerpAPI flight result to our Flight type
 */
function convertSerpApiFlightToFlight(
  serpFlight: any,
  originCode: string,
  destCode: string,
  searchDate: string,
  index: number
): Flight | null {
  try {
    const origin = originCode === 'CMH' ? CMH : getAirport(originCode);
    const destination = getAirport(destCode);

    if (!origin || !destination) {
      console.warn(`Unknown airport: ${originCode} or ${destCode}`);
      return null;
    }

    // Extract price (convert from dollars to cents)
    const price = serpFlight.price ? Math.round(serpFlight.price * 100) : 0;

    // Parse times
    const departureTime = serpFlight.departure_time || '00:00';
    const arrivalTime = serpFlight.arrival_time || '00:00';

    // Use search date as departure date (SerpAPI sometimes doesn't return explicit dates)
    const departureDate = searchDate;

    // Calculate arrival date (handle overnight flights)
    let arrivalDate = searchDate;
    if (serpFlight.overnight) {
      const nextDay = new Date(searchDate);
      nextDay.setDate(nextDay.getDate() + 1);
      arrivalDate = nextDay.toISOString().split('T')[0];
    }

    // Extract duration (in minutes)
    const duration = serpFlight.duration || 120;

    // Extract flight number
    const flightNumber = serpFlight.flight_number || 'WN XXXX';

    // Number of stops
    const stops = serpFlight.stops || 0;

    const flight: Flight = {
      id: `${destCode}-${searchDate}-${index}`,
      flightNumber,
      origin,
      destination,
      departureDate,
      departureTime,
      arrivalDate,
      arrivalTime,
      price,
      duration,
      stops,
      isDeal: false, // Will be calculated later
      dealScore: 0,
    };

    return flight;
  } catch (error) {
    console.error('Error converting flight:', error);
    return null;
  }
}

/**
 * Get list of destination airport codes to search
 * Using a subset of popular destinations to conserve API credits
 */
function getDestinationsFromAirports(): string[] {
  // Popular Southwest destinations from CMH
  // Limiting to top destinations to conserve API usage
  return [
    'MDW', // Chicago
    'BWI', // Baltimore
    'DCA', // Washington DC
    'LAS', // Las Vegas
    'MCO', // Orlando
    'FLL', // Fort Lauderdale
    'TPA', // Tampa
    'DEN', // Denver
    'PHX', // Phoenix
    'LAX', // Los Angeles
    'SAN', // San Diego
    'DAL', // Dallas
    'HOU', // Houston
    'AUS', // Austin
    'BNA', // Nashville
  ];
}

/**
 * Calculate deal scores for flights (same logic as mock data)
 */
export function calculateDealScores(flights: Flight[]): Flight[] {
  // Group flights by destination
  const byDestination = new Map<string, Flight[]>();

  for (const flight of flights) {
    const dest = flight.destination.code;
    if (!byDestination.has(dest)) {
      byDestination.set(dest, []);
    }
    byDestination.get(dest)!.push(flight);
  }

  // Calculate scores for each destination group
  for (const [_, destFlights] of byDestination) {
    const prices = destFlights.map(f => f.price).sort((a, b) => a - b);

    for (const flight of destFlights) {
      const percentile = prices.indexOf(flight.price) / prices.length;
      flight.dealScore = Math.round((1 - percentile) * 100);
      flight.isDeal = flight.dealScore >= 80; // Top 20%
    }
  }

  return flights;
}
