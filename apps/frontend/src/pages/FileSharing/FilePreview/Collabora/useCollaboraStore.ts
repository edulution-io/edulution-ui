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

const COLLABORA_DISCOVERY_PATH = '/hosting/discovery';
const COLLABORA_FALLBACK_EDITOR_PATH = '/browser/dist/cool.html';

interface CollaboraStoreState {
  accessToken: string;
  accessTokenTTL: number;
  editorPath: string;
  isLoading: boolean;
  error: string | null;
  fetchEditorPath: (collaboraUrl: string) => Promise<void>;
  fetchWopiToken: (filePath: string, share: string) => Promise<void>;
  reset: () => void;
}

const initialState = {
  accessToken: '',
  accessTokenTTL: 0,
  editorPath: COLLABORA_FALLBACK_EDITOR_PATH,
  isLoading: false,
  error: null,
};

const parseEditorPathFromDiscovery = (xml: string, collaboraUrl: string): string => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, 'text/xml');
  const action = doc.querySelector('action[name="edit"]');
  const urlSrc = action?.getAttribute('urlsrc');
  if (!urlSrc) return COLLABORA_FALLBACK_EDITOR_PATH;

  const url = new URL(urlSrc);
  const path = url.pathname;
  const collaboraPath = new URL(collaboraUrl).pathname;
  return collaboraPath.length > 1 ? path.replace(collaboraPath, '') : path;
};

const useCollaboraStore = create<CollaboraStoreState>((set, get) => ({
  ...initialState,

  fetchEditorPath: async (collaboraUrl: string) => {
    if (get().editorPath !== COLLABORA_FALLBACK_EDITOR_PATH) return;

    try {
      const response = await fetch(`${collaboraUrl}${COLLABORA_DISCOVERY_PATH}`);
      const xml = await response.text();
      const editorPath = parseEditorPathFromDiscovery(xml, collaboraUrl);
      set({ editorPath });
    } catch {
      set({ editorPath: COLLABORA_FALLBACK_EDITOR_PATH });
    }
  },

  fetchWopiToken: async (filePath: string, share: string) => {
    try {
      set({ isLoading: true, error: null });
      const { data } = await eduApi.post<WopiAccessToken>(
        `${FileSharingApiEndpoints.FILESHARING_ACTIONS}/${FileSharingApiEndpoints.COLLABORA_TOKEN}`,
        { filePath, share, origin: window.location.origin },
      );
      set({ accessToken: data.accessToken, accessTokenTTL: data.accessTokenTTL });
    } catch (error) {
      handleApiError(error, set);
    } finally {
      set({ isLoading: false });
    }
  },

  reset: () => set({ ...initialState, editorPath: get().editorPath }),
}));

export default useCollaboraStore;
