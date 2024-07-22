import { create, StateCreator } from 'zustand';
import { createJSONStorage, persist, PersistOptions } from 'zustand/middleware';
import { DirectoryFile } from '@libs/filesharing/filesystem';
import eduApi from '@/api/eduApi';
import OnlyOfficeEditorConfig from '@/pages/FileSharing/previews/onlyOffice/OnlyOfficeEditorConfig';

type FileEditorStore = {
  editableFiles: DirectoryFile[];
  previewFile: DirectoryFile | null;
  appendEditorFile: (file: DirectoryFile) => void;
  removeEditorFile: (filename: string) => void;
  setPreviewFile: (file: DirectoryFile | null) => void;
  closeOnlyOfficeDocEditor: () => void;
  showEditor: boolean;
  setShowEditor: (show: boolean) => void;
  getOnlyOfficeJwtToken: (config: OnlyOfficeEditorConfig) => Promise<string>;
  reset: () => void;
};

const initialState: Omit<
  FileEditorStore,
  | 'appendEditorFile'
  | 'removeEditorFile'
  | 'setPreviewFile'
  | 'reset'
  | 'setShowEditor'
  | 'closeOnlyOfficeDocEditor'
  | 'getOnlyOfficeJwtToken'
> = {
  editableFiles: [],
  previewFile: null,
  showEditor: false,
};

type PersistedFileEditorStore = (
  fileManagerData: StateCreator<FileEditorStore>,
  options: PersistOptions<FileEditorStore>,
) => StateCreator<FileEditorStore>;

const useFileEditorStore = create<FileEditorStore>(
  (persist as PersistedFileEditorStore)(
    (set, get) => ({
      ...initialState,
      setPreviewFile: (file: DirectoryFile | null) => set({ previewFile: file }),
      appendEditorFile: (file: DirectoryFile) =>
        set((state) => {
          const exists = state.editableFiles.some((editableFile) => editableFile.filename === file.filename);
          if (!exists) {
            return { editableFiles: [...state.editableFiles, file] };
          }
          return state;
        }),
      removeEditorFile: (filename: string) =>
        set((state) => ({
          editableFiles: state.editableFiles.filter((file) => file.filename !== filename),
        })),
      reset: () => set(initialState),
      setShowEditor: (show: boolean) => set({ showEditor: show }),
      closeOnlyOfficeDocEditor: () => {
        get().setPreviewFile(null);
        get().setShowEditor(false);
      },
      getOnlyOfficeJwtToken: async (config: OnlyOfficeEditorConfig) => {
        try {
          const response = await eduApi.post('/filesharing/oftoken/', JSON.stringify(config), {
            headers: {
              'Content-Type': 'application/json',
            },
          });

          return response.data as string;
        } catch (error) {
          console.error('Error fetching OnlyOffice JWT token:', error);
          throw error;
        }
      },
    }),

    {
      name: 'fileEditorStorage',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        previewFile: state.previewFile,
        editableFiles: state.editableFiles,
      }),
    } as PersistOptions<FileEditorStore>,
  ),
);

export default useFileEditorStore;
