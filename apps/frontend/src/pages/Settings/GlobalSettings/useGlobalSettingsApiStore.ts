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

import { create, StateCreator } from 'zustand';
import eduApi from '@/api/eduApi';
import handleApiError from '@/utils/handleApiError';
import { GLOBAL_SETTINGS_ROOT_ENDPOINT } from '@libs/global-settings/constants/globalSettingsApiEndpoints';
import type GlobalSettingsDto from '@libs/global-settings/types/globalSettings.dto';
import { createJSONStorage, persist, PersistOptions } from 'zustand/middleware';

type GlobalSettingsStore = {
  isSetGlobalSettingLoading: boolean;
  isGetGlobalSettingsLoading: boolean;
  globalSettings: GlobalSettingsDto;
  reset: () => void;
  getGlobalSettings: (projection?: 'auth') => Promise<GlobalSettingsDto>;
  setGlobalSettings: (globalSettingsDto: GlobalSettingsDto) => Promise<void>;
};

type PersistedGlobalSettingsStore = (
  globalSettingsState: StateCreator<GlobalSettingsStore>,
  options: PersistOptions<Partial<GlobalSettingsStore>>,
) => StateCreator<GlobalSettingsStore>;

const initialGlobalSettings: GlobalSettingsDto = {
  auth: {
    mfaEnforcedGroups: [],
  },
};

const initialValues = {
  isSetGlobalSettingLoading: false,
  isGetGlobalSettingsLoading: false,
  mfaEnforcedGroups: [],
  globalSettings: initialGlobalSettings,
};

const useGlobalSettingsApiStore = create<GlobalSettingsStore>(
  (persist as PersistedGlobalSettingsStore)(
    (set) => ({
      ...initialValues,

      getGlobalSettings: async (projection?) => {
        set({ isGetGlobalSettingsLoading: true });
        try {
          const { data } = await eduApi.get<GlobalSettingsDto>(GLOBAL_SETTINGS_ROOT_ENDPOINT, {
            params: { projection },
          });
          set({ globalSettings: { ...data } });

          return data;
        } catch (error) {
          handleApiError(error, set);
          return initialGlobalSettings;
        } finally {
          set({ isGetGlobalSettingsLoading: false });
        }
      },

      setGlobalSettings: async (globalSettingsDto) => {
        set({ isSetGlobalSettingLoading: true });
        try {
          await eduApi.put(GLOBAL_SETTINGS_ROOT_ENDPOINT, globalSettingsDto);
          set({ globalSettings: globalSettingsDto });
        } catch (error) {
          handleApiError(error, set);
        } finally {
          set({ isSetGlobalSettingLoading: false });
        }
      },

      reset: () => set(initialValues),
    }),
    {
      name: 'global-settings-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ globalSettings: state.globalSettings }),
    },
  ),
);

export default useGlobalSettingsApiStore;
