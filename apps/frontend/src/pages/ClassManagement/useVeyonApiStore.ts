import { create } from 'zustand';
import eduApi from '@/api/eduApi';
import type SuccessfullVeyonAuthResponse from '@libs/veyon/types/connectionUidResponse';
import handleApiError from '@/utils/handleApiError';

type VeyonApiStore = {
  isLoading: boolean;
  authenticateVeyonClients: (ip: string) => Promise<string>;
  getFrameBufferStream: (connectionUid: string) => Promise<Blob | null>;
};

const useVeyonApiStore = create<VeyonApiStore>((set) => ({
  isLoading: false,

  authenticateVeyonClients: async (ip: string) => {
    try {
      const { data } = await eduApi.post<SuccessfullVeyonAuthResponse>(`veyon/${ip}`, null, { timeout: 10000 });
      return data.connectionUid;
    } catch (error) {
      handleApiError(error, set);
      return '';
    }
  },

  getFrameBufferStream: async (connectionUid: string) => {
    set({ isLoading: true });
    try {
      const response = await eduApi.get<Blob>(`veyon/framebuffer/${connectionUid}`, { responseType: 'blob' });
      return response.data;
    } catch (error) {
      handleApiError(error, set);
      return null;
    } finally {
      set({ isLoading: false });
    }
  },
}));

export default useVeyonApiStore;
