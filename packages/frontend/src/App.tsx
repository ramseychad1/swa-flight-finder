import { useState } from 'react';
import type { SearchParams } from '@swa-flight-finder/shared';
import { SearchForm } from './components/SearchForm';
import { FlightList } from './components/FlightList';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ApiUsageTracker } from './components/ApiUsageTracker';
import { HelpModal } from './components/HelpModal';
import { useFlights } from './hooks/useFlights';

function App() {
  const [searchParams, setSearchParams] = useState<SearchParams | null>(null);
  const [searchId, setSearchId] = useState<number>(0);
  const [showHelp, setShowHelp] = useState(false);
  const { data, isLoading, error } = useFlights(searchParams, searchId);

  const handleSearch = (params: SearchParams) => {
    setSearchParams(params);
    setSearchId(prev => prev + 1); // Force new query
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

        {/* API Usage Tracker & Help Button */}
        <div className="mb-6 flex items-start gap-4">
          <div className="flex-1">
            <ApiUsageTracker />
          </div>
          <button
            onClick={() => setShowHelp(true)}
            className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2 border border-white/20"
            aria-label="Help - How this works"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="hidden sm:inline">How This Works</span>
          </button>
        </div>

        {/* Help Modal */}
        <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} />

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
