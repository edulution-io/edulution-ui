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
import handleApiError from '@/utils/handleApiError';
import userStore from '@/store/UserStore/useUserStore';
import eduApi from '@/api/eduApi';
import { DesktopDeploymentStore, GuacamoleDto, LmnVdiResponse, VirtualMachines } from '@libs/desktopdeployment/types';

const initialState = {
  connectionEnabled: false,
  vdiIp: '',
  guacToken: '',
  dataSource: '',
  isLoading: false,
  error: null,
  connections: null,
  isVdiConnectionOpen: false,
  guacId: '',
  virtualMachines: null,
};

const EDU_API_VDI_ENDPOINT = 'vdi';

const useDesktopDeploymentStore = create<DesktopDeploymentStore>((set, get) => ({
  ...initialState,
  reset: () => set(initialState),

  setError: (error) => set({ error }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setGuacToken: (guacToken) => set({ guacToken }),
  setIsVdiConnectionOpen: (isVdiConnectionOpen) => set({ isVdiConnectionOpen }),
  setGuacId: (guacId) => set({ guacId }),
  setVirtualMachines: (virtualMachines) => set({ virtualMachines }),

  authenticate: async () => {
    set({ isLoading: true });
    try {
      const response = await eduApi.get<GuacamoleDto>(EDU_API_VDI_ENDPOINT);

      const { authToken, dataSource } = response.data;
      set({ guacToken: authToken, dataSource });
    } catch (error) {
      handleApiError(error, set);
    } finally {
      set({ isLoading: false });
    }
  },

  createOrUpdateConnection: async () => {
    set({ isLoading: true, connectionEnabled: false });
    try {
      const { guacToken, vdiIp, dataSource } = get();
      await eduApi.post<GuacamoleDto>(`${EDU_API_VDI_ENDPOINT}/sessions`, {
        dataSource,
        authToken: guacToken,
        hostname: vdiIp,
      });
      set({ connectionEnabled: true });
    } catch (error) {
      handleApiError(error, set);
    } finally {
      set({ isLoading: false });
    }
  },

  getConnection: async () => {
    set({ isLoading: true });
    try {
      const response = await eduApi.post<string>(`${EDU_API_VDI_ENDPOINT}/connections`, {
        dataSource: get().dataSource,
        authToken: get().guacToken,
      });
      set({ guacId: response.data });
    } catch (error) {
      handleApiError(error, set);
    } finally {
      set({ isLoading: false });
    }
  },

  postRequestVdi: async (group: string) => {
    set({ error: null, isLoading: true });

    const vdiConnectionRequestBody = {
      group,
      user: userStore.getState().user!.username,
    };

    try {
      const response = await eduApi.post<LmnVdiResponse>(EDU_API_VDI_ENDPOINT, vdiConnectionRequestBody);
      set({ vdiIp: response.data.data.ip });
    } catch (error) {
      handleApiError(error, set);
    } finally {
      set({ isLoading: false });
    }
  },

  getVirtualMachines: async (isSilent: boolean) => {
    set({ isLoading: !isSilent });
    try {
      const response = await eduApi.get<VirtualMachines>(`${EDU_API_VDI_ENDPOINT}/virtualmachines`);
      set({ virtualMachines: response.data });
    } catch (error) {
      if (!isSilent) {
        handleApiError(error, set);
      }
    } finally {
      set({ isLoading: false });
    }
  },
}));

export default useDesktopDeploymentStore;
