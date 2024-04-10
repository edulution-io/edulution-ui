import create from 'zustand';
import axiosInstance, { AxiosRequestConfig } from 'axios';
import UserLmnInfo from '@/datatypes/UserInfo';

type DataTypeMap = {
  '/users': UserLmnInfo;
  '/products': UserLmnInfo;
};

type InferDataType<Url extends keyof DataTypeMap> = DataTypeMap[Url];

interface UserLmnInfoStore<Url extends keyof DataTypeMap> {
  data: InferDataType<Url> | null;
  loading: boolean;
  error: Error | null;
  fetchData: (params: FetchDataParams) => Promise<void>;
}

interface FetchDataParams {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: never;
}
const useApiStore = create<UserLmnInfoStore<keyof DataTypeMap>>((set) => ({
  data: null,
  loading: false,
  error: null,
  fetchData: async (params: FetchDataParams) => {
    set({ loading: true });
    try {
      const { url, method = 'GET', body = undefined } = params;

      const config: AxiosRequestConfig = {
        url,
        method,
        data: body,
        headers: {
          'X-Api-Key':
            'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJ1c2VyIjoibmV0emludC10ZWFjaGVyIiwicm9sZSI6InRlYWNoZXIifQ.F-P2ZUkkSGgXRL_tPaRLup-37pVgOO1Wnb-4O1T42SPat7fCdh4Cgl6pI-bZCnqXbPAmwkTGlrMjuxje64yI8g', // Dynamically setting or overriding the token for this request
        },
      };

      const response = await axiosInstance(config);

      let dataTypeKey: keyof DataTypeMap | null = null;
      if (url.includes('/users')) {
        dataTypeKey = '/users';
      } else if (url.includes('/products')) {
        dataTypeKey = '/products';
      }

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
    } catch (error) {
      set({ error: error as Error, loading: false });
    }
  },
}));

export default useApiStore;
