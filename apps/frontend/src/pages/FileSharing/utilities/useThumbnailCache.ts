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

import { create } from 'zustand';
import eduApi from '@/api/eduApi';
import FileSharingApiEndpoints from '@libs/filesharing/types/fileSharingApiEndpoints';
import { ResponseType } from '@libs/common/types/http-methods';

interface ThumbnailCacheState {
  cache: Map<string, string>;
  pendingRequests: Set<string>;
  failedRequests: Set<string>;
  getThumbnail: (key: string) => string | undefined;
  hasFailed: (key: string) => boolean;
  isPending: (key: string) => boolean;
  fetchThumbnail: (filePath: string, etag: string, share: string) => Promise<string | undefined>;
  clearCache: () => void;
}

const useThumbnailCache = create<ThumbnailCacheState>((set, get) => ({
  cache: new Map(),
  pendingRequests: new Set(),
  failedRequests: new Set(),

  getThumbnail: (key: string) => get().cache.get(key),

  hasFailed: (key: string) => get().failedRequests.has(key),

  isPending: (key: string) => get().pendingRequests.has(key),

  fetchThumbnail: async (filePath: string, etag: string, share: string) => {
    const cacheKey = `${filePath}:${etag}`;

    const existing = get().cache.get(cacheKey);
    if (existing) return existing;

    if (get().pendingRequests.has(cacheKey) || get().failedRequests.has(cacheKey)) {
      return undefined;
    }

    set((state) => {
      const newPending = new Set(state.pendingRequests);
      newPending.add(cacheKey);
      return { pendingRequests: newPending };
    });

    try {
      const response = await eduApi.get<Blob>(
        `${FileSharingApiEndpoints.FILESHARING_ACTIONS}/${FileSharingApiEndpoints.THUMBNAIL}`,
        {
          params: { filePath, etag, share },
          responseType: ResponseType.BLOB,
        },
      );

      const objectUrl = URL.createObjectURL(response.data);

      set((state) => {
        const newCache = new Map(state.cache);
        newCache.set(cacheKey, objectUrl);
        const newPending = new Set(state.pendingRequests);
        newPending.delete(cacheKey);
        return { cache: newCache, pendingRequests: newPending };
      });

      return objectUrl;
    } catch {
      set((state) => {
        const newPending = new Set(state.pendingRequests);
        newPending.delete(cacheKey);
        const newFailed = new Set(state.failedRequests);
        newFailed.add(cacheKey);
        return { pendingRequests: newPending, failedRequests: newFailed };
      });
      return undefined;
    }
  },

  clearCache: () => {
    const { cache } = get();
    cache.forEach((url) => URL.revokeObjectURL(url));
    set({ cache: new Map(), pendingRequests: new Set(), failedRequests: new Set() });
  },
}));

export default useThumbnailCache;
