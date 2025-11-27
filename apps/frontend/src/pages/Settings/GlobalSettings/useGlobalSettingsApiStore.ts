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
import { persist } from 'zustand/middleware';
import { toast } from 'sonner';
import i18n from '@/i18n';
import handleApiError from '@/utils/handleApiError';
import eduApi from '@/api/eduApi';
import {
  GLOBAL_SETTINGS_ADMIN_ENDPOINT,
  GLOBAL_SETTINGS_PUBLIC_THEME_ENDPOINT,
  GLOBAL_SETTINGS_ROOT_ENDPOINT,
} from '@libs/global-settings/constants/globalSettingsApiEndpoints';
import type GlobalSettingsDto from '@libs/global-settings/types/globalSettings.dto';
import type ThemeSettingsDto from '@libs/global-settings/types/themeSettings.dto';
import defaultValues from '@libs/global-settings/constants/defaultValues';
import deepMerge from '@libs/common/utils/Object/deepMerge';

type GlobalSettingsStore = {
  isSetGlobalSettingLoading: boolean;
  isGetGlobalSettingsLoading: boolean;
  isGetGlobalAdminSettingsLoading: boolean;
  isGetPublicThemeLoading: boolean;
  globalSettings: GlobalSettingsDto | null;
  publicTheme: ThemeSettingsDto | null;
  reset: () => void;
  getGlobalSettings: () => Promise<void>;
  getGlobalAdminSettings: () => Promise<void>;
  setGlobalSettings: (globalSettingsDto: GlobalSettingsDto) => Promise<void>;
  getPublicTheme: () => Promise<void>;
};

const initialValues = {
  isSetGlobalSettingLoading: false,
  isGetGlobalSettingsLoading: false,
  isGetGlobalAdminSettingsLoading: false,
  isGetPublicThemeLoading: false,
  mfaEnforcedGroups: [],
  globalSettings: null,
  publicTheme: null,
};

const useGlobalSettingsApiStore = create<GlobalSettingsStore>()(
  persist(
    (set, get) => ({
      ...initialValues,

      getGlobalSettings: async () => {
        set({ isGetGlobalSettingsLoading: true });
        try {
          const { data } = await eduApi.get<GlobalSettingsDto>(GLOBAL_SETTINGS_ROOT_ENDPOINT);

          const merged = deepMerge(get().globalSettings, data);
          set({ globalSettings: merged });
        } catch (error) {
          handleApiError(error, set);
        } finally {
          set({ isGetGlobalSettingsLoading: false });
        }
      },

      getGlobalAdminSettings: async () => {
        set({ isGetGlobalAdminSettingsLoading: true });
        try {
          const { data } = await eduApi.get<GlobalSettingsDto>(
            `${GLOBAL_SETTINGS_ROOT_ENDPOINT}/${GLOBAL_SETTINGS_ADMIN_ENDPOINT}`,
          );

          const merged = deepMerge(get().globalSettings, data);
          set({ globalSettings: merged });
        } catch (error) {
          handleApiError(error, set);
        } finally {
          set({ isGetGlobalAdminSettingsLoading: false });
        }
      },

      setGlobalSettings: async (globalSettingsDto) => {
        set({ isSetGlobalSettingLoading: true });
        try {
          await eduApi.put(GLOBAL_SETTINGS_ROOT_ENDPOINT, globalSettingsDto);
          set({ globalSettings: globalSettingsDto, publicTheme: globalSettingsDto.theme });
          toast.success(i18n.t('settings.globalSettings.updateSuccessful'));
        } catch (error) {
          handleApiError(error, set);
        } finally {
          set({ isSetGlobalSettingLoading: false });
        }
      },

      getPublicTheme: async () => {
        set({ isGetPublicThemeLoading: true });
        try {
          const { data } = await eduApi.get<ThemeSettingsDto>(
            `${GLOBAL_SETTINGS_ROOT_ENDPOINT}/${GLOBAL_SETTINGS_PUBLIC_THEME_ENDPOINT}`,
          );

          if (data) {
            set({ publicTheme: data });
          } else {
            set({ publicTheme: defaultValues.theme });
          }
        } catch (error) {
          set({ publicTheme: defaultValues.theme });
          handleApiError(error, set);
        } finally {
          set({ isGetPublicThemeLoading: false });
        }
      },

      reset: () => {
        const currentPublicTheme = get().publicTheme;
        set({ ...initialValues, publicTheme: currentPublicTheme });
      },
    }),
    {
      name: 'global-settings-storage',
      version: 1,
      partialize: (state) => ({ publicTheme: state.publicTheme }),
    },
  ),
);

export default useGlobalSettingsApiStore;
