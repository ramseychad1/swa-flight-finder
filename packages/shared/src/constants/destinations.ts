/**
 * Available destination airports from Columbus (CMH)
 * Ordered by popularity/search priority
 * First 15 are the "top" destinations searched by live API to conserve usage
 */
export const AVAILABLE_DESTINATIONS = [
  // Top 15 (searched by live API)
  { code: 'MDW', name: 'Chicago', fullName: 'Chicago Midway International' },
  { code: 'BWI', name: 'Baltimore', fullName: 'Baltimore/Washington International' },
  { code: 'DCA', name: 'Washington DC', fullName: 'Ronald Reagan Washington National' },
  { code: 'LAS', name: 'Las Vegas', fullName: 'Harry Reid International' },
  { code: 'MCO', name: 'Orlando', fullName: 'Orlando International' },
  { code: 'FLL', name: 'Fort Lauderdale', fullName: 'Fort Lauderdale-Hollywood International' },
  { code: 'TPA', name: 'Tampa', fullName: 'Tampa International' },
  { code: 'DEN', name: 'Denver', fullName: 'Denver International' },
  { code: 'PHX', name: 'Phoenix', fullName: 'Phoenix Sky Harbor International' },
  { code: 'LAX', name: 'Los Angeles', fullName: 'Los Angeles International' },
  { code: 'SAN', name: 'San Diego', fullName: 'San Diego International' },
  { code: 'DAL', name: 'Dallas', fullName: 'Dallas Love Field' },
  { code: 'HOU', name: 'Houston', fullName: 'William P. Hobby Airport' },
  { code: 'AUS', name: 'Austin', fullName: 'Austin-Bergstrom International' },
  { code: 'BNA', name: 'Nashville', fullName: 'Nashville International' },
  // Additional destinations (20 total, only available with mock data to save API calls)
  { code: 'SEA', name: 'Seattle', fullName: 'Seattle-Tacoma International' },
  { code: 'PDX', name: 'Portland', fullName: 'Portland International' },
  { code: 'MSY', name: 'New Orleans', fullName: 'Louis Armstrong New Orleans International' },
  { code: 'SJC', name: 'San Jose', fullName: 'Norman Y. Mineta San José International' },
  { code: 'OAK', name: 'Oakland', fullName: 'Oakland International' },
] as const;

export const DEFAULT_DESTINATIONS = AVAILABLE_DESTINATIONS.map(d => d.code);
