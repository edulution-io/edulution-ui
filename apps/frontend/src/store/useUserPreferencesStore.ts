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
import USER_PREFERENCES_ENDPOINT from '@libs/user-preferences/constants/user-preferences-endpoint';
import UserPreferencesDto from '@libs/user-preferences/types/user-preferences.dto';
import handleApiError from '@/utils/handleApiError';

interface UserPreferencesStore {
  isLoading: boolean;
  error: Error | null;
  preferences: UserPreferencesDto | null;
  getUserPreferences: (fields: string[]) => Promise<UserPreferencesDto | null>;
}

const useUserPreferencesStore = create<UserPreferencesStore>((set) => ({
  isLoading: false,
  error: null,
  preferences: null,

  getUserPreferences: async (fields) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await eduApi.get<UserPreferencesDto>(`${USER_PREFERENCES_ENDPOINT}?fields=${fields.join(',')}`);
      set({ preferences: data, isLoading: false });

      return data;
    } catch (error) {
      handleApiError(error, set);
      return null;
    } finally {
      set({ isLoading: false });
    }
  },
}));

export default useUserPreferencesStore;
