import { create } from 'zustand';
import { AxiosError } from 'axios';
import handleApiError from '@/utils/handleApiError';
import userStore from '@/store/UserStore/UserStore';
import eduApi from '@/api/eduApi';
import { Connections, VdiConnectionRequest, VirtualMachines } from '@libs/desktopdeployment/types';

interface DesktopDeploymentStore {
  connectionEnabled: boolean;
  vdiIp: string;
  token: string;
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
  setToken: (token: string) => void;
  setIsLoading: (isLoading: boolean) => void;
  setGuacId: (guacId: string) => void;
  setVirtualMachines: (virtualMachines: VirtualMachines) => void;
  authenticate: () => Promise<void>;
  getConnections: () => Promise<void>;
  postRequestVdi: (group: string) => Promise<void>;
  getVirtualMachines: () => Promise<void>;
  createOrUpdateConnection: () => Promise<void>;
}

const initialState = {
  connectionEnabled: false,
  vdiIp: '',
  token: '',
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

  setIsLoading: (isLoading) => set({ isLoading }),
  setToken: (token) => set({ token }),
  setIsVdiConnectionMinimized: (isVdiConnectionMinimized) => set({ isVdiConnectionMinimized }),
  setOpenVdiConnection: (openVdiConnection) => set({ openVdiConnection }),
  setGuacId: (guacId) => set({ guacId }),
  setVirtualMachines: (virtualMachines) => set({ virtualMachines }),

  authenticate: async () => {
    set({ isLoading: true });
    try {
      const response = await eduApi.get(`${EDU_API_VDI_ENDPOINT}/auth`);

      const { authToken, dataSource } = response.data as { authToken: string; dataSource: string };
      set({ isLoading: false, token: authToken, dataSource, isVdiConnectionMinimized: false });
    } catch (error) {
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
        token: get().token,
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

  getConnections: async () => {
    set({ isLoading: true });
    try {
      const response = await eduApi.post(`${EDU_API_VDI_ENDPOINT}/connections`, {
        dataSource: get().dataSource,
        token: get().token,
      });
      set({ isLoading: false, guacId: response.data as string });
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
      user: userStore.getState().username,
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
