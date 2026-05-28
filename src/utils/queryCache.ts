interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const store = new Map<string, CacheEntry<unknown>>();
const inflight = new Map<string, Promise<unknown>>();
const LS_PREFIX = 'kiroku_c_';

// Pre-warm memory cache from localStorage at import time so getCachedSync works immediately
try {
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k?.startsWith(LS_PREFIX)) {
      const raw = localStorage.getItem(k);
      if (raw) store.set(k.slice(LS_PREFIX.length), JSON.parse(raw) as CacheEntry<unknown>);
    }
  }
} catch { /* localStorage not available */ }

/** Synchronous read — returns data only if present and fresh. */
export function getCachedSync<T>(key: string, ttl: number): T | null {
  const hit = store.get(key) as CacheEntry<T> | undefined;
  return hit && Date.now() - hit.timestamp < ttl ? hit.data : null;
}

/**
 * Async cache-aside with optional localStorage persistence.
 * - Deduplicates concurrent requests for the same key.
 * - Returns stale data only when fresh fetch fails (stale-while-error).
 */
export async function cachedFetch<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl = 5 * 60 * 1000,
  persist = false,
): Promise<T> {
  const hit = store.get(key) as CacheEntry<T> | undefined;
  if (hit && Date.now() - hit.timestamp < ttl) return hit.data;

  if (inflight.has(key)) return inflight.get(key) as Promise<T>;

  const promise = fetcher()
    .then(data => {
      const entry: CacheEntry<T> = { data, timestamp: Date.now() };
      store.set(key, entry);
      if (persist) {
        try { localStorage.setItem(LS_PREFIX + key, JSON.stringify(entry)); } catch { /* quota */ }
      }
      inflight.delete(key);
      return data;
    })
    .catch(err => {
      inflight.delete(key);
      // Return stale data rather than throwing if we have something
      if (hit) return hit.data;
      throw err;
    });

  inflight.set(key, promise);
  return promise;
}

export function invalidateCache(key: string) {
  store.delete(key);
  try { localStorage.removeItem(LS_PREFIX + key); } catch { /* noop */ }
}

export function invalidateCachePrefix(prefix: string) {
  for (const k of [...store.keys()]) {
    if (k.startsWith(prefix)) {
      store.delete(k);
      try { localStorage.removeItem(LS_PREFIX + k); } catch { /* noop */ }
    }
  }
}
