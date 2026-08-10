// A simple in-memory cache to simulate Redis.
// In a real environment, this would be replaced with a Redis client.

interface CacheEntry {
  data: any;
  expiry: number;
}

const cacheStore = new Map<string, CacheEntry>();

/**
 * Get data from cache by key
 * @param key Cache key
 * @returns Cached data or null if not found/expired
 */
export const getCache = async (key: string): Promise<any | null> => {
  const entry = cacheStore.get(key);
  if (!entry) return null;

  if (Date.now() > entry.expiry) {
    cacheStore.delete(key);
    return null;
  }

  return entry.data;
};

/**
 * Set data in cache with a time-to-live
 * @param key Cache key
 * @param data Data to cache
 * @param ttlSeconds Time to live in seconds
 */
export const setCache = async (key: string, data: any, ttlSeconds: number = 300): Promise<void> => {
  const expiry = Date.now() + ttlSeconds * 1000;
  cacheStore.set(key, { data, expiry });
};

/**
 * Clear cache by key
 */
export const clearCache = async (key: string): Promise<void> => {
  cacheStore.delete(key);
};
