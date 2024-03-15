import { create } from 'zustand';

type Store = {
  appName: string;
  setAppName: (appName: string) => void;
};

const useAppDataStore = create<Store>((set) => ({
  appName: 'Edulution UI',
  setAppName: (appName: string) => {
    set({ appName });
  },
}));

export default useAppDataStore;
