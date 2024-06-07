import { create } from 'zustand';
import axios, { AxiosError } from 'axios';
import handleApiError from '@/utils/handleApiError';
import userStore from '@/store/userStore';
import CryptoJS from 'crypto-js';
import eduApi from '@/api/eduApi';
import { Connections, StatusOfClones, VdiConnectionRequest } from './DesktopDeploymentTypes';

interface DesktopDeploymentStore {
  token: string;
  dataSource: string;
  isLoading: boolean;
  error: AxiosError | null;
  connections: Connections | null;
  isVdiConnectionMinimized: boolean;
  openVdiConnection: boolean;
  guacId: string;
  setIsVdiConnectionMinimized: (isVdiConnectionMinimized: boolean) => void;
  setOpenVdiConnection: (openVdiConnection: boolean) => void;
  setToken: (token: string) => void;
  setIsLoading: (isLoading: boolean) => void;
  setGuacId: (guacId: string) => void;
  authenticate: () => Promise<void>;
  getConnections: () => Promise<void>;
  postRequestVdi: () => Promise<VdiConnectionRequest | null>;
  getStatusOfClones: () => Promise<StatusOfClones | null>;
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

  authenticate: async () => {
    set({ isLoading: true });
    try {
      const key = `${import.meta.env.VITE_WEBDAV_KEY}`;
      const decryptedValue = CryptoJS.AES.decrypt(userStore.getState().webdavKey, key);
      const password = decryptedValue.toString(CryptoJS.enc.Utf8);

      const response = await axios.post(
        `${baseUrl}/tokens`,
        {
          username: userStore.getState().user,
          password,
        },
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
      );

      const { authToken, dataSource } = response.data as { authToken: string; dataSource: string };
      set({ isLoading: false, token: authToken, dataSource, isVdiConnectionMinimized: false, error: null });
    } catch (error) {
      handleApiError(error, set);
    }
  },

  getConnections: async () => {
    set({ isLoading: true });
    try {
      const response = await axios.get(`${baseUrl}/session/data/${get().dataSource}/connections?token=${get().token}`);
      set({ isLoading: false, connections: response.data as Connections, error: null });
    } catch (error) {
      handleApiError(error, set);
    }
  },

  postRequestVdi: async () => {
    set({ isLoading: true });

    const vdiConnectionRequestBody = {
      group: 'win10-vdi',
      user: userStore.getState().user,
    };

    try {
      const response = await eduApi.post<VdiConnectionRequest>(`${EDU_API_VDI_ENDPOINT}`, vdiConnectionRequestBody);
      set({ isLoading: false, error: null });
      return response.data;
    } catch (error) {
      handleApiError(error, set);
      return null;
    }
  },

  getStatusOfClones: async () => {
    set({ isLoading: true });
    try {
      const response = await eduApi.get<StatusOfClones>(`${EDU_API_VDI_ENDPOINT}/clones`);
      set({ isLoading: false, error: null });
      return response.data;
    } catch (error) {
      handleApiError(error, set);
      return null;
    }
  },
}));

export default useDesktopDeploymentStore;
