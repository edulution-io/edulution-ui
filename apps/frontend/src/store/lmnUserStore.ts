import { create } from 'zustand';
import { AxiosRequestConfig } from 'axios';
import UserLmnInfo from '@/datatypes/userInfo';
import axiosInstance from '@/api/axiosInstance';

type DataTypeMap = {
  '/users': UserLmnInfo;
};

type InferDataType<Url extends keyof DataTypeMap> = DataTypeMap[Url];

interface UserLmnInfoStore<Url extends keyof DataTypeMap> {
  data: InferDataType<Url> | null;
  loading: boolean;
  error: Error | null;
  fetchData: (params: FetchDataParams) => Promise<void>;
  reset: () => void;
}

interface FetchDataParams {
  url: string;
  headers?: Record<string, string>;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: never;
  username?: string;
  password?: string;
}

const initialState: Omit<UserLmnInfoStore<keyof DataTypeMap>, 'fetchData' | 'setToken' | 'reset'> = {
  data: null,
  loading: false,
  error: null,
};

const useLmnUserStore = create<UserLmnInfoStore<keyof DataTypeMap>>((set) => ({
  ...initialState,
  fetchData: async (params: FetchDataParams) => {
    set({ loading: true });
    const { url, method = 'GET', body = undefined, headers = {} } = params;
    const authHeaders: Record<string, string> = {};
    if (params.username && params.password) {
      const encodedCredentials = btoa(`${params.username}:${params.password}`);
      authHeaders.Authorization = `Basic ${encodedCredentials}`;
    } else {
      const token = sessionStorage.getItem('lmnApiToken');
      if (token) {
        authHeaders['X-Api-Key'] = token;
      }
    }

    const config: AxiosRequestConfig = {
      url,
      method,
      data: body,
      headers: {
        ...headers,
        ...authHeaders,
      },
    };

    try {
      const response = await axiosInstance(config);
      let dataTypeKey: keyof DataTypeMap | null = null;
      if (url.includes('/users')) {
        dataTypeKey = '/users';
      }
      if (url.includes('/auth')) {
        const token = response.data as string;
        sessionStorage.setItem('lmnApiToken', token);
      }

      if (!url.includes('/auth')) {
        if (dataTypeKey) {
          set({
            data: response.data as InferDataType<typeof dataTypeKey>,
            loading: false,
            error: null,
          });
        } else {
          console.error('No matching data type found for URL:', url);
          set({ error: new Error('No matching data type found'), loading: false });
        }
      }
    } catch (error) {
      set({ error: error as Error, loading: false });
    }
  },
  reset: () => set({ ...initialState }),
}));

export default useLmnUserStore;
