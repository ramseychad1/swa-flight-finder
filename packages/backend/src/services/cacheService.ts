import { Flight } from '@swa-flight-finder/shared';

interface CacheEntry {
  data: Flight[];
  timestamp: number;
  expiresAt: number;
}

/**
 * Simple in-memory cache for flight search results
 * TTL: 6 hours (21600000 ms)
 */
class FlightCache {
  private cache: Map<string, CacheEntry> = new Map();
  private readonly TTL = 6 * 60 * 60 * 1000; // 6 hours in milliseconds

  /**
   * Generate cache key from search parameters
   */
  private generateKey(origin: string, from: string, to: string): string {
    return `${origin}-${from}-${to}`;
  }

  /**
   * Get cached flights if available and not expired
   */
  get(origin: string, from: string, to: string): Flight[] | null {
    const key = this.generateKey(origin, from, to);
    const entry = this.cache.get(key);

    if (!entry) {
      console.log(`📦 Cache MISS for ${key}`);
      return null;
    }

    const now = Date.now();
    if (now > entry.expiresAt) {
      console.log(`📦 Cache EXPIRED for ${key}`);
      this.cache.delete(key);
      return null;
    }

    const age = Math.round((now - entry.timestamp) / 1000 / 60); // minutes
    console.log(`📦 Cache HIT for ${key} (age: ${age} minutes)`);
    return entry.data;
  }

  /**
   * Store flights in cache
   */
  set(origin: string, from: string, to: string, flights: Flight[]): void {
    const key = this.generateKey(origin, from, to);
    const now = Date.now();

    this.cache.set(key, {
      data: flights,
      timestamp: now,
      expiresAt: now + this.TTL,
    });

    console.log(`📦 Cache SET for ${key} (${flights.length} flights, expires in 6 hours)`);
  }

  /**
   * Get cache metadata for a key
   */
  getMetadata(origin: string, from: string, to: string): { cached: boolean; timestamp?: number } {
    const key = this.generateKey(origin, from, to);
    const entry = this.cache.get(key);

    if (!entry || Date.now() > entry.expiresAt) {
      return { cached: false };
    }

    return {
      cached: true,
      timestamp: entry.timestamp,
    };
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    console.log('📦 Clearing all cache entries');
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getStats(): { size: number; entries: string[] } {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys()),
    };
  }

  /**
   * Clean up expired entries (can be called periodically)
   */
  cleanup(): void {
    const now = Date.now();
    let removed = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
        removed++;
      }
    }

    if (removed > 0) {
      console.log(`📦 Cleaned up ${removed} expired cache entries`);
    }
  }
}

// Singleton instance
export const flightCache = new FlightCache();

// Run cleanup every hour
setInterval(() => {
  flightCache.cleanup();
}, 60 * 60 * 1000);
