import { create } from 'zustand';

type Store = {
  appName: string;
  setAppName: (appName: string) => void;
};

type FileManager = {
  fileName: string;
  directoryName: string;
  setFileName: (fileName: string) => void;
  setDirectoryName: (directoryName: string) => void;
}

export const useAppDataStore = create<Store>((set) => ({
  appName: 'Edulution UI',
  setAppName: (appName: string) => {
    set({ appName });
  },
}));

export const useFileManagerStore = create<FileManager>((set) => ({
  fileName: '',
  directoryName: '',
  setFileName: (fileName: string) => {
    set((state) => ({fileName: state.fileName = fileName}));
  },
  setDirectoryName: (directoryName: string) => {
    set((state) => ({directoryName: state.directoryName = directoryName}))
}
}));

