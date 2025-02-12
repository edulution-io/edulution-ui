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

import eduApi from '@/api/eduApi';
import handleApiError from '@/utils/handleApiError';
import { create, StateCreator } from 'zustand';
import { createJSONStorage, persist, PersistOptions } from 'zustand/middleware';
import EDU_API_CONFIG_ENDPOINTS from '@libs/appconfig/constants/appconfig-endpoints';
import APP_INTEGRATION_VARIANT from '@libs/appconfig/constants/appIntegrationVariants';
import { toast } from 'sonner';
import i18n from '@/i18n';
import type AppConfigDto from '@libs/appconfig/types/appConfigDto';
import PatchConfigDto from '@libs/common/types/patchConfigDto';
import APPS from '@libs/appconfig/constants/apps';

type AppConfigsStore = {
  appConfigs: AppConfigDto[];
  isLoading: boolean;
  isConfigFileLoading: boolean;
  error: Error | null;
  isAddAppConfigDialogOpen: boolean;
  isDeleteAppConfigDialogOpen: boolean;
  setIsAddAppConfigDialogOpen: (isAddAppConfigDialogOpen: boolean) => void;
  setIsDeleteAppConfigDialogOpen: (isDeleteAppConfigDialogOpen: boolean) => void;
  reset: () => void;
  createAppConfig: (appConfig: AppConfigDto) => Promise<void>;
  getAppConfigs: () => Promise<boolean>;
  updateAppConfig: (appConfigs: AppConfigDto) => Promise<void>;
  patchSingleFieldInConfig: (name: string, patchConfigDto: PatchConfigDto) => Promise<void>;
  deleteAppConfigEntry: (name: string) => Promise<void>;
  getConfigFile: (filePath: string) => Promise<string>;
};

type PersistedAppConfigsStore = (
  appConfig: StateCreator<AppConfigsStore>,
  options: PersistOptions<Partial<AppConfigsStore>>,
) => StateCreator<AppConfigsStore>;

const initialState = {
  isAddAppConfigDialogOpen: false,
  isDeleteAppConfigDialogOpen: false,
  appConfigs: [
    {
      name: APPS.NONE,
      icon: '',
      appType: APP_INTEGRATION_VARIANT.NATIVE,
      options: {},
      accessGroups: [],
      extendedOptions: {},
    },
  ],
  isLoading: false,
  isConfigFileLoading: false,
  error: null,
};

const useAppConfigsStore = create<AppConfigsStore>(
  (persist as PersistedAppConfigsStore)(
    (set) => ({
      ...initialState,
      reset: () => set(initialState),

      setIsAddAppConfigDialogOpen: (isAddAppConfigDialogOpen) => {
        set({ isAddAppConfigDialogOpen });
      },

      setIsDeleteAppConfigDialogOpen: (isDeleteAppConfigDialogOpen) => {
        set({ isDeleteAppConfigDialogOpen });
      },

      createAppConfig: async (appConfig) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await eduApi.post<AppConfigDto[]>(EDU_API_CONFIG_ENDPOINTS.ROOT, appConfig);
          set({ appConfigs: data });
          toast.success(i18n.t('settings.appconfig.update.success'));
        } catch (e) {
          handleApiError(e, set);
        } finally {
          set({ isLoading: false });
        }
      },

      getAppConfigs: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await eduApi.get<AppConfigDto[]>(EDU_API_CONFIG_ENDPOINTS.ROOT);
          set({ appConfigs: response.data });
          return true;
        } catch (e) {
          handleApiError(e, set);
          return false;
        } finally {
          set({ isLoading: false });
        }
      },

      updateAppConfig: async (appConfig: AppConfigDto) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await eduApi.put<AppConfigDto[]>(
            `${EDU_API_CONFIG_ENDPOINTS.ROOT}/${appConfig.name}`,
            appConfig,
          );
          set({ appConfigs: data });
          toast.success(i18n.t('settings.appconfig.update.success'));
        } catch (e) {
          handleApiError(e, set);
        } finally {
          set({ isLoading: false });
        }
      },

      patchSingleFieldInConfig: async (name: string, patchConfigDto: PatchConfigDto) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await eduApi.patch<AppConfigDto[]>(
            `${EDU_API_CONFIG_ENDPOINTS.ROOT}/${name}`,
            patchConfigDto,
          );
          set({ appConfigs: data });
          toast.success(i18n.t('settings.appconfig.update.success'));
        } catch (e) {
          handleApiError(e, set);
        } finally {
          set({ isLoading: false });
        }
      },

      deleteAppConfigEntry: async (name) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await eduApi.delete<AppConfigDto[]>(`${EDU_API_CONFIG_ENDPOINTS.ROOT}/${name}`);
          set({ appConfigs: data });
          toast.success(`${i18n.t(`${name}.sidebar`)} - ${i18n.t('settings.appconfig.delete.success')}`);
        } catch (e) {
          handleApiError(e, set);
        } finally {
          set({ isLoading: false });
        }
      },

      getConfigFile: async (filePath) => {
        set({ isConfigFileLoading: true, error: null });
        try {
          const { data } = await eduApi.get<string>(
            `${EDU_API_CONFIG_ENDPOINTS.ROOT}/${EDU_API_CONFIG_ENDPOINTS.PROXYCONFIG}?filePath=${filePath}`,
          );
          return atob(data);
        } catch (e) {
          handleApiError(e, set);
          return '';
        } finally {
          set({ isConfigFileLoading: false });
        }
      },
    }),
    {
      name: 'appConfig-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ appConfigs: state.appConfigs }),
    },
  ),
);

export default useAppConfigsStore;
