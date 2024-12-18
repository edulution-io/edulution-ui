import { create } from 'zustand';
import eduApi from '@/api/eduApi';
import type SuccessfullVeyonAuthResponse from '@libs/veyon/types/connectionUidResponse';
import handleApiError from '@/utils/handleApiError';
import { framebufferConfigHigh, framebufferConfigLow } from '@libs/veyon/constants/framebufferConfig';
import VeyonUserResponse from '@libs/veyon/types/veyonUserResponse';

type VeyonApiStore = {
  isLoading: boolean;
  authenticateVeyonClients: (ip: string) => Promise<string>;
  getFrameBufferStream: (connectionUid: string, highQuality?: boolean) => Promise<Blob | null>;
  getVeyonUser: (connectionUid: string) => Promise<VeyonUserResponse | null>;
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

  getFrameBufferStream: async (connectionUid: string, highQuality = false) => {
    set({ isLoading: true });
    const framebufferConfig = highQuality ? framebufferConfigHigh : framebufferConfigLow;
    try {
      const response = await eduApi.get<Blob>(`veyon/framebuffer/${connectionUid}`, {
        responseType: 'blob',
        params: framebufferConfig,
      });
      return response.data;
    } catch (error) {
      handleApiError(error, set);
      return null;
    } finally {
      set({ isLoading: false });
    }
  },

  getVeyonUser: async (connectionUid: string) => {
    try {
      const { data } = await eduApi.get<VeyonUserResponse>(`veyon/user/${connectionUid}`);
      return data;
    } catch (error) {
      handleApiError(error, set);
      return null;
    }
  },
}));

export default useVeyonApiStore;
