import { create } from 'zustand';
import { AxiosError } from 'axios';
import eduApi from '@/api/eduApi';
import handleApiError from '@/utils/handleApiError';
import type SuccessfullVeyonAuthResponse from '@libs/veyon/types/connectionUidResponse';
import { framebufferConfigHigh, framebufferConfigLow } from '@libs/veyon/constants/framebufferConfig';
import { VEYON_API_ENDPOINT, VEYON_API_FRAMEBUFFER_ENDPOINT } from '@libs/veyon/constants/veyonApiEndpoints';
import { RequestResponseContentType, ResponseType } from '@libs/common/types/http-methods';

type VeyonApiStore = {
  error: AxiosError | null;
  userConnectionUids: SuccessfullVeyonAuthResponse[];
  isLoading: boolean;
  updateConnectionUids: (ip: string, userConnectionUid: SuccessfullVeyonAuthResponse | Record<string, never>) => void;
  authenticateVeyonClient: (ip: string, veyonUser: string) => Promise<void>;
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

  authenticateVeyonClient: async (ip: string, veyonUser: string) => {
    try {
      const { data } = await eduApi.post<SuccessfullVeyonAuthResponse | Record<string, never>>(
        `${VEYON_API_ENDPOINT}/${ip}`,
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
      const { data } = await eduApi.get<Blob>(
        `${VEYON_API_ENDPOINT}/${VEYON_API_FRAMEBUFFER_ENDPOINT}/${connectionUid}`,
        {
          responseType: ResponseType.BLOB,
          params: framebufferConfig,
        },
      );
      return data;
    } catch (error) {
      return new Blob([], { type: RequestResponseContentType.APPLICATION_OCTET_STREAM });
    } finally {
      set({ isLoading: false });
    }
  },
}));

export default useVeyonApiStore;
