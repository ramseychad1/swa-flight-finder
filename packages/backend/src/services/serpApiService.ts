import { getJson } from 'serpapi';
import { Flight, CMH, getAirport } from '@swa-flight-finder/shared';

interface SerpApiFlightLeg {
  departure_airport?: { id?: string; name?: string; time?: string };
  arrival_airport?: { id?: string; name?: string; time?: string };
  duration?: number; // minutes
  airline?: string;
  airline_logo?: string;
  travel_class?: string;
  flight_number?: string;
  legroom?: string;
  extensions?: string[];
  airplane?: string;
}

interface SerpApiBestFlight {
  flights: SerpApiFlightLeg[]; // Array of flight legs (e.g., layovers)
  layovers?: Array<{ duration?: number; name?: string; id?: string }>;
  total_duration?: number;
  price?: number;
  type?: string;
  airline_logo?: string;
  carbon_emissions?: any;
  extensions?: string[];
  booking_token?: string;
  overnight?: boolean;
}

interface SerpApiFlightResult {
  best_flights?: SerpApiBestFlight[];
  other_flights?: SerpApiBestFlight[];
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

    // Combine best_flights and other_flights arrays
    const allFlightOptions = [
      ...(response.best_flights || []),
      ...(response.other_flights || []),
    ];

    if (allFlightOptions.length === 0) {
      console.log(`  ✗ No flights found for ${destination}`);
      return [];
    }

    console.log(`  → Found ${allFlightOptions.length} flight options for ${destination}`);

    // DEBUG: Log all unique airlines in the response
    const allLegs = allFlightOptions.flatMap(option => option.flights || []);
    const uniqueAirlines = new Set(allLegs.map(f => f.airline).filter(Boolean));
    console.log(`  → Airlines in response: ${Array.from(uniqueAirlines).join(', ')}`);

    // Filter for Southwest Airlines flights
    // A flight option is Southwest if ANY of its legs are Southwest
    const southwestFlightOptions = allFlightOptions.filter(option => {
      return (option.flights || []).some(leg => {
        const airline = leg.airline?.toLowerCase() || '';
        const flightNumber = leg.flight_number?.toLowerCase() || '';

        // Check for Southwest in airline name or WN in flight number
        return airline.includes('southwest') ||
               airline.includes('wn') ||
               flightNumber.startsWith('wn');
      });
    });

    if (southwestFlightOptions.length === 0) {
      console.log(`  ✗ No Southwest flights to ${destination} (checked ${allFlightOptions.length} options)`);
      return [];
    }

    console.log(`  ✓ Found ${southwestFlightOptions.length} Southwest flight options to ${destination}`);

    // Convert to our Flight format
    const flights = southwestFlightOptions.map((flightOption, index) =>
      convertSerpApiFlightToFlight(flightOption, origin, destination, date, index)
    ).filter(f => f !== null) as Flight[];

    return flights;
  } catch (error) {
    console.error(`Error fetching flights for ${destination}:`, error);
    throw error;
  }
}

/**
 * Convert SerpAPI flight option to our Flight type
 */
function convertSerpApiFlightToFlight(
  flightOption: SerpApiBestFlight,
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
    const price = flightOption.price ? Math.round(flightOption.price * 100) : 0;

    // Get first and last legs for departure/arrival info
    const firstLeg = flightOption.flights?.[0];
    const lastLeg = flightOption.flights?.[flightOption.flights.length - 1];

    if (!firstLeg || !lastLeg) {
      console.warn('Flight option has no legs');
      return null;
    }

    // Parse departure time from first leg
    const departureTimeStr = firstLeg.departure_airport?.time || '';
    const departureTime = departureTimeStr.split(' ')[1] || '00:00';

    // Parse arrival time from last leg
    const arrivalTimeStr = lastLeg.arrival_airport?.time || '';
    const arrivalTime = arrivalTimeStr.split(' ')[1] || '00:00';

    // Extract dates from timestamps
    const departureDate = departureTimeStr.split(' ')[0] || searchDate;
    const arrivalDate = arrivalTimeStr.split(' ')[0] || searchDate;

    // Extract duration (in minutes)
    const duration = flightOption.total_duration || 120;

    // Build flight number from all Southwest legs
    const southwestLegs = flightOption.flights.filter(leg => {
      const airline = leg.airline?.toLowerCase() || '';
      return airline.includes('southwest') || airline.includes('wn');
    });

    const flightNumber = southwestLegs.map(leg => leg.flight_number).join(', ') || 'WN XXXX';

    // Number of stops (layovers)
    const stops = (flightOption.layovers || []).length;

    const flight: Flight = {
      id: `serpapi-${destCode}-${searchDate}-${index}`,
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
      source: 'serpapi',
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
