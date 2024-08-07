import { create } from 'zustand';
import eduApi from '@/api/eduApi';
import FileSharingApiEndpoints from '@libs/filesharing/types/fileSharingApiEndpoints';
import CleanUpApiEndpoints from '@libs/cleanUp/types/CleanUpApiEndpoints';
import buildApiCleanPath from '@libs/cleanUp/utilits/buildApiCleanPath';
import getLastPartOfUrl from '@libs/cleanUp/utilits/getLastPartOfUrl';
import { RequestResponseContentType } from '@libs/common/types/http-methods';
import OnlyOfficeEditorConfig from '@libs/filesharing/types/OnlyOfficeEditorConfig';

type FileEditorStore = {
  closeOnlyOfficeDocEditor: () => void;
  showEditor: boolean;
  setShowEditor: (show: boolean) => void;
  getOnlyOfficeJwtToken: (config: OnlyOfficeEditorConfig) => Promise<string>;
  deleteFileAfterEdit: (url: string) => Promise<void>;
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
  | 'deleteFileAfterEdit'
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

  deleteFileAfterEdit: async (url: string) => {
    try {
      await eduApi.delete(buildApiCleanPath(CleanUpApiEndpoints.BASE, getLastPartOfUrl(url)));
    } catch (error) {
      console.error('Error deleting file after editing:', error);
      throw error;
    }
    return Promise.resolve();
  },

  getOnlyOfficeJwtToken: async (config: OnlyOfficeEditorConfig) => {
    try {
      const response = await eduApi.post(
        `${FileSharingApiEndpoints.FILESHARING_ACTIONS}/${FileSharingApiEndpoints.GET_ONLY_OFFICE_TOKEN}`,
        JSON.stringify(config),
        {
          headers: {
            'Content-Type': RequestResponseContentType.APPLICATION_JSON,
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
