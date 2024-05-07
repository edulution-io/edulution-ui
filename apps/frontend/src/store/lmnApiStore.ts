import { create } from 'zustand';
import { AxiosRequestConfig } from 'axios';
import UserLmnInfo from '@/datatypes/userInfo';
import axiosInstanceLmn from '@/api/axiosInstanceLmn';

interface UserLmnInfoStore {
  userData: UserLmnInfo | null;
  loading: boolean;
  error: Error | null;
  getToken: (username: string, password: string) => Promise<void>;
  getUserData: () => Promise<void>;
  reset: () => void;
}

const initialState: Omit<UserLmnInfoStore, 'getToken' | 'getUserData' | 'reset'> = {
  userData: null,
  loading: false,
  error: null,
};

const useLmnUserStore = create<UserLmnInfoStore>((set) => ({
  ...initialState,
  getToken: async (username: string, password: string) => {
    set({ loading: true });
    const encodedCredentials = btoa(`${username}:${password}`);
    const config: AxiosRequestConfig = {
      url: '/api/v1/auth/',
      method: 'GET',
      headers: {
        Authorization: `Basic ${encodedCredentials}`,
      },
    };

    try {
      const response = await axiosInstanceLmn(config);
      const token = response.data as string;
      sessionStorage.setItem('lmnApiToken', token);
      set({ loading: false, error: null });
    } catch (error) {
      set({ error: error as Error, loading: false });
    }
  },
  getUserData: async () => {
    set({ loading: true });
    const token = sessionStorage.getItem('lmnApiToken');
    if (!token) {
      set({ error: new Error('No API token found'), loading: false });
      return;
    }
    const config: AxiosRequestConfig = {
      url: `/api/v1/users/${sessionStorage.getItem('user')}`,
      method: 'GET',
      headers: { 'X-Api-Key': token },
    };

    try {
      const response = await axiosInstanceLmn(config);
      set({
        userData: response.data as UserLmnInfo,
        loading: false,
        error: null,
      });
    } catch (error) {
      set({ error: error as Error, loading: false });
    }
  },
  reset: () => set({ ...initialState }),
}));

export default useLmnUserStore;
