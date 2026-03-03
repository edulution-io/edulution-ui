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
import WopiAccessToken from '@libs/filesharing/types/wopiAccessToken';
import handleApiError from '@/utils/handleApiError';

interface CollaboraStoreState {
  accessToken: string;
  accessTokenTTL: number;
  isLoading: boolean;
  error: string | null;
  fetchWopiToken: (filePath: string, share: string, canWrite: boolean) => Promise<void>;
  reset: () => void;
}

const initialState = {
  accessToken: '',
  accessTokenTTL: 0,
  isLoading: false,
  error: null,
};

const useCollaboraStore = create<CollaboraStoreState>((set) => ({
  ...initialState,

  fetchWopiToken: async (filePath: string, share: string, canWrite: boolean) => {
    try {
      set({ isLoading: true, error: null });
      const { data } = await eduApi.post<WopiAccessToken>(
        `${FileSharingApiEndpoints.FILESHARING_ACTIONS}/${FileSharingApiEndpoints.COLLABORA_TOKEN}`,
        { filePath, share, canWrite },
      );
      set({ accessToken: data.accessToken, accessTokenTTL: data.accessTokenTTL });
    } catch (error) {
      handleApiError(error, set);
    } finally {
      set({ isLoading: false });
    }
  },

  reset: () => set(initialState),
}));

export default useCollaboraStore;
