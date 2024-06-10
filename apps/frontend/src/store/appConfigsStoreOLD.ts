import { AppConfig, AppIntegrationType } from '@/datatypes/types';
import { create, StateCreator } from 'zustand';
import { createJSONStorage, persist, PersistOptions } from 'zustand/middleware';

type AppConfigsStoreOLD = {
  appConfig: AppConfig[];
  setAppConfig: (appConfig: AppConfig[]) => void;
};

type PersistedAppConfigsStore = (
  appConfig: StateCreator<AppConfigsStoreOLD>,
  options: PersistOptions<AppConfigsStoreOLD>,
) => StateCreator<AppConfigsStoreOLD>;

const useAppConfigsStoreOLD = create<AppConfigsStoreOLD>(
  (persist as PersistedAppConfigsStore)(
    (set) => ({
      appConfig: [{ name: '', linkPath: '', icon: '', appType: AppIntegrationType.NATIVE }],
      setAppConfig: (appConfig: AppConfig[]) => {
        set({ appConfig });
      },
    }),
    {
      name: 'appConfig-storage',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

export default useAppConfigsStoreOLD;
