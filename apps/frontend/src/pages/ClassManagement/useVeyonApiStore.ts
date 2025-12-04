/*
 * Copyright (C) [2025] [Netzint GmbH]
 * All rights reserved.
 *
 * This software is dual-licensed under the terms of:
 *
 * 1. The GNU Affero General Public License (AGPL-3.0-or-later), as published by the Free Software Foundation.
 *    You may use, modify and distribute this software under the terms of the AGPL, provided that you comply with its conditions.
 *
 *    A copy of the license can be found at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * OR
 *
 * 2. A commercial license agreement with Netzint GmbH. Licensees holding a valid commercial license from Netzint GmbH
 *    may use this software in accordance with the terms contained in such written agreement, without the obligations imposed by the AGPL.
 *
 * If you are uncertain which license applies to your use case, please contact us at info@netzint.de for clarification.
 */

import { create } from 'zustand';
import { AxiosError } from 'axios';
import eduApi from '@/api/eduApi';
import handleApiError from '@/utils/handleApiError';
import type SuccessfullVeyonAuthResponse from '@libs/veyon/types/connectionUidResponse';
import { framebufferConfigHigh, framebufferConfigLow } from '@libs/veyon/constants/framebufferConfig';
import {
  VEYON_API_ENDPOINT,
  VEYON_API_FEATURE_ENDPOINT,
  VEYON_API_FRAMEBUFFER_ENDPOINT,
} from '@libs/veyon/constants/veyonApiEndpoints';
import { RequestResponseContentType, ResponseType } from '@libs/common/types/http-methods';
import UserConnectionsFeatureStates from '@libs/veyon/types/userConnectionsFeatureState';
import VeyonFeaturesResponse from '@libs/veyon/types/veyonFeaturesResponse';

type VeyonApiStore = {
  error: AxiosError | null;
  userConnectionUids: SuccessfullVeyonAuthResponse[];
  userConnectionsFeatureStates: UserConnectionsFeatureStates;
  isLoading: boolean;
  loadingFeatureUids: Set<string>;
  updateConnectionUids: (ip: string, userConnectionUid: SuccessfullVeyonAuthResponse | Record<string, never>) => void;
  authenticateVeyonClient: (ip: string, veyonUser: string) => Promise<void>;
  getFrameBufferStream: (connectionUid: string, highQuality?: boolean) => Promise<Blob>;
  setFeature: (
    connectionUids: string[],
    featureUid: string,
    active: boolean,
    args?: Record<string, unknown>,
  ) => Promise<void>;
  getFeatures: (connectionUid: string) => Promise<void>;
  reset: () => void;
};

const initialValues = {
  error: null,
  isLoading: false,
  loadingFeatureUids: new Set<string>(),
  userConnectionUids: [],
  userConnectionsFeatureStates: {},
};

const useVeyonApiStore = create<VeyonApiStore>((set, get) => ({
  ...initialValues,
  reset: () => set(initialValues),

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

  setFeature: async (connectionUids: string[], featureUid: string, active: boolean, args?: Record<string, unknown>) => {
    connectionUids.forEach((connectionUid) => {
      get().loadingFeatureUids.add(connectionUid);
    });
    try {
      const { data } = await eduApi.put<UserConnectionsFeatureStates>(
        `${VEYON_API_ENDPOINT}/${VEYON_API_FEATURE_ENDPOINT}/${featureUid}`,
        {
          active,
          connectionUids,
          args,
        },
      );
      set({
        userConnectionsFeatureStates: data,
      });
    } catch (error) {
      handleApiError(error, set, 'veyonAuthError');
    } finally {
      connectionUids.forEach((connectionUid) => {
        get().loadingFeatureUids.delete(connectionUid);
      });
    }
  },

  getFeatures: async (connectionUid: string) => {
    set({ isLoading: true });
    try {
      const { data } = await eduApi.get<VeyonFeaturesResponse[]>(
        `${VEYON_API_ENDPOINT}/${VEYON_API_FEATURE_ENDPOINT}/${connectionUid}`,
      );
      set({
        userConnectionsFeatureStates: {
          ...get().userConnectionsFeatureStates,
          [connectionUid]: data,
        },
      });
    } catch (error) {
      handleApiError(error, set, 'veyonAuthError');
    } finally {
      set({ isLoading: false });
    }
  },
}));

export default useVeyonApiStore;
