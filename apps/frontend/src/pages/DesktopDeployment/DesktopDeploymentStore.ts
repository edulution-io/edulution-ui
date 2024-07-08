import { create } from 'zustand';
import axios, { AxiosError } from 'axios';
import handleApiError from '@/utils/handleApiError';
import userStore from '@/store/UserStore/UserStore';
import CryptoJS from 'crypto-js';
import eduApi from '@/api/eduApi';
import { Connections, VdiConnectionRequest, VirtualMachines } from '@libs/desktopdeployment/types';

interface DesktopDeploymentStore {
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
  postRequestVdi: (group: string) => Promise<VdiConnectionRequest | null>;
  getVirtualMachines: () => Promise<void>;
}

const initialState = {
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

const baseUrl = `${window.location.origin}/guacamole/api`;
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
      const key = `${import.meta.env.VITE_WEBDAV_KEY}`;
      const decryptedValue = CryptoJS.AES.decrypt(userStore.getState().webdavKey, key);
      const password = decryptedValue.toString(CryptoJS.enc.Utf8);

      const response = await axios.post(
        `${baseUrl}/tokens`,
        {
          username: userStore.getState().username,
          password,
        },
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
      );

      const { authToken, dataSource } = response.data as { authToken: string; dataSource: string };
      set({ isLoading: false, token: authToken, dataSource, isVdiConnectionMinimized: false });
    } catch (error) {
      handleApiError(error, set);
    } finally {
      set({ isLoading: false });
    }
  },

  getConnections: async () => {
    set({ isLoading: true });
    try {
      const response = await axios.get(`${baseUrl}/session/data/${get().dataSource}/connections?token=${get().token}`);
      set({ isLoading: false, connections: response.data as Connections });
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
      const response = await eduApi.post<VdiConnectionRequest>(
        `${EDU_API_VDI_ENDPOINT}/request`,
        vdiConnectionRequestBody,
      );
      set({ isLoading: false });
      return response.data;
    } catch (error) {
      handleApiError(error, set);
      return null;
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
