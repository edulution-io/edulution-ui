import eduApi from '@/api/eduApi';
import handleApiError from '@/utils/handleApiError';
import { create, StateCreator } from 'zustand';
import { createJSONStorage, persist, PersistOptions } from 'zustand/middleware';
import EDU_API_CONFIG_ENDPOINTS from '@libs/appconfig/constants/appconfig-endpoints';
import { AppConfigDto } from '@libs/appconfig/types';
import APP_INTEGRATION_VARIANT from '@libs/appconfig/constants/appIntegrationVariants';
import { toast } from 'sonner';
import i18n from '@/i18n';

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
  getAppConfigs: () => Promise<boolean>;
  updateAppConfig: (appConfigs: AppConfigDto[]) => Promise<void>;
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
      name: '',
      icon: '',
      appType: APP_INTEGRATION_VARIANT.NATIVE,
      options: {},
      accessGroups: [],
      extendedOptions: [],
    },
  ],
  isLoading: false,
  isConfigFileLoading: false,
  error: null,
};

const useAppConfigsStore = create<AppConfigsStore>(
  (persist as PersistedAppConfigsStore)(
    (set, get) => ({
      ...initialState,
      reset: () => set(initialState),

      setIsAddAppConfigDialogOpen: (isAddAppConfigDialogOpen) => {
        set({ isAddAppConfigDialogOpen });
      },

      setIsDeleteAppConfigDialogOpen: (isDeleteAppConfigDialogOpen) => {
        set({ isDeleteAppConfigDialogOpen });
      },

      getAppConfigs: async () => {
        const { isLoading } = get();
        if (isLoading) {
          return false;
        }
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

      updateAppConfig: async (appConfigs) => {
        set({ isLoading: true, error: null });
        try {
          await eduApi.put<AppConfigDto[]>(EDU_API_CONFIG_ENDPOINTS.ROOT, appConfigs);
          set({ appConfigs });
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
          await eduApi.delete(`${EDU_API_CONFIG_ENDPOINTS.ROOT}/${name}`);
          const newAppConfigs = get().appConfigs.filter((item) => item.name !== name);
          set({ appConfigs: newAppConfigs });
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
