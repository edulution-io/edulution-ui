import { create } from 'zustand';
import { DirectoryFile } from '@/datatypes/filesystem';

type FileEditorStore = {
  editableFiles: DirectoryFile[];
  appendEditorFile: (file: DirectoryFile) => void;
};

const initialState: Omit<FileEditorStore, 'appendEditorFile'> = {
  editableFiles: [],
};

const useFileEditorStore = create<FileEditorStore>((set) => ({
  ...initialState,

  appendEditorFile: (file: DirectoryFile) => set((state) => ({ editableFiles: [...state.editableFiles, file] })),
}));

export default useFileEditorStore;
