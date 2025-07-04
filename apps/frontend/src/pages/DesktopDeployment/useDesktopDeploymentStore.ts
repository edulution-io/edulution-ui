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
