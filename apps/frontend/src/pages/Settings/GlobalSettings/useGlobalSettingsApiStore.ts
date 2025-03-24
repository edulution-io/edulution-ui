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
import eduApi from '@/api/eduApi';
import handleApiError from '@/utils/handleApiError';
import MultipleSelectorGroup from '@libs/groups/types/multipleSelectorGroup';

type GlobalSettingsStore = {
  isSetGlobalSettingLoading: boolean;
  isGetGlobalSettingsLoading: boolean;
  mfaEnforcedGroups: MultipleSelectorGroup[];
  reset: () => void;
  getGlobalSettings: () => Promise<MultipleSelectorGroup[]>;
  setGlobalSettings: (settingsDto: { mfaEnforcedGroups: MultipleSelectorGroup[] }) => Promise<void>;
};

const initialValues = {
  isSetGlobalSettingLoading: false,
  isGetGlobalSettingsLoading: false,
  mfaEnforcedGroups: [],
};

const useGlobalSettingsApiStore = create<GlobalSettingsStore>((set) => ({
  ...initialValues,

  getGlobalSettings: async () => {
    set({ isGetGlobalSettingsLoading: true });
    try {
      const { data } = await eduApi.get<{ auth: { mfaEnforcedGroups: MultipleSelectorGroup[] } }>('global-settings');
      set({ mfaEnforcedGroups: data.auth.mfaEnforcedGroups });
      return data.auth.mfaEnforcedGroups;
    } catch (error) {
      handleApiError(error, set);
      return [];
    } finally {
      set({ isGetGlobalSettingsLoading: false });
    }
  },

  setGlobalSettings: async (setGlobalSettings) => {
    set({ isSetGlobalSettingLoading: true });
    try {
      await eduApi.put('global-settings', setGlobalSettings);
    } catch (error) {
      handleApiError(error, set);
    } finally {
      set({ isSetGlobalSettingLoading: false });
    }
  },

  reset: () => set(initialValues),
}));

export default useGlobalSettingsApiStore;
