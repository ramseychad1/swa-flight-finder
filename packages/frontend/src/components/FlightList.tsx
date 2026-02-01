import type { Flight } from '@swa-flight-finder/shared';
import { FlightCard } from './FlightCard';
import { formatPrice } from '../utils/formatters';

interface FlightListProps {
  flights: Flight[];
  totalResults: number;
  cheapestPrice: number;
  cached?: boolean;
  timestamp?: number;
  dataSource?: 'mock' | 'live' | 'hybrid';
  sources?: {
    serpapi: number;
    southwest: number;
    both: number;
  };
}

export function FlightList({ flights, totalResults, cheapestPrice, cached, timestamp, dataSource, sources }: FlightListProps) {
  const formatLastUpdated = (ts?: number) => {
    if (!ts) return null;
    const date = new Date(ts);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / 1000 / 60);

    if (diffMinutes < 1) return 'just now';
    if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;

    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
  };
  if (flights.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-white text-xl">No flights found for this date range.</p>
        <p className="text-white/80 mt-2">Try adjusting your search dates.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 bg-white/10 backdrop-blur-sm rounded-lg p-4">
        <div className="flex items-center justify-between text-white mb-4">
          <div>
            <p className="text-sm opacity-80">Total Results</p>
            <p className="text-2xl font-bold">{totalResults}</p>
          </div>
          <div className="text-right">
            <p className="text-sm opacity-80">Cheapest Flight</p>
            <p className="text-2xl font-bold">{formatPrice(cheapestPrice)}</p>
          </div>
        </div>

        {/* Data source and cache info */}
        <div className="flex items-center justify-between text-white/70 text-sm border-t border-white/20 pt-3">
          <div className="flex items-center gap-2">
            {dataSource === 'hybrid' ? (
              <>
                <span className="inline-block w-2 h-2 bg-gradient-to-r from-blue-400 to-orange-400 rounded-full"></span>
                <span>Google Flights + Southwest.com</span>
                {sources && (
                  <span className="ml-2 text-xs">
                    ({sources.serpapi} GF, {sources.southwest} SWA, {sources.both} Both)
                  </span>
                )}
              </>
            ) : dataSource === 'live' ? (
              <>
                <span className="inline-block w-2 h-2 bg-green-400 rounded-full"></span>
                <span>Powered by Google Flights</span>
              </>
            ) : (
              <>
                <span className="inline-block w-2 h-2 bg-blue-400 rounded-full"></span>
                <span>Mock Data (Demo Mode)</span>
              </>
            )}
          </div>
          {cached && timestamp && (
            <div className="text-right">
              <span>Cached • Updated {formatLastUpdated(timestamp)}</span>
            </div>
          )}
          {!cached && (dataSource === 'live' || dataSource === 'hybrid') && (
            <div className="text-right">
              <span>Fresh results</span>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {flights.map((flight) => (
          <FlightCard key={flight.id} flight={flight} />
        ))}
      </div>
    </div>
  );
}
