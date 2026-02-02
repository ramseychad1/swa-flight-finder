import { useQuery } from '@tanstack/react-query';
import type { SearchParams, FlightSearchResponse } from '@swa-flight-finder/shared';
import { searchFlights } from '../utils/api';

export function useFlights(params: SearchParams | null, searchId: number) {
  return useQuery<FlightSearchResponse>({
    queryKey: ['flights', params?.origin, params?.from, params?.to, params?.sortBy, searchId],
    queryFn: () => {
      if (!params) {
        throw new Error('Search parameters are required');
      }
      return searchFlights(params);
    },
    enabled: params !== null,
    staleTime: 0, // Always consider data stale
    gcTime: 0, // Don't cache at all - always fetch fresh
    refetchOnMount: false, // Don't auto-refetch (we control it with searchId)
    refetchOnWindowFocus: false, // Don't refetch on window focus
  });
}
