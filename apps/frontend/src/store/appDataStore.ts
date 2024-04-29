import { ConfigType, AppType } from '@/datatypes/types';
import { create, StateCreator } from 'zustand';
import { persist, createJSONStorage, PersistOptions } from 'zustand/middleware';

type AppDataStore = {
  config: ConfigType[];
  setConfig: (config: ConfigType[]) => void;
};

type PersistedAppDataStore = (
  config: StateCreator<AppDataStore>,
  options: PersistOptions<AppDataStore>,
) => StateCreator<AppDataStore>;

const useAppDataStore = create<AppDataStore>(
  (persist as PersistedAppDataStore)(
    (set) => ({
      config: [{ name: '', linkPath: '', icon: '', appType: AppType.NATIVE }],
      setConfig: (config: ConfigType[]) => {
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
