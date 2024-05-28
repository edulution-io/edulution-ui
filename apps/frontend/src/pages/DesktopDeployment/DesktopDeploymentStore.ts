import { create } from 'zustand';
import axios, { AxiosError } from 'axios';
import handleApiError from '@/utils/handleApiError';
import userStore from '@/store/userStore';

type ConnectionAttributes = {
  'guacd-encryption': string;
  'failover-only': string | null;
  weight: string | null;
  'max-connections': string;
  'guacd-hostname': string | null;
  'guacd-port': string | null;
  'max-connections-per-user': string;
};

type Connection = {
  name: string;
  identifier: string;
  parentIdentifier: string;
  protocol: string;
  attributes: ConnectionAttributes;
  activeConnections: number;
  lastActive: number;
};

type Connections = {
  [key: string]: Connection;
};

interface DesktopDeploymentStore {
  token: string;
  dataSource: string;
  isLoading: boolean;
  error: AxiosError | null;
  connections: Connections | null;
  isVdiConnectionMinimized: boolean;
  setIsVdiConnectionMinimized: (isVdiConnectionMinimized: boolean) => void;
  setToken: (token: string) => void;
  setIsLoading: (isLoading: boolean) => void;
  authenticate: () => Promise<void>;
  getConnections: () => Promise<void>;
}

const initialState = {
  token: '',
  dataSource: '',
  isLoading: false,
  error: null,
  connections: null,
  isVdiConnectionMinimized: false,
};

const baseUrl = `${window.location.origin}/guacamole/api`;

const useDesktopDeploymentStore = create<DesktopDeploymentStore>((set, get) => ({
  ...initialState,

  setIsLoading: (isLoading) => set({ isLoading }),
  setToken: (token) => set({ token }),
  setIsVdiConnectionMinimized: (isVdiConnectionMinimized) => set({ isVdiConnectionMinimized }),

  authenticate: async () => {
    set({ isLoading: true });
    try {
      const response = await axios.post(
        `${baseUrl}/tokens`,
        {
          username: userStore.getState().user,
          password: 'Muster!',
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
}));

export default useDesktopDeploymentStore;
