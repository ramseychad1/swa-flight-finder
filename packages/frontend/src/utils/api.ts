import type { SearchParams, FlightSearchResponse } from '@swa-flight-finder/shared';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export async function searchFlights(params: SearchParams): Promise<FlightSearchResponse> {
  const queryParams = new URLSearchParams({
    origin: params.origin,
    from: params.from,
    to: params.to,
  });

  if (params.sortBy) {
    queryParams.append('sortBy', params.sortBy);
  }

  const response = await fetch(`${API_BASE_URL}/flights?${queryParams}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to search flights');
  }

  return response.json();
}
