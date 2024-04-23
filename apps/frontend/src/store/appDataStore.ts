import { ConfigType, AppType } from '@/datatypes/types';
import { create } from 'zustand';

type AppDataStore = {
  appName: string;
  config: ConfigType[];
  setAppName: (appName: string) => void;
  setConfig: (config: ConfigType[]) => void;
};

const useAppDataStore = create<AppDataStore>((set) => ({
  appName: 'Edulution UI',
  setAppName: (appName: string) => {
    set({ appName });
  },

  config: [{ name: '', linkPath: '', icon: '', appType: AppType.NATIVE }],
  setConfig: (config: ConfigType[]) => {
    set({ config });
  },
}));

export default useAppDataStore;
