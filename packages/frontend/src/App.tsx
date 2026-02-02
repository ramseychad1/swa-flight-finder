import { useState } from 'react';
import type { SearchParams } from '@swa-flight-finder/shared';
import { SearchForm } from './components/SearchForm';
import { FlightList } from './components/FlightList';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ApiUsageTracker } from './components/ApiUsageTracker';
import { useFlights } from './hooks/useFlights';

function App() {
  const [searchParams, setSearchParams] = useState<SearchParams | null>(null);
  const { data, isLoading, error } = useFlights(searchParams);

  const handleSearch = (params: SearchParams) => {
    setSearchParams(params);
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
            Southwest Flight Finder
          </h1>
          <p className="text-white/90 text-lg">
            Discover the best low-fare flights from Columbus (CMH)
          </p>
        </header>

        {/* API Usage Tracker */}
        <div className="mb-6">
          <ApiUsageTracker />
        </div>

        <SearchForm onSearch={handleSearch} isLoading={isLoading} />

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p className="font-bold">Error</p>
            <p>{error instanceof Error ? error.message : 'Failed to search flights'}</p>
          </div>
        )}

        {isLoading && <LoadingSpinner />}

        {!isLoading && data && (
          <FlightList
            flights={data.flights}
            totalResults={data.meta.totalResults}
            cheapestPrice={data.meta.cheapestPrice}
            cached={data.meta.cached}
            timestamp={data.meta.timestamp}
            dataSource={data.meta.dataSource}
            sources={data.meta.sources}
          />
        )}

        {!isLoading && !data && !error && (
          <div className="text-center py-12">
            <p className="text-white text-lg">
              Enter your travel dates above to search for flights
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
