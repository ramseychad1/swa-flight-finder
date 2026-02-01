import { Flight, RouteData, getAirport, CMH } from '@swa-flight-finder/shared';
import routesData from '../data/routes.json' with { type: 'json' };

/**
 * Generates mock flights for a given date range
 */
export function generateFlights(fromDate: string, toDate: string): Flight[] {
  const flights: Flight[] = [];
  const routes = routesData as RouteData[];

  const start = new Date(fromDate);
  const end = new Date(toDate);

  // Generate flights for each day in the range
  for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
    const dateStr = date.toISOString().split('T')[0];

    // Generate 1-2 flights per route per day
    for (const route of routes) {
      const flightsPerDay = Math.random() > 0.5 ? 2 : 1;

      for (let i = 0; i < flightsPerDay; i++) {
        const flight = generateFlight(route, dateStr, i);
        flights.push(flight);
      }
    }
  }

  // Calculate deal scores
  return calculateDealScores(flights);
}

/**
 * Generates a single flight for a route and date
 */
function generateFlight(route: RouteData, date: string, index: number): Flight {
  const destination = getAirport(route.destination);
  if (!destination) {
    throw new Error(`Unknown destination: ${route.destination}`);
  }

  // Generate departure time (6am to 10pm)
  const hour = 6 + Math.floor(Math.random() * 16);
  const minute = Math.floor(Math.random() * 4) * 15; // 0, 15, 30, 45
  const departureTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;

  // Calculate arrival time
  const departureDate = new Date(`${date}T${departureTime}:00`);
  const arrivalDate = new Date(departureDate.getTime() + route.duration * 60000);
  const arrivalDateStr = arrivalDate.toISOString().split('T')[0];
  const arrivalTime = arrivalDate.toTimeString().substring(0, 5);

  // Calculate price with variations
  const price = calculatePrice(route, date, departureTime);

  // Generate flight number
  const flightNumber = `WN ${1000 + Math.floor(Math.random() * 8000)}`;

  return {
    id: `${route.destination}-${date}-${index}`,
    flightNumber,
    origin: CMH,
    destination,
    departureDate: date,
    departureTime,
    arrivalDate: arrivalDateStr,
    arrivalTime,
    price,
    duration: route.duration,
    stops: 0, // All nonstop for simplicity
    isDeal: false, // Will be calculated later
    dealScore: 0
  };
}

/**
 * Calculates price with various modifiers
 */
function calculatePrice(route: RouteData, date: string, departureTime: string): number {
  let price = route.basePrice;

  // Day of week modifier
  const dayOfWeek = new Date(date).getDay();
  if (dayOfWeek === 5 || dayOfWeek === 0) { // Friday or Sunday
    price *= 1.10;
  }

  // Advance booking modifier
  const daysUntilFlight = Math.floor((new Date(date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (daysUntilFlight < 7) {
    price *= 1.25;
  } else if (daysUntilFlight < 14) {
    price *= 1.10;
  }

  // Time of day modifier (early morning and late night cheaper)
  const hour = parseInt(departureTime.split(':')[0]);
  if (hour < 8 || hour > 20) {
    price *= 0.90;
  }

  // Random variation (+/- 15%)
  const variation = 0.85 + Math.random() * 0.30;
  price *= variation;

  // Round to nearest $10
  return Math.round(price / 1000) * 1000;
}

/**
 * Calculates deal scores and marks deals
 */
function calculateDealScores(flights: Flight[]): Flight[] {
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
