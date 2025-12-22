/*
 * LICENSE
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

const accessCache = new Map<string, { value: boolean; expiresAt: number }>();
const CACHE_TTL_MS = 60_000;
const MAX_CACHE_SIZE = 10_000;
const CLEANUP_THRESHOLD = MAX_CACHE_SIZE * 0.9;

const evictOldestCacheEntries = () => {
  if (accessCache.size < MAX_CACHE_SIZE) {
    return;
  }

  const now = Date.now();
  accessCache.forEach((entry, key) => {
    if (entry.expiresAt <= now) {
      accessCache.delete(key);
    }
  });

  if (accessCache.size < MAX_CACHE_SIZE) {
    return;
  }

  const entries = Array.from(accessCache.entries()).sort((a, b) => a[1].expiresAt - b[1].expiresAt);
  const entriesToRemove = entries.slice(0, accessCache.size - CLEANUP_THRESHOLD);
  entriesToRemove.forEach(([key]) => accessCache.delete(key));
};

const getCachedAccess = (username: string, domain: string): boolean | null => {
  const cacheKey = `${username}::${domain}`;
  const cached = accessCache.get(cacheKey);

  if (!cached) {
    return null;
  }

  if (cached.expiresAt <= Date.now()) {
    accessCache.delete(cacheKey);
    return null;
  }

  return cached.value;
};

const setCachedAccess = (username: string, domain: string, hasAccess: boolean): void => {
  evictOldestCacheEntries();
  const cacheKey = `${username}::${domain}`;
  accessCache.set(cacheKey, { value: hasAccess, expiresAt: Date.now() + CACHE_TTL_MS });
};

const clearAccessCache = (): void => {
  accessCache.clear();
};

export { getCachedAccess, setCachedAccess, clearAccessCache };
