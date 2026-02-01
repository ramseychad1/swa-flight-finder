import { Airport } from '../types/flight.js';

// Origin airport
export const CMH: Airport = {
  code: 'CMH',
  name: 'John Glenn Columbus International Airport',
  city: 'Columbus',
  state: 'OH'
};

// Popular destinations from Columbus (CMH)
export const AIRPORTS: Record<string, Airport> = {
  CMH,

  // West Coast
  LAX: { code: 'LAX', name: 'Los Angeles International Airport', city: 'Los Angeles', state: 'CA' },
  SAN: { code: 'SAN', name: 'San Diego International Airport', city: 'San Diego', state: 'CA' },
  SFO: { code: 'SFO', name: 'San Francisco International Airport', city: 'San Francisco', state: 'CA' },
  SJC: { code: 'SJC', name: 'Norman Y. Mineta San Jose International Airport', city: 'San Jose', state: 'CA' },
  OAK: { code: 'OAK', name: 'Oakland International Airport', city: 'Oakland', state: 'CA' },
  SEA: { code: 'SEA', name: 'Seattle-Tacoma International Airport', city: 'Seattle', state: 'WA' },
  PDX: { code: 'PDX', name: 'Portland International Airport', city: 'Portland', state: 'OR' },

  // Southwest
  LAS: { code: 'LAS', name: 'Harry Reid International Airport', city: 'Las Vegas', state: 'NV' },
  PHX: { code: 'PHX', name: 'Phoenix Sky Harbor International Airport', city: 'Phoenix', state: 'AZ' },
  DEN: { code: 'DEN', name: 'Denver International Airport', city: 'Denver', state: 'CO' },

  // Southeast
  MCO: { code: 'MCO', name: 'Orlando International Airport', city: 'Orlando', state: 'FL' },
  FLL: { code: 'FLL', name: 'Fort Lauderdale-Hollywood International Airport', city: 'Fort Lauderdale', state: 'FL' },
  TPA: { code: 'TPA', name: 'Tampa International Airport', city: 'Tampa', state: 'FL' },
  MSY: { code: 'MSY', name: 'Louis Armstrong New Orleans International Airport', city: 'New Orleans', state: 'LA' },

  // Texas
  AUS: { code: 'AUS', name: 'Austin-Bergstrom International Airport', city: 'Austin', state: 'TX' },
  DAL: { code: 'DAL', name: 'Dallas Love Field', city: 'Dallas', state: 'TX' },
  HOU: { code: 'HOU', name: 'William P. Hobby Airport', city: 'Houston', state: 'TX' },

  // East Coast
  BWI: { code: 'BWI', name: 'Baltimore/Washington International Thurgood Marshall Airport', city: 'Baltimore', state: 'MD' },
  DCA: { code: 'DCA', name: 'Ronald Reagan Washington National Airport', city: 'Washington', state: 'DC' },

  // Midwest
  MDW: { code: 'MDW', name: 'Chicago Midway International Airport', city: 'Chicago', state: 'IL' },
  BNA: { code: 'BNA', name: 'Nashville International Airport', city: 'Nashville', state: 'TN' }
};

// List of destination codes (excluding CMH)
export const DESTINATION_CODES = Object.keys(AIRPORTS).filter(code => code !== 'CMH');

// Helper function to get airport by code
export function getAirport(code: string): Airport | undefined {
  return AIRPORTS[code];
}

// Helper function to get all destinations
export function getAllDestinations(): Airport[] {
  return DESTINATION_CODES.map(code => AIRPORTS[code]);
}
