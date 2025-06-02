/*
 * LICENSE
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

import { create } from 'zustand';
import { toast } from 'sonner';
import i18n from '@/i18n';
import handleApiError from '@/utils/handleApiError';
import eduApi from '@/api/eduApi';
import {
  GLOBAL_SETTINGS_PROJECTION_PARAM_AUTH,
  GLOBAL_SETTINGS_PROJECTION_PARAM_GENERAL,
  GLOBAL_SETTINGS_ROOT_ENDPOINT,
} from '@libs/global-settings/constants/globalSettingsApiEndpoints';
import type GlobalSettingsDto from '@libs/global-settings/types/globalSettings.dto';
import defaultValues from '@libs/global-settings/constants/defaultValues';

type GlobalSettingsStore = {
  isSetGlobalSettingLoading: boolean;
  isGetGlobalSettingsLoading: boolean;
  globalSettings: GlobalSettingsDto;
  reset: () => void;
  getGlobalSettings: (
    projection?: typeof GLOBAL_SETTINGS_PROJECTION_PARAM_AUTH | typeof GLOBAL_SETTINGS_PROJECTION_PARAM_GENERAL,
  ) => Promise<void>;
  setGlobalSettings: (globalSettingsDto: GlobalSettingsDto) => Promise<void>;
};

const initialValues = {
  isSetGlobalSettingLoading: false,
  isGetGlobalSettingsLoading: false,
  mfaEnforcedGroups: [],
  globalSettings: defaultValues,
};

const useGlobalSettingsApiStore = create<GlobalSettingsStore>((set, get) => ({
  ...initialValues,

  getGlobalSettings: async (projection?) => {
    if (get().isGetGlobalSettingsLoading) return;

    set({ isGetGlobalSettingsLoading: true });
    try {
      const { data } = await eduApi.get<GlobalSettingsDto>(GLOBAL_SETTINGS_ROOT_ENDPOINT, {
        params: { projection },
      });

      if (data) {
        if (projection) {
          set((state) => ({
            globalSettings: {
              ...state.globalSettings,
              ...data,
            },
          }));
        } else {
          set({ globalSettings: data });
        }
      }
    } catch (error) {
      handleApiError(error, set);
    } finally {
      set({ isGetGlobalSettingsLoading: false });
    }
  },

  setGlobalSettings: async (globalSettingsDto) => {
    set({ isSetGlobalSettingLoading: true });
    try {
      await eduApi.put(GLOBAL_SETTINGS_ROOT_ENDPOINT, globalSettingsDto);
      set({ globalSettings: globalSettingsDto });
      toast.success(i18n.t('settings.globalSettings.updateSuccessful'));
    } catch (error) {
      handleApiError(error, set);
    } finally {
      set({ isSetGlobalSettingLoading: false });
    }
  },

  reset: () => set(initialValues),
}));

export default useGlobalSettingsApiStore;
