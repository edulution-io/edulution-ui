import eduApi from '@/api/eduApi';
import handleApiError from '@/utils/handleApiError';
import { create, StateCreator } from 'zustand';
import { createJSONStorage, persist, PersistOptions } from 'zustand/middleware';
import { EDU_API_CONFIG_ENDPOINT } from '@libs/appconfig/constants';
import { AppConfigDto, AppIntegrationType } from '@libs/appconfig/types';
import { toast } from 'sonner';
import i18n from '@/i18n';

type AppConfigsStore = {
  appConfigs: AppConfigDto[];
  isLoading: boolean;
  error: Error | null;
  isAddAppConfigDialogOpen: boolean;
  setIsAddAppConfigDialogOpen: (isAddAppConfigDialogOpen: boolean) => void;
  reset: () => void;
  getAppConfigs: () => Promise<boolean>;
  updateAppConfig: (appConfigs: AppConfigDto[]) => Promise<void>;
  deleteAppConfigEntry: (name: string) => Promise<void>;
};

type PersistedAppConfigsStore = (
  appConfig: StateCreator<AppConfigsStore>,
  options: PersistOptions<Partial<AppConfigsStore>>,
) => StateCreator<AppConfigsStore>;

const initialState = {
  isAddAppConfigDialogOpen: false,
  appConfigs: [{ name: '', icon: '', appType: AppIntegrationType.NATIVE, options: {}, accessGroups: [] }],
  isLoading: false,
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

      getAppConfigs: async () => {
        const { isLoading } = get();
        if (isLoading) {
          return false;
        }
        set({ isLoading: true, error: null });
        try {
          const response = await eduApi.get<AppConfigDto[]>(EDU_API_CONFIG_ENDPOINT);
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
          await eduApi.put<AppConfigDto[]>(EDU_API_CONFIG_ENDPOINT, appConfigs);
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
          await eduApi.delete(`${EDU_API_CONFIG_ENDPOINT}/${name}`);
          const newAppConfigs = get().appConfigs.filter((item) => item.name !== name);
          set({ appConfigs: newAppConfigs });
          toast.success(`${i18n.t(`${name}.sidebar`)} - ${i18n.t('settings.appconfig.delete.success')}`, {
            description: new Date().toLocaleString(),
          });
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
