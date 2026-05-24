// Lightweight fetch-cache: stale-while-revalidate without an external library.
// Usage:
//   const data = await cachedFetch('key', fetcher, ttl?)

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const store = new Map<string, CacheEntry<unknown>>();
const inflight = new Map<string, Promise<unknown>>();

export async function cachedFetch<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl = 5 * 60 * 1000,
): Promise<T> {
  const hit = store.get(key) as CacheEntry<T> | undefined;
  if (hit && Date.now() - hit.timestamp < ttl) return hit.data;

  if (inflight.has(key)) return inflight.get(key) as Promise<T>;

  const promise = fetcher()
    .then(data => {
      store.set(key, { data, timestamp: Date.now() });
      inflight.delete(key);
      return data;
    })
    .catch(err => {
      inflight.delete(key);
      throw err;
    });

  inflight.set(key, promise);
  return promise;
}

export function invalidateCache(key: string) {
  store.delete(key);
}

export function invalidateCachePrefix(prefix: string) {
  for (const k of store.keys()) {
    if (k.startsWith(prefix)) store.delete(k);
  }
}
