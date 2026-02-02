// Types
export type { Airport, Flight, SearchParams, RouteData } from './types/flight.js';
export type { FlightSearchResponse, HealthResponse, ErrorResponse } from './types/api.js';

// Constants
export {
  AIRPORTS,
  CMH,
  DESTINATION_CODES,
  getAirport,
  getAllDestinations
} from './constants/airports.js';

export {
  AVAILABLE_DESTINATIONS,
  DEFAULT_DESTINATIONS
} from './constants/destinations.js';
