import { create } from 'zustand';
import { AxiosError } from 'axios';
import eduApi from '@/api/eduApi';
import type SuccessfullVeyonAuthResponse from '@libs/veyon/types/connectionUidResponse';
import { framebufferConfigHigh, framebufferConfigLow } from '@libs/veyon/constants/framebufferConfig';
import handleApiError from '@/utils/handleApiError';

type VeyonApiStore = {
  error: AxiosError | null;
  userConnectionUids: SuccessfullVeyonAuthResponse[];
  isLoading: boolean;
  updateConnectionUids: (ip: string, userConnectionUid: SuccessfullVeyonAuthResponse | Record<string, never>) => void;
  authenticateVeyonClients: (ip: string, veyonUser: string) => Promise<void>;
  getFrameBufferStream: (connectionUid: string, highQuality?: boolean) => Promise<Blob>;
};

const useVeyonApiStore = create<VeyonApiStore>((set, get) => ({
  error: null,
  isLoading: false,
  userConnectionUids: [],

  updateConnectionUids: (ip: string, userConnectionUid: SuccessfullVeyonAuthResponse | Record<string, never>) => {
    set((state) => {
      if (Object.keys(userConnectionUid).length === 0) {
        return {
          userConnectionUids: state.userConnectionUids.filter((entry) => entry.ip !== ip),
        };
      }

      const existingIndex = state.userConnectionUids.findIndex((entry) => entry.ip === userConnectionUid.ip);

      if (existingIndex !== -1) {
        const updatedConnections = [...state.userConnectionUids];
        updatedConnections[existingIndex] = {
          ip: userConnectionUid.ip,
          veyonUsername: userConnectionUid.veyonUsername,
          connectionUid: userConnectionUid.connectionUid,
          validUntil: userConnectionUid.validUntil,
        };
        return { userConnectionUids: updatedConnections };
      }

      return {
        userConnectionUids: [
          ...state.userConnectionUids,
          {
            ip: userConnectionUid.ip,
            veyonUsername: userConnectionUid.veyonUsername,
            connectionUid: userConnectionUid.connectionUid,
            validUntil: userConnectionUid.validUntil,
          },
        ],
      };
    });
  },

  authenticateVeyonClients: async (ip: string, veyonUser: string) => {
    try {
      const { data } = await eduApi.post<SuccessfullVeyonAuthResponse | Record<string, never>>(
        `veyon/${ip}`,
        { veyonUser },
        { timeout: 60000 },
      );
      get().updateConnectionUids(ip, data);
    } catch (error) {
      get().updateConnectionUids(ip, {});
      handleApiError(error, set, 'veyonAuthError');
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
