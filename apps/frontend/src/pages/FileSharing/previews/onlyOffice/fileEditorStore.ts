import { create } from 'zustand';
import eduApi from '@/api/eduApi';
import OnlyOfficeEditorConfig from '@/pages/FileSharing/previews/onlyOffice/OnlyOfficeEditorConfig';
import FileSharingApiEndpoints from '@libs/filesharing/types/fileSharingApiEndpoints';

type FileEditorStore = {
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
  showEditor: false,
};

const useFileEditorStore = create<FileEditorStore>((set, get) => ({
  ...initialState,
  reset: () => set(initialState),
  setShowEditor: (show: boolean) => set({ showEditor: show }),
  closeOnlyOfficeDocEditor: () => {
    get().setShowEditor(false);
  },
  getOnlyOfficeJwtToken: async (config: OnlyOfficeEditorConfig) => {
    try {
      const response = await eduApi.post(
        `${FileSharingApiEndpoints.FILESHARING_ACTIONS}/${FileSharingApiEndpoints.GET_ONLY_OFFICE_TOKEN}`,
        JSON.stringify(config),
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      return response.data as string;
    } catch (error) {
      console.error('Error fetching OnlyOffice JWT token:', error);
      throw error;
    }
  },
}));

export default useFileEditorStore;
