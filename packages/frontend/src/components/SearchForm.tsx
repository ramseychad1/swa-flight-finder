import { useState, FormEvent } from 'react';
import type { SearchParams } from '@swa-flight-finder/shared';
import { DEFAULT_DESTINATIONS } from '@swa-flight-finder/shared';
import { DestinationSelector } from './DestinationSelector';

interface SearchFormProps {
  onSearch: (params: SearchParams) => void;
  isLoading: boolean;
}

export function SearchForm({ onSearch, isLoading }: SearchFormProps) {
  const [origin] = useState('CMH');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [sortBy, setSortBy] = useState<'price' | 'destination' | 'date'>('price');
  const [selectedDestinations, setSelectedDestinations] = useState<string[]>(DEFAULT_DESTINATIONS);

  // Set default dates (tomorrow and 2 weeks from now)
  const getDefaultDates = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const twoWeeksLater = new Date();
    twoWeeksLater.setDate(twoWeeksLater.getDate() + 14);

    return {
      from: tomorrow.toISOString().split('T')[0],
      to: twoWeeksLater.toISOString().split('T')[0]
    };
  };

  // Initialize with default dates if empty
  if (!fromDate || !toDate) {
    const defaults = getDefaultDates();
    if (!fromDate) setFromDate(defaults.from);
    if (!toDate) setToDate(defaults.to);
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!fromDate || !toDate) {
      alert('Please select both from and to dates');
      return;
    }

    if (fromDate > toDate) {
      alert('From date must be before or equal to To date');
      return;
    }

    if (selectedDestinations.length === 0) {
      alert('Please select at least one destination');
      return;
    }

    onSearch({
      origin,
      from: fromDate,
      to: toDate,
      sortBy,
      destinations: selectedDestinations
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-xl p-6 mb-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Find Low-Fare Flights from Columbus (CMH)
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <label htmlFor="from-date" className="block text-sm font-medium text-gray-700 mb-2">
            From Date
          </label>
          <input
            type="date"
            id="from-date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-swa-blue focus:border-transparent"
            required
          />
        </div>

        <div>
          <label htmlFor="to-date" className="block text-sm font-medium text-gray-700 mb-2">
            To Date
          </label>
          <input
            type="date"
            id="to-date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-swa-blue focus:border-transparent"
            required
          />
        </div>

        <div>
          <label htmlFor="sort-by" className="block text-sm font-medium text-gray-700 mb-2">
            Sort By
          </label>
          <select
            id="sort-by"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'price' | 'destination' | 'date')}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-swa-blue focus:border-transparent"
          >
            <option value="price">Price (Low to High)</option>
            <option value="destination">Destination (A-Z)</option>
            <option value="date">Date (Earliest First)</option>
          </select>
        </div>
      </div>

      {/* Destination Selector */}
      <div className="mb-4">
        <DestinationSelector
          selected={selectedDestinations}
          onChange={setSelectedDestinations}
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-swa-blue text-white py-3 px-6 rounded-md font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-swa-blue focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? 'Searching...' : 'Search Flights'}
      </button>
    </form>
  );
}
