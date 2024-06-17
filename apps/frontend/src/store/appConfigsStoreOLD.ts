import eduApi from '@/api/eduApi';
import { AppConfig, AppIntegrationType } from '@/datatypes/types';
import handleApiError from '@/utils/handleApiError';
import { create, StateCreator } from 'zustand';
import { createJSONStorage, persist, PersistOptions } from 'zustand/middleware';

type AppConfigsStoreOLD = {
  appConfig: AppConfig[];
  isLoading: boolean;
  error: Error | null;
  getAppConfigs: (setIsLoading: boolean) => Promise<void>;
  updateAppConfig: (appConfig: AppConfig[]) => Promise<void>;
  deleteAppConfigEntry: (name: string) => Promise<void>;
};

type PersistedAppConfigsStore = (
  appConfig: StateCreator<AppConfigsStoreOLD>,
  options: PersistOptions<AppConfigsStoreOLD>,
) => StateCreator<AppConfigsStoreOLD>;

const EDU_API_CONFIG_ENDPOINT = 'appconfig';

const useAppConfigsStoreOLD = create<AppConfigsStoreOLD>(
  (persist as PersistedAppConfigsStore)(
    (set, get) => ({
      appConfig: [{ name: '', icon: '', appType: AppIntegrationType.NATIVE, options: {} }],
      isLoading: false,
      error: null,

      getAppConfigs: async (setIsLoading = true) => {
        set({ isLoading: setIsLoading, error: null });
        try {
          const response = await eduApi.get<AppConfig[]>(EDU_API_CONFIG_ENDPOINT);
          set({ appConfig: response.data, isLoading: false });
        } catch (e) {
          handleApiError(e, set);
        } finally {
          set({ isLoading: false });
        }
      },

      updateAppConfig: async (appConfig) => {
        set({ appConfig, isLoading: true });
        try {
          await eduApi.put(EDU_API_CONFIG_ENDPOINT, appConfig);
          set({ isLoading: false });
        } catch (e) {
          handleApiError(e, set);
        } finally {
          set({ isLoading: false });
        }
      },

      deleteAppConfigEntry: async (name) => {
        set({ isLoading: true });
        try {
          await eduApi.delete(`${EDU_API_CONFIG_ENDPOINT}/${name}`);
          const newAppConfig = get().appConfig.filter((item) => item.name !== name);
          set({ appConfig: newAppConfig, isLoading: false });
        } catch (e) {
          handleApiError(e, set);
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: 'appConfig-storage',
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
);

export default useAppConfigsStoreOLD;
