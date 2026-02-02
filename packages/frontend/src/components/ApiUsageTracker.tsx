import { useState, useEffect } from 'react';

interface ApiUsageData {
  plan: string;
  monthlyLimit: number;
  usedThisMonth: number;
  remaining: number;
  usagePercentage: number;
  hourlyRateLimit: number;
  lastHourUsage: number;
}

export function ApiUsageTracker() {
  const [usage, setUsage] = useState<ApiUsageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsage = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3000/api/serpapi-usage');

      if (!response.ok) {
        throw new Error('Failed to fetch API usage');
      }

      const data = await response.json();
      setUsage(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching API usage:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsage();
    // Refresh every 30 seconds
    const interval = setInterval(fetchUsage, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !usage) {
    return (
      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-white/70 text-sm">
        Loading API usage...
      </div>
    );
  }

  if (error || !usage) {
    return null; // Don't show if there's an error
  }

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-400';
    if (percentage >= 70) return 'text-yellow-400';
    return 'text-green-400';
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-white">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">SerpAPI Usage</span>
          <span className="text-xs text-white/60">({usage.plan})</span>
        </div>
        <button
          onClick={fetchUsage}
          className="text-xs text-white/60 hover:text-white transition-colors"
          title="Refresh usage"
        >
          ↻ Refresh
        </button>
      </div>

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="flex justify-between text-xs text-white/70 mb-1">
          <span>
            {usage.usedThisMonth.toLocaleString()} / {usage.monthlyLimit.toLocaleString()} searches
          </span>
          <span className={getUsageColor(usage.usagePercentage)}>
            {usage.usagePercentage}% used
          </span>
        </div>
        <div className="w-full bg-white/20 rounded-full h-2">
          <div
            className={`${getProgressColor(usage.usagePercentage)} h-2 rounded-full transition-all duration-300`}
            style={{ width: `${Math.min(usage.usagePercentage, 100)}%` }}
          />
        </div>
      </div>

      {/* Remaining */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-white/70">Remaining:</span>
        <span className={`font-bold ${getUsageColor(usage.usagePercentage)}`}>
          {usage.remaining.toLocaleString()} searches
        </span>
      </div>

      {/* Hourly Rate Info */}
      {usage.lastHourUsage > 0 && (
        <div className="mt-2 pt-2 border-t border-white/20 text-xs text-white/60">
          Last hour: {usage.lastHourUsage} / {usage.hourlyRateLimit} searches
        </div>
      )}
    </div>
  );
}
