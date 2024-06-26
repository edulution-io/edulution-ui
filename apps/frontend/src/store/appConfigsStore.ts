import eduApi from '@/api/eduApi';
import handleApiError from '@/utils/handleApiError';
import { create, StateCreator } from 'zustand';
import { createJSONStorage, persist, PersistOptions } from 'zustand/middleware';
import EDU_API_CONFIG_ENDPOINT from '@/api/endpoints/appconfig';
import { AppConfigDto } from '@libs/appconfig/types/appconfig.dto';
import AppIntegrationType from '@libs/appconfig/types/appIntegrationType';

type AppConfigsStore = {
  appConfigs: AppConfigDto[];
  isLoading: boolean;
  error: Error | null;
  getAppConfigs: () => Promise<void>;
  updateAppConfig: (appConfigs: AppConfigDto[]) => Promise<void>;
  deleteAppConfigEntry: (name: string) => Promise<void>;
};

type PersistedAppConfigsStore = (
  appConfig: StateCreator<AppConfigsStore>,
  options: PersistOptions<Partial<AppConfigsStore>>,
) => StateCreator<AppConfigsStore>;

const useAppConfigsStore = create<AppConfigsStore>(
  (persist as PersistedAppConfigsStore)(
    (set, get) => ({
      appConfigs: [{ name: '', icon: '', appType: AppIntegrationType.NATIVE, options: {} }],
      isLoading: false,
      error: null,

      getAppConfigs: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await eduApi.get<AppConfigDto[]>(EDU_API_CONFIG_ENDPOINT);
          set({ appConfigs: response.data, isLoading: false });
        } catch (e) {
          handleApiError(e, set);
        }
      },

      updateAppConfig: async (appConfigs) => {
        set({ appConfigs, isLoading: true });
        try {
          await eduApi.put(EDU_API_CONFIG_ENDPOINT, appConfigs);
          set({ isLoading: false });
        } catch (e) {
          handleApiError(e, set);
        }
      },

      deleteAppConfigEntry: async (name) => {
        set({ isLoading: true });
        try {
          await eduApi.delete(`${EDU_API_CONFIG_ENDPOINT}/${name}`);
          const newAppConfigs = get().appConfigs.filter((item) => item.name !== name);
          set({ appConfigs: newAppConfigs, isLoading: false });
        } catch (e) {
          handleApiError(e, set);
        }
      },
    }),
    {
      name: 'appConfig-storage',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({ appConfigs: state.appConfigs }),
    },
  ),
);

export default useAppConfigsStore;
