export interface Airport {
  code: string;          // "LAX"
  name: string;          // "Los Angeles International Airport"
  city: string;          // "Los Angeles"
  state: string;         // "CA"
}

export interface Flight {
  id: string;
  flightNumber: string;        // "WN 1234"
  origin: Airport;
  destination: Airport;
  departureDate: string;       // ISO8601 date (YYYY-MM-DD)
  departureTime: string;       // "08:30"
  arrivalDate: string;         // ISO8601 date (YYYY-MM-DD)
  arrivalTime: string;         // "12:45"
  price: number;               // USD cents (e.g., 12900 = $129.00)
  duration: number;            // minutes
  stops: number;               // 0 for nonstop, 1+ for connections
  isDeal: boolean;             // Calculated by backend - top 20% best prices
  dealScore?: number;          // 0-100, higher = better deal
  source?: 'serpapi' | 'southwest' | 'both' | 'mock';  // Data source
  fareClass?: string;          // "Wanna Get Away", "Anytime", "Business Select"
}

export interface SearchParams {
  origin: string;              // Airport code, e.g. "CMH"
  from: string;                // Start date YYYY-MM-DD
  to: string;                  // End date YYYY-MM-DD
  sortBy?: 'price' | 'destination' | 'date';
}

export interface RouteData {
  destination: string;         // Airport code
  basePrice: number;           // Base price in cents
  duration: number;            // Flight duration in minutes
  distance: number;            // Distance in miles
  frequency: string;           // "daily", "weekly", etc.
}
