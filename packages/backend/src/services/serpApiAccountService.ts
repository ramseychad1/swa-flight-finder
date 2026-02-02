/**
 * SerpAPI Account Service
 * Queries SerpAPI account usage and remaining credits
 */

interface SerpApiAccountInfo {
  account_id: string;
  api_key_id: string;
  plan_id: string;
  plan_name: string;
  searches_per_month: number;
  total_searches_left: number;
  this_month_usage: number;
  last_hour_searches: number;
  account_rate_limit_per_hour: number;
  plan_searches_left?: number;
  extra_credits?: number;
}

/**
 * Fetch SerpAPI account usage statistics
 * This endpoint is free and doesn't count toward quota
 */
export async function getSerpApiAccountInfo(): Promise<SerpApiAccountInfo | null> {
  const SERPAPI_KEY = process.env.SERPAPI_KEY;

  if (!SERPAPI_KEY) {
    console.warn('⚠️  SerpAPI key not configured');
    return null;
  }

  try {
    const url = `https://serpapi.com/account.json?api_key=${SERPAPI_KEY}`;
    const response = await fetch(url);

    if (!response.ok) {
      console.error(`❌ SerpAPI account endpoint error: ${response.status}`);
      return null;
    }

    const data = await response.json() as SerpApiAccountInfo;

    console.log('📊 SerpAPI Account Info:', {
      plan: data.plan_name,
      monthly_limit: data.searches_per_month,
      used_this_month: data.this_month_usage,
      remaining: data.total_searches_left,
    });

    return data;
  } catch (error) {
    console.error('❌ Error fetching SerpAPI account info:', error);
    return null;
  }
}

/**
 * Calculate usage percentage
 */
export function calculateUsagePercentage(accountInfo: SerpApiAccountInfo): number {
  if (!accountInfo.searches_per_month) return 0;
  return Math.round((accountInfo.this_month_usage / accountInfo.searches_per_month) * 100);
}
