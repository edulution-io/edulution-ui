import { create } from 'zustand';
import eduApi from '@/api/eduApi';
import type SuccessfullVeyonAuthResponse from '@libs/veyon/types/connectionUidResponse';
import { framebufferConfigHigh, framebufferConfigLow } from '@libs/veyon/constants/framebufferConfig';

type VeyonApiStore = {
  isLoading: boolean;
  authenticateVeyonClients: (ip: string, veyonUser: string) => Promise<string>;
  getFrameBufferStream: (connectionUid: string, highQuality?: boolean) => Promise<Blob>;
};

const useVeyonApiStore = create<VeyonApiStore>((set) => ({
  isLoading: false,

  authenticateVeyonClients: async (ip: string, veyonUser: string) => {
    try {
      const { data } = await eduApi.post<SuccessfullVeyonAuthResponse | Record<string, never>>(
        `veyon/${ip}`,
        { veyonUser },
        { timeout: 10000 },
      );
      return data.connectionUid || '';
    } catch (error) {
      return '';
    }
  },

  getFrameBufferStream: async (connectionUid: string, highQuality = false) => {
    set({ isLoading: true });
    const framebufferConfig = highQuality ? framebufferConfigHigh : framebufferConfigLow;
    try {
      const { data } = await eduApi.get<Blob>(`veyon/framebuffer/${connectionUid}`, {
        responseType: 'blob',
        params: framebufferConfig,
      });
      return data;
    } catch (error) {
      return new Blob([], { type: 'application/octet-stream' });
    } finally {
      set({ isLoading: false });
    }
  },
}));

export default useVeyonApiStore;
