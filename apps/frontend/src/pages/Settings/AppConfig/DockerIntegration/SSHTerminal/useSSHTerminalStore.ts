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
import handleApiError from '@/utils/handleApiError';
import { SSHSessionDto } from '@libs/desktopdeployment/types';

type SSHSessionResponse = {
  authToken: string;
  dataSource: string;
  connectionUri: string;
};

type SSHTerminalStore = {
  isCredentialsDialogOpen: boolean;
  isTerminalOpen: boolean;
  isLoading: boolean;
  error: Error | null;
  guacToken: string;
  dataSource: string;
  connectionUri: string;
  setIsCredentialsDialogOpen: (isOpen: boolean) => void;
  setIsTerminalOpen: (isOpen: boolean) => void;
  openTerminal: (credentials: SSHSessionDto) => Promise<boolean>;
  reset: () => void;
};

const initialState = {
  isCredentialsDialogOpen: false,
  isTerminalOpen: false,
  isLoading: false,
  error: null,
  guacToken: '',
  dataSource: '',
  connectionUri: '',
};

const EDU_API_VDI_ENDPOINT = 'vdi';

const useSSHTerminalStore = create<SSHTerminalStore>((set) => ({
  ...initialState,

  setIsCredentialsDialogOpen: (isCredentialsDialogOpen) => set({ isCredentialsDialogOpen }),

  setIsTerminalOpen: (isTerminalOpen) => set({ isTerminalOpen }),

  openTerminal: async (credentials: SSHSessionDto) => {
    set({ isLoading: true, error: null });
    try {
      const response = await eduApi.post<SSHSessionResponse>(`${EDU_API_VDI_ENDPOINT}/ssh/sessions`, credentials);

      const { authToken, dataSource, connectionUri } = response.data;
      set({
        guacToken: authToken,
        dataSource,
        connectionUri,
        isTerminalOpen: true,
        isCredentialsDialogOpen: false,
      });
      return true;
    } catch (error) {
      handleApiError(error, set);
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  reset: () => set(initialState),
}));

export default useSSHTerminalStore;
