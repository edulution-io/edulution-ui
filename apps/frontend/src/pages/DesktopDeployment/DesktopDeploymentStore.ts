import { create } from 'zustand';
import { AxiosError } from 'axios';
import handleApiError from '@/utils/handleApiError';
import userStore from '@/store/UserStore/UserStore';
import eduApi from '@/api/eduApi';
import { Connections, GuacRequest, VdiConnectionRequest, VirtualMachines } from '@libs/desktopdeployment/types';

interface DesktopDeploymentStore {
  connectionEnabled: boolean;
  vdiIp: string;
  guacToken: string;
  dataSource: string;
  isLoading: boolean;
  error: AxiosError | null;
  connections: Connections | null;
  isVdiConnectionMinimized: boolean;
  openVdiConnection: boolean;
  guacId: string;
  virtualMachines: VirtualMachines | null;
  setIsVdiConnectionMinimized: (isVdiConnectionMinimized: boolean) => void;
  setOpenVdiConnection: (openVdiConnection: boolean) => void;
  setGuacToken: (guacToken: string) => void;
  setIsLoading: (isLoading: boolean) => void;
  setGuacId: (guacId: string) => void;
  setVirtualMachines: (virtualMachines: VirtualMachines) => void;
  authenticate: () => Promise<void>;
  getConnection: () => Promise<void>;
  postRequestVdi: (group: string) => Promise<void>;
  getVirtualMachines: () => Promise<void>;
  createOrUpdateConnection: () => Promise<void>;
  reset: () => void;
}

const initialState = {
  connectionEnabled: false,
  vdiIp: '',
  guacToken: '',
  dataSource: '',
  isLoading: false,
  error: null,
  connections: null,
  isVdiConnectionMinimized: false,
  openVdiConnection: false,
  guacId: '',
  virtualMachines: null,
};

const EDU_API_VDI_ENDPOINT = 'vdi';

const useDesktopDeploymentStore = create<DesktopDeploymentStore>((set, get) => ({
  ...initialState,
  reset: () => set(initialState),

  setIsLoading: (isLoading) => set({ isLoading }),
  setGuacToken: (guacToken) => set({ guacToken }),
  setIsVdiConnectionMinimized: (isVdiConnectionMinimized) => set({ isVdiConnectionMinimized }),
  setOpenVdiConnection: (openVdiConnection) => set({ openVdiConnection }),
  setGuacId: (guacId) => set({ guacId }),
  setVirtualMachines: (virtualMachines) => set({ virtualMachines }),

  authenticate: async () => {
    set({ isLoading: true });
    try {
      const response = await eduApi.get<GuacRequest>(EDU_API_VDI_ENDPOINT);

      const { authToken, dataSource } = response.data;
      set({ isLoading: false, guacToken: authToken, dataSource, isVdiConnectionMinimized: false });
    } catch (error) {
      set({ error: error as AxiosError });
      handleApiError(error, set);
    } finally {
      set({ isLoading: false });
    }
  },

  createOrUpdateConnection: async () => {
    set({ isLoading: true });
    try {
      await eduApi.post(`${EDU_API_VDI_ENDPOINT}/sessions`, {
        dataSource: get().dataSource,
        authToken: get().guacToken,
        hostname: get().vdiIp,
      });
      set({ isLoading: false, connectionEnabled: true });
    } catch (error) {
      set({ isLoading: false, connectionEnabled: false });

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
      set({ isLoading: false, guacId: response.data });
    } catch (error) {
      handleApiError(error, set);
    } finally {
      set({ isLoading: false });
    }
  },

  postRequestVdi: async (group: string) => {
    set({ isLoading: true });

    const vdiConnectionRequestBody = {
      group,
      user: userStore.getState().user!.username,
    };

    try {
      const response = await eduApi.post<VdiConnectionRequest>(EDU_API_VDI_ENDPOINT, vdiConnectionRequestBody);
      set({ isLoading: false, vdiIp: response.data.data.ip });
    } catch (error) {
      handleApiError(error, set);
    } finally {
      set({ isLoading: false });
    }
  },

  getVirtualMachines: async () => {
    set({ isLoading: true });
    try {
      const response = await eduApi.get<VirtualMachines>(`${EDU_API_VDI_ENDPOINT}/virtualmachines`);
      set({ isLoading: false, virtualMachines: response?.data });
    } catch (error) {
      handleApiError(error, set);
    } finally {
      set({ isLoading: false });
    }
  },
}));

export default useDesktopDeploymentStore;
