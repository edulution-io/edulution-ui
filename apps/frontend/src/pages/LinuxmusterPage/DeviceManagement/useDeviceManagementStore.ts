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
import { createJSONStorage, persist } from 'zustand/middleware';
import { toast } from 'sonner';
import i18n from '@/i18n';
import eduApi from '@/api/eduApi';
import handleApiError from '@/utils/handleApiError';
import useLmnApiStore from '@/store/useLmnApiStore';
import LMN_API_EDU_API_ENDPOINTS from '@libs/lmnApi/constants/lmnApiEduApiEndpoints';
import { HTTP_HEADERS } from '@libs/common/types/http-methods';
import type ListManagementEntry from '@libs/userManagement/types/listManagementEntry';
import { isCommentEntry } from '@libs/userManagement/utils/csvUtils';

const { DEVICES } = LMN_API_EDU_API_ENDPOINTS;

type DeviceManagementStore = {
  devices: ListManagementEntry[];
  savedDevices: ListManagementEntry[];
  deletedIndices: number[];
  isLoading: boolean;
  isBackgroundFetching: boolean;
  isSaving: boolean;
  isApplying: boolean;
  error: string | null;

  fetchDevices: (school: string, force?: boolean) => Promise<void>;
  saveDevices: (school: string, data: ListManagementEntry[], silent?: boolean) => Promise<void>;
  applyDevices: (school: string, data: ListManagementEntry[]) => Promise<void>;
  setDeviceEntries: (entries: ListManagementEntry[]) => void;
  addDeletedIndex: (index: number) => void;
  reset: () => void;
};

const initialState = {
  devices: [] as ListManagementEntry[],
  savedDevices: [] as ListManagementEntry[],
  deletedIndices: [] as number[],
  isLoading: false,
  isBackgroundFetching: false,
  isSaving: false,
  isApplying: false,
  error: null as string | null,
};

const hasUnsavedChanges = (
  devices: ListManagementEntry[],
  savedDevices: ListManagementEntry[],
  deletedIndices: number[],
): boolean => {
  if (deletedIndices.length > 0) return true;
  if (devices.length !== savedDevices.length) return true;
  return devices.some((entry, i) => JSON.stringify(entry) !== JSON.stringify(savedDevices[i]));
};

const useDeviceManagementStore = create<DeviceManagementStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      fetchDevices: async (school: string, force?: boolean) => {
        const cached = get().devices;
        const isBackground = !force && cached.length > 0;

        if (isBackground) {
          if (get().isBackgroundFetching) return;
          set({ isBackgroundFetching: true, error: null });
        } else {
          if (get().isLoading) return;
          set({ isLoading: true, error: null });
        }

        try {
          const { lmnApiToken } = useLmnApiStore.getState();
          const response = await eduApi.get<ListManagementEntry[]>(`${DEVICES}/${school}`, {
            headers: { [HTTP_HEADERS.XApiKey]: lmnApiToken },
          });
          const entries = response.data.filter((entry) => !isCommentEntry(entry));

          if (isBackground && hasUnsavedChanges(get().devices, get().savedDevices, get().deletedIndices)) {
            set({ savedDevices: entries });
          } else {
            set({ devices: entries, savedDevices: entries, deletedIndices: [] });
          }
        } catch (error) {
          handleApiError(error, set);
        } finally {
          if (isBackground) {
            set({ isBackgroundFetching: false });
          } else {
            set({ isLoading: false });
          }
        }
      },

      saveDevices: async (school: string, data: ListManagementEntry[], silent?: boolean) => {
        if (get().isSaving) return;
        set({ isSaving: true, error: null });
        try {
          const { lmnApiToken } = useLmnApiStore.getState();
          await eduApi.post(
            `${DEVICES}/${school}`,
            { data },
            {
              headers: { [HTTP_HEADERS.XApiKey]: lmnApiToken },
            },
          );
          set({ devices: data, savedDevices: data, deletedIndices: [] });
          if (!silent) {
            toast.success(i18n.t('deviceManagement.listSaved'));
          }
        } catch (error) {
          handleApiError(error, set);
        } finally {
          set({ isSaving: false });
        }
      },

      applyDevices: async (school: string, data: ListManagementEntry[]) => {
        set({ isApplying: true, error: null });
        try {
          const { lmnApiToken } = useLmnApiStore.getState();
          await eduApi.post(
            `${DEVICES}/${school}`,
            { data },
            {
              headers: { [HTTP_HEADERS.XApiKey]: lmnApiToken },
            },
          );
          set({ devices: data, savedDevices: data, deletedIndices: [] });

          await eduApi.get(`${DEVICES}/${school}/import-devices`, {
            headers: { [HTTP_HEADERS.XApiKey]: lmnApiToken },
            timeout: 130000,
          });
          toast.success(i18n.t('deviceManagement.applyCompleted'));
        } catch (error) {
          handleApiError(error, set);
        } finally {
          set({ isApplying: false });
        }
      },

      setDeviceEntries: (entries: ListManagementEntry[]) => {
        set({ devices: entries });
      },

      addDeletedIndex: (index: number) => {
        set((s) => ({ deletedIndices: [...s.deletedIndices, index] }));
      },

      reset: () => set({ ...initialState }),
    }),
    {
      name: 'device-management-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        devices: state.devices,
        savedDevices: state.savedDevices,
        deletedIndices: state.deletedIndices,
      }),
    },
  ),
);

export default useDeviceManagementStore;
