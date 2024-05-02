import { AppConfigType, AppIntegrationType } from '@/datatypes/types';
import { create, StateCreator } from 'zustand';
import { persist, createJSONStorage, PersistOptions } from 'zustand/middleware';

type AppDataStore = {
  config: AppConfigType[];
  setConfig: (config: AppConfigType[]) => void;
};

type PersistedAppDataStore = (
  config: StateCreator<AppDataStore>,
  options: PersistOptions<AppDataStore>,
) => StateCreator<AppDataStore>;

const useAppDataStore = create<AppDataStore>(
  (persist as PersistedAppDataStore)(
    (set) => ({
      config: [{ name: '', linkPath: '', icon: '', appType: AppIntegrationType.NATIVE }],
      setConfig: (config: AppConfigType[]) => {
        set({ config });
      },
    }),
    {
      name: 'config-storage',
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
);

export default useAppDataStore;
