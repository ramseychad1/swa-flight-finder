import { useState } from 'react';
import { AVAILABLE_DESTINATIONS } from '@swa-flight-finder/shared';

interface DestinationSelectorProps {
  selected: string[];
  onChange: (destinations: string[]) => void;
}

export function DestinationSelector({ selected, onChange }: DestinationSelectorProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const toggleDestination = (code: string) => {
    if (selected.includes(code)) {
      onChange(selected.filter(d => d !== code));
    } else {
      onChange([...selected, code]);
    }
  };

  const selectTop = (count: number) => {
    const topN = AVAILABLE_DESTINATIONS.slice(0, count).map(d => d.code);
    onChange(topN);
  };

  const selectAll = () => {
    onChange(AVAILABLE_DESTINATIONS.map(d => d.code));
  };

  const clearAll = () => {
    onChange([]);
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-gray-900">
            Destinations
          </h3>
          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded">
            {selected.length} selected ({selected.length > 0 ? `~${selected.length} API calls` : '0 calls'})
          </span>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          {isExpanded ? 'Hide' : 'Show'} Options
        </button>
      </div>

      {/* Quick Select Buttons */}
      {isExpanded && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => selectTop(1)}
              className="px-3 py-1 text-xs font-medium bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
            >
              Top 1
            </button>
            <button
              onClick={() => selectTop(5)}
              className="px-3 py-1 text-xs font-medium bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
            >
              Top 5
            </button>
            <button
              onClick={() => selectTop(10)}
              className="px-3 py-1 text-xs font-medium bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
            >
              Top 10
            </button>
            <button
              onClick={() => selectTop(15)}
              className="px-3 py-1 text-xs font-medium bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
            >
              Top 15
            </button>
            <button
              onClick={selectAll}
              className="px-3 py-1 text-xs font-medium bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
            >
              All (20)
            </button>
            <button
              onClick={clearAll}
              className="px-3 py-1 text-xs font-medium bg-white border border-red-300 text-red-600 rounded hover:bg-red-50 transition-colors"
            >
              Clear
            </button>
          </div>

          {/* Individual Checkboxes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-64 overflow-y-auto">
            {AVAILABLE_DESTINATIONS.map((dest) => (
              <label
                key={dest.code}
                className="flex items-center gap-2 p-2 hover:bg-white rounded cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selected.includes(dest.code)}
                  onChange={() => toggleDestination(dest.code)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">
                  <span className="font-semibold">{dest.code}</span> - {dest.name}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
