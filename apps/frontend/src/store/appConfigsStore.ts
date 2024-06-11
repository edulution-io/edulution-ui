// import { AppIntegrationType } from '@/datatypes/types';
import { AppConfigDto, AppIntegrationType } from '@libs/appconfig/types/appconfig.d';

import { create, StateCreator } from 'zustand';
import { persist, createJSONStorage, PersistOptions } from 'zustand/middleware';

type AppConfigsStore = {
  appConfig: AppConfigDto[];
  setAppConfig: (appConfig: AppConfigDto[]) => void;
};

type PersistedAppConfigsStore = (
  appConfig: StateCreator<AppConfigsStore>,
  options: PersistOptions<AppConfigsStore>,
) => StateCreator<AppConfigsStore>;

const useAppConfigsStore = create<AppConfigsStore>(
  (persist as PersistedAppConfigsStore)(
    (set) => ({
      appConfig: [{ name: '', linkPath: '', icon: '', appType: AppIntegrationType.NATIVE }],
      setAppConfig: (appConfig: AppConfigDto[]) => {
        set({ appConfig });
      },
    }),
    {
      name: 'appConfig-storage',
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
);

export default useAppConfigsStore;
