/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { TransitStop, RouteOption } from '../types/transit';
import { findOrCreateRoute } from '../data/mockData';

export interface RouteCacheStats {
  hits: number;
  misses: number;
  totalRequests: number;
  cachedEntriesCount: number;
}

/**
 * Dedicated Routing Service with Caching and Request Throttling.
 * Enforces API rate limits and prevents redundant calculations for identical search queries.
 */
class RoutingService {
  private cache = new Map<string, RouteOption>();
  private inFlightRequests = new Map<string, Promise<RouteOption | null>>();
  private stats: RouteCacheStats = {
    hits: 0,
    misses: 0,
    totalRequests: 0,
    cachedEntriesCount: 0,
  };
  private lastRequestTimestamp = 0;
  private readonly minRequestIntervalMs = 50; // Throttling threshold

  private getCacheKey(
    fromStop: TransitStop | null | undefined,
    toStop: TransitStop | null | undefined,
    saccoId: string,
    isElectricOnly: boolean
  ): string | null {
    if (!fromStop || !toStop) return null;
    return `${fromStop.id}->${toStop.id}|sacco:${saccoId}|electric:${isElectricOnly}`;
  }

  /**
   * Retrieves a road-following route between two stops.
   * Utilizes in-memory caching and deduplicates in-flight calls to prevent redundant calculations and API quota consumption.
   */
  public async getRoute(
    fromStop: TransitStop | null | undefined,
    toStop: TransitStop | null | undefined,
    saccoId = 'all',
    isElectricOnly = false
  ): Promise<RouteOption | null> {
    this.stats.totalRequests++;

    if (!fromStop || !toStop || fromStop.id === toStop.id) {
      return null;
    }

    const key = this.getCacheKey(fromStop, toStop, saccoId, isElectricOnly);
    if (!key) return null;

    // 1. Check in-memory cache
    if (this.cache.has(key)) {
      this.stats.hits++;
      return this.cache.get(key)!;
    }

    // 2. Check in-flight promise deduplication
    if (this.inFlightRequests.has(key)) {
      return this.inFlightRequests.get(key)!;
    }

    // 3. Throttle requests if called too rapidly
    const now = performance.now();
    const elapsed = now - this.lastRequestTimestamp;
    if (elapsed < this.minRequestIntervalMs) {
      await new Promise((resolve) => setTimeout(resolve, this.minRequestIntervalMs - elapsed));
    }
    this.lastRequestTimestamp = performance.now();

    // 4. Compute or fetch route
    const requestPromise = (async () => {
      try {
        this.stats.misses++;
        const route = findOrCreateRoute(fromStop, toStop, saccoId, isElectricOnly);
        if (route) {
          this.cache.set(key, route);
          this.stats.cachedEntriesCount = this.cache.size;
        }
        return route;
      } finally {
        this.inFlightRequests.delete(key);
      }
    })();

    this.inFlightRequests.set(key, requestPromise);
    return requestPromise;
  }

  /**
   * Synchronous cached route resolver for immediate React state derivation
   */
  public getRouteSync(
    fromStop: TransitStop | null | undefined,
    toStop: TransitStop | null | undefined,
    saccoId = 'all',
    isElectricOnly = false
  ): RouteOption | null {
    this.stats.totalRequests++;

    if (!fromStop || !toStop || fromStop.id === toStop.id) {
      return null;
    }

    const key = this.getCacheKey(fromStop, toStop, saccoId, isElectricOnly);
    if (!key) return null;

    if (this.cache.has(key)) {
      this.stats.hits++;
      return this.cache.get(key)!;
    }

    this.stats.misses++;
    const route = findOrCreateRoute(fromStop, toStop, saccoId, isElectricOnly);
    if (route) {
      this.cache.set(key, route);
      this.stats.cachedEntriesCount = this.cache.size;
    }
    return route;
  }

  public getStats(): RouteCacheStats {
    return { ...this.stats };
  }

  public clearCache(): void {
    this.cache.clear();
    this.inFlightRequests.clear();
    this.stats = {
      hits: 0,
      misses: 0,
      totalRequests: 0,
      cachedEntriesCount: 0,
    };
  }
}

export const routingService = new RoutingService();
