import type { Flight } from '@swa-flight-finder/shared';
import { formatPrice, formatDate, formatTime, formatDuration } from '../utils/formatters';

interface FlightCardProps {
  flight: Flight;
}

export function FlightCard({ flight }: FlightCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-xl font-bold text-gray-900">
              {flight.destination.city}, {flight.destination.state}
            </h3>
            {flight.fareClass === 'Wanna Get Away' && (
              <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-semibold rounded">
                Wanna Get Away
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500">{flight.destination.name}</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-swa-blue">
            {formatPrice(flight.price)}
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Excludes taxes & fees
          </p>
          {flight.isDeal && (
            <span className="inline-block mt-1 px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded">
              Great Deal!
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-xs text-gray-500 uppercase">Departure</p>
          <p className="text-sm font-medium text-gray-900">
            {formatDate(flight.departureDate)} at {formatTime(flight.departureTime)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase">Arrival</p>
          <p className="text-sm font-medium text-gray-900">
            {formatDate(flight.arrivalDate)} at {formatTime(flight.arrivalTime)}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <span>{flight.flightNumber}</span>
          <span>•</span>
          <span>{formatDuration(flight.duration)}</span>
          <span>•</span>
          <span>{flight.stops === 0 ? 'Nonstop' : `${flight.stops} stop${flight.stops > 1 ? 's' : ''}`}</span>
        </div>
        {flight.source && (
          <div className="flex items-center gap-1">
            {flight.source === 'serpapi' && (
              <span className="px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded">
                Google Flights
              </span>
            )}
            {flight.source === 'southwest' && (
              <span className="px-2 py-1 bg-orange-50 text-orange-600 text-xs rounded">
                Southwest.com
              </span>
            )}
            {flight.source === 'both' && (
              <span className="px-2 py-1 bg-gradient-to-r from-blue-50 to-orange-50 text-gray-700 text-xs rounded">
                Both Sources
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
