import { useQuery } from '@tanstack/react-query';
import type { SearchParams, FlightSearchResponse } from '@swa-flight-finder/shared';
import { searchFlights } from '../utils/api';

export function useFlights(params: SearchParams | null) {
  return useQuery<FlightSearchResponse>({
    queryKey: ['flights', params?.origin, params?.from, params?.to, params?.sortBy],
    queryFn: () => {
      if (!params) {
        throw new Error('Search parameters are required');
      }
      return searchFlights(params);
    },
    enabled: params !== null,
    staleTime: 0, // Always consider data stale
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes (formerly cacheTime)
    refetchOnMount: true, // Always refetch when component mounts
  });
}
