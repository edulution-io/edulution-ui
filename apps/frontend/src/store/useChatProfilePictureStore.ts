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

import { create, StateCreator } from 'zustand';
import { createJSONStorage, persist, PersistOptions } from 'zustand/middleware';
import { CHAT_PROFILE_PICTURES_ENDPOINT } from '@libs/chat/constants/chatApiEndpoints';
import eduApi from '@/api/eduApi';

const CHAT_PROFILE_PICTURE_STORAGE_KEY = 'chat-profile-picture-storage';
const MAX_CACHE_ENTRIES = 200;

interface CachedProfilePicture {
  profilePicture: string;
  profilePictureHash: string;
  lastAccessedAt: number;
}

interface ChatProfilePictureStore {
  cache: Record<string, CachedProfilePicture>;
  lastSentProfilePictureHash: string | null;

  getCachedProfilePicture: (username: string) => string | undefined;
  updateCache: (username: string, profilePicture?: string, profilePictureHash?: string) => void;
  fetchProfilePictures: (usernames: string[]) => Promise<void>;
  shouldIncludeFullPicture: (currentHash: string) => boolean;
  setLastSentProfilePictureHash: (hash: string) => void;
  reset: () => void;
}

const initialState = {
  cache: {} as Record<string, CachedProfilePicture>,
  lastSentProfilePictureHash: null as string | null,
};

type PersistedChatProfilePictureStore = (
  config: StateCreator<ChatProfilePictureStore>,
  options: PersistOptions<Partial<ChatProfilePictureStore>>,
) => StateCreator<ChatProfilePictureStore>;

const useChatProfilePictureStore = create<ChatProfilePictureStore>(
  (persist as PersistedChatProfilePictureStore)(
    (set, get) => ({
      ...initialState,

      getCachedProfilePicture: (username) => {
        const entry = get().cache[username];
        if (!entry) return undefined;

        set((state) => ({
          cache: {
            ...state.cache,
            [username]: { ...state.cache[username], lastAccessedAt: Date.now() },
          },
        }));
        return entry.profilePicture;
      },

      updateCache: (username, profilePicture, profilePictureHash) => {
        if (!profilePictureHash) return;

        const { cache } = get();
        const existing = cache[username];

        if (existing?.profilePictureHash === profilePictureHash && !profilePicture) return;

        const now = Date.now();
        let updatedCache = { ...cache };

        if (profilePicture) {
          updatedCache[username] = { profilePicture, profilePictureHash, lastAccessedAt: now };
        } else if (!existing || existing.profilePictureHash !== profilePictureHash) {
          updatedCache[username] = {
            profilePicture: existing?.profilePicture || '',
            profilePictureHash,
            lastAccessedAt: now,
          };
        } else {
          return;
        }

        const entries = Object.entries(updatedCache);
        if (entries.length > MAX_CACHE_ENTRIES) {
          entries.sort(([, a], [, b]) => a.lastAccessedAt - b.lastAccessedAt);
          updatedCache = Object.fromEntries(entries.slice(entries.length - MAX_CACHE_ENTRIES));
        }

        set({ cache: updatedCache });
      },

      fetchProfilePictures: async (usernames) => {
        const { cache } = get();
        const missing = usernames.filter((u) => !cache[u]?.profilePicture);
        if (missing.length === 0) return;

        try {
          const response = await eduApi.post<Record<string, string>>(CHAT_PROFILE_PICTURES_ENDPOINT, {
            usernames: missing,
          });

          const now = Date.now();
          const updates: Record<string, CachedProfilePicture> = {};
          Object.entries(response.data).forEach(([username, profilePicture]) => {
            updates[username] = {
              profilePicture,
              profilePictureHash: cache[username]?.profilePictureHash ?? '',
              lastAccessedAt: now,
            };
          });

          if (Object.keys(updates).length > 0) {
            set((state) => {
              let updatedCache = { ...state.cache, ...updates };
              const entries = Object.entries(updatedCache);
              if (entries.length > MAX_CACHE_ENTRIES) {
                entries.sort(([, a], [, b]) => a.lastAccessedAt - b.lastAccessedAt);
                updatedCache = Object.fromEntries(entries.slice(entries.length - MAX_CACHE_ENTRIES));
              }
              return { cache: updatedCache };
            });
          }
        } catch (error) {
          console.error('Failed to fetch profile pictures', error);
        }
      },

      shouldIncludeFullPicture: (currentHash) => currentHash !== get().lastSentProfilePictureHash,

      setLastSentProfilePictureHash: (hash) => set({ lastSentProfilePictureHash: hash }),

      reset: () => set({ lastSentProfilePictureHash: null }),
    }),
    {
      name: CHAT_PROFILE_PICTURE_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

export default useChatProfilePictureStore;
