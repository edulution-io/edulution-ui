import {create} from 'zustand';
import {DirectoryFile} from "../../datatypes/filesystem.ts";

type Store = {
    appName: string;
    setAppName: (appName: string) => void;
};

type FileManager = {
    fileName: string;
    directoryName: string;
    selectedItems: DirectoryFile[]
    setFileName: (fileName: string) => void;
    setDirectoryName: (directoryName: string) => void;
    setSelectedItems: (items: DirectoryFile[]) => void;
}

export const useAppDataStore = create<Store>((set) => ({
    appName: 'Edulution UI',
    setAppName: (appName: string) => {
        set({appName});
    },
}));

export const useFileManagerStore = create<FileManager>((set) => ({
    fileName: '',
    directoryName: '',
    selectedItems: [],
    setFileName: (fileName: string) => {
        set((state) => ({fileName: state.fileName = fileName}));
    },
    setDirectoryName: (directoryName: string) => {
        set((state) => ({directoryName: state.directoryName = directoryName}))
    },

    setSelectedItems: (items: DirectoryFile[]) => {
        set(state => ({...state, selectedItems: items}));
    }
}));

