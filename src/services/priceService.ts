// LETHEX Price Service - CoinGecko API with caching
import type { TokenPrice, PriceCache } from '@/types/types';

const COINGECKO_API_BASE = 'https://api.coingecko.com/api/v3';
const CACHE_DURATION = 60000; // 60 seconds cache
const KGS_TO_USD_RATE = 0.0115; // Approximate KGS to USD conversion rate (1 USD ≈ 87 KGS)

class PriceService {
  private cache: PriceCache = {};
  private lastFetchTime = 0;
  private isFetching = false;

  /**
   * Fetch prices for multiple tokens from CoinGecko
   */
  async fetchPrices(coingeckoIds: string[]): Promise<PriceCache> {
    if (this.isFetching) {
      // Return cached data if currently fetching
      return this.cache;
    }

    const now = Date.now();
    if (now - this.lastFetchTime < CACHE_DURATION && Object.keys(this.cache).length > 0) {
      // Return cached data if still fresh
      return this.cache;
    }

    this.isFetching = true;

    try {
      const idsParam = coingeckoIds.join(',');
      const response = await fetch(
        `${COINGECKO_API_BASE}/simple/price?ids=${idsParam}&vs_currencies=usd`
      );

      if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.status}`);
      }

      const data = await response.json();

      // Update cache with new prices
      const newCache: PriceCache = {};
      for (const [coingeckoId, priceData] of Object.entries(data)) {
        const priceUsd = (priceData as { usd?: number }).usd || 0;
        const priceKgs = priceUsd / KGS_TO_USD_RATE;

        // Find symbol from coingeckoId (we'll need to pass this mapping)
        newCache[coingeckoId] = {
          symbol: coingeckoId, // Will be updated by caller
          price_usdt: priceUsd,
          price_kgs: priceKgs,
          last_updated: now,
        };
      }

      this.cache = newCache;
      this.lastFetchTime = now;

      return this.cache;
    } catch (error) {
      console.error('Error fetching prices from CoinGecko:', error);
      // Return cached data on error (fail-safe)
      return this.cache;
    } finally {
      this.isFetching = false;
    }
  }

  /**
   * Get price for a single token by symbol
   */
  getPrice(symbol: string): TokenPrice | null {
    return this.cache[symbol] || null;
  }

  /**
   * Get all cached prices
   */
  getAllPrices(): PriceCache {
    return this.cache;
  }

  /**
   * Clear cache (useful for testing)
   */
  clearCache(): void {
    this.cache = {};
    this.lastFetchTime = 0;
  }
}

export const priceService = new PriceService();
