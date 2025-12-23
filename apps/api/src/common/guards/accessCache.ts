/*
 * Copyright (C) [2025] [Netzint GmbH]
 * All rights reserved.
 *
 * This software is dual-licensed under the terms of:
 *
 * 1. The GNU Affero General Public License (AGPL-3.0-or-later), as published by the Free Software Foundation.
 *    You may use, modify and distribute this software under the terms of the AGPL, provided that you comply with its conditions.
 *
 *    A copy of the license can be found at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * OR
 *
 * 2. A commercial license agreement with Netzint GmbH. Licensees holding a valid commercial license from Netzint GmbH
 *    may use this software in accordance with the terms contained in such written agreement, without the obligations imposed by the AGPL.
 *
 * If you are uncertain which license applies to your use case, please contact us at info@netzint.de for clarification.
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
