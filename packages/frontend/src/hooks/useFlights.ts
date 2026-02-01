import { useQuery } from '@tanstack/react-query';
import type { SearchParams, FlightSearchResponse } from '@swa-flight-finder/shared';
import { searchFlights } from '../utils/api';

export function useFlights(params: SearchParams | null) {
  return useQuery<FlightSearchResponse>({
    queryKey: ['flights', params],
    queryFn: () => {
      if (!params) {
        throw new Error('Search parameters are required');
      }
      return searchFlights(params);
    },
    enabled: params !== null,
  });
}
