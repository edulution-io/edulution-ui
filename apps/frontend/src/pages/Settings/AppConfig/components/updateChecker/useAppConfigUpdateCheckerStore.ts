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
import SogoThemeVersionDto from '@libs/mail/types/sogo-theme-version.dto';
import { toast } from 'sonner';
import i18n from '@/i18n';

type AppConfigUpdateCheckerStore = {
  isLoading: boolean;
  isUpdating: boolean;
  versionInfo: SogoThemeVersionDto | null;
  error: Error | null;
  checkVersion: (baseEndpoint: string, path: string, silent?: boolean) => Promise<void>;
  triggerUpdate: (baseEndpoint: string, path: string) => Promise<void>;
  reset: () => void;
};

const initialState = {
  isLoading: false,
  isUpdating: false,
  versionInfo: null,
  error: null,
};

const useAppConfigUpdateCheckerStore = create<AppConfigUpdateCheckerStore>((set) => ({
  ...initialState,

  checkVersion: async (baseEndpoint: string, path: string, silent?: boolean) => {
    if (!baseEndpoint || !path) return;

    set({ isLoading: true, error: null });
    try {
      const { data } = await eduApi.get<SogoThemeVersionDto>(`${baseEndpoint}/${path}`);

      set({ versionInfo: data });

      if (!silent) {
        toast.success(i18n.t('appExtendedOptions.updateChecker.checkVersionSuccess'));
      }
    } catch (error) {
      handleApiError(error, set);
    } finally {
      set({ isLoading: false });
    }
  },

  triggerUpdate: async (baseEndpoint: string, path: string) => {
    if (!baseEndpoint || !path) return;

    set({ isUpdating: true, error: null });
    try {
      await eduApi.post(`${baseEndpoint}/${path}/update`);

      const { data } = await eduApi.get<SogoThemeVersionDto>(`${baseEndpoint}/${path}`);

      set({ versionInfo: data });
    } catch (error) {
      handleApiError(error, set);
    } finally {
      set({ isUpdating: false });
    }
  },

  reset: () => set(initialState),
}));

export default useAppConfigUpdateCheckerStore;
