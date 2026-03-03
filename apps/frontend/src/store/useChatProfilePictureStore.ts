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

const CHAT_PROFILE_PICTURE_STORAGE_KEY = 'chat-profile-picture-storage';

interface CachedProfilePicture {
  profilePicture: string;
  profilePictureHash: string;
}

interface ChatProfilePictureStore {
  cache: Record<string, CachedProfilePicture>;
  lastSentProfilePictureHash: string | null;

  getCachedProfilePicture: (username: string) => string | undefined;
  updateCache: (username: string, profilePicture?: string, profilePictureHash?: string) => void;
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

      getCachedProfilePicture: (username) => get().cache[username]?.profilePicture,

      updateCache: (username, profilePicture, profilePictureHash) => {
        if (!profilePictureHash) return;

        const { cache } = get();
        const existing = cache[username];

        if (existing?.profilePictureHash === profilePictureHash && !profilePicture) return;

        if (profilePicture) {
          set({
            cache: {
              ...cache,
              [username]: { profilePicture, profilePictureHash },
            },
          });
        } else if (!existing || existing.profilePictureHash !== profilePictureHash) {
          set({
            cache: {
              ...cache,
              [username]: { profilePicture: existing?.profilePicture || '', profilePictureHash },
            },
          });
        }
      },

      shouldIncludeFullPicture: (currentHash) => currentHash !== get().lastSentProfilePictureHash,

      setLastSentProfilePictureHash: (hash) => set({ lastSentProfilePictureHash: hash }),

      reset: () => set(initialState),
    }),
    {
      name: CHAT_PROFILE_PICTURE_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

export default useChatProfilePictureStore;
