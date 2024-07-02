import eduApi from '@/api/eduApi';
import handleApiError from '@/utils/handleApiError';
import { create, StateCreator } from 'zustand';
import { createJSONStorage, persist, PersistOptions } from 'zustand/middleware';
import EDU_API_CONFIG_ENDPOINT from '@/api/endpoints/appconfig';
import { AppConfigDto, AppIntegrationType } from '@libs/appconfig/types';

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
          set({ appConfigs: response.data });
        } catch (e) {
          handleApiError(e, set);
        } finally {
          set({ isLoading: false });
        }
      },

      updateAppConfig: async (appConfigs) => {
        set({ isLoading: true, error: null });
        try {
          await eduApi.put(EDU_API_CONFIG_ENDPOINT, appConfigs);
          set({ appConfigs });
        } catch (e) {
          handleApiError(e, set);
        } finally {
          set({ isLoading: false });
        }
      },

      deleteAppConfigEntry: async (name) => {
        set({ isLoading: true, error: null });
        try {
          await eduApi.delete(`${EDU_API_CONFIG_ENDPOINT}/${name}`);
          const newAppConfigs = get().appConfigs.filter((item) => item.name !== name);
          set({ appConfigs: newAppConfigs });
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
      partialize: (state) => ({ appConfigs: state.appConfigs }),
    },
  ),
);

export default useAppConfigsStore;
