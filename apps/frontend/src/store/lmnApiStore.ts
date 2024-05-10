import { create } from 'zustand';
import { AxiosRequestConfig } from 'axios';
import UserLmnInfo from '@/datatypes/userInfo';
import axiosInstanceLmn from '@/api/axios/axiosInstanceLmn';
import userStore from './userStore';

interface UserLmnInfoStore {
  token: string;
  userData: UserLmnInfo | null;
  loading: boolean;
  error: Error | null;
  getToken: (username: string, password: string) => Promise<void>;
  getUserData: () => Promise<void>;
  reset: () => void;
}

const initialState: Omit<UserLmnInfoStore, 'getToken' | 'getUserData' | 'reset'> = {
  token: '',
  userData: null,
  loading: false,
  error: null,
};

const useLmnUserStore = create<UserLmnInfoStore>((set, get) => ({
  ...initialState,
  getToken: async () => {
    set({ loading: true });

    try {
      const response = await axiosInstanceLmn.get('/api/v1/auth/');
      const token = response.data as string;
      sessionStorage.setItem('lmnApiToken', token);
      set({ loading: false, error: null });
      set({ token });
    } catch (error) {
      set({ error: error as Error, loading: false });
    }
  },
  getUserData: async () => {
    set({ loading: true });

    if (!get().token) {
      set({ error: new Error('No API token found'), loading: false });
      return;
    }

    const config: AxiosRequestConfig = {
      headers: { 'X-Api-Key': get().token },
    };

    try {
      const response = await axiosInstanceLmn.get(`/api/v1/users/${userStore.getState().user}`, config);
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
