import { create } from 'zustand';
import { DirectoryFile } from '@/datatypes/filesystem';

type FileEditorStore = {
  editableFiles: DirectoryFile[];
  previewFile: DirectoryFile | null;
  appendEditorFile: (file: DirectoryFile) => void;
  setPreviewFile: (file: DirectoryFile | null) => void;
};

const initialState: Omit<FileEditorStore, 'appendEditorFile' | 'setPreviewFile'> = {
  editableFiles: [],
  previewFile: null,
};

const useFileEditorStore = create<FileEditorStore>((set) => ({
  ...initialState,
  setPreviewFile: (file: DirectoryFile | null) => set({ previewFile: file }),
  appendEditorFile: (file: DirectoryFile) => set((state) => ({ editableFiles: [...state.editableFiles, file] })),
}));

export default useFileEditorStore;
