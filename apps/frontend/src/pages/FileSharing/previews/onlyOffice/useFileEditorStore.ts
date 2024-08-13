import { create } from 'zustand';
import eduApi from '@/api/eduApi';
import FileSharingApiEndpoints from '@libs/filesharing/types/fileSharingApiEndpoints';
import { RequestResponseContentType } from '@libs/common/types/http-methods';
import OnlyOfficeEditorConfig from '@libs/filesharing/types/OnlyOfficeEditorConfig';
import buildApiDeletePathUrl from '@libs/filesharing/utils/buildApiDeletePathUrl';
import DeleteTargetType from '@libs/filesharing/types/deleteTargetType';
import getLastPartOfUrl from '@libs/filesharing/utils/getLastPartOfUrl';
import handleApiError from '@/utils/handleApiError';

type UseFileEditorStore = {
  closeOnlyOfficeDocEditor: () => void;
  showEditor: boolean;
  setShowEditor: (show: boolean) => void;
  getOnlyOfficeJwtToken: (config: OnlyOfficeEditorConfig) => Promise<string>;
  deleteFileAfterEdit: (url: string) => Promise<void>;
  reset: () => void;
};

const initialState = { showEditor: false };

const useFileEditorStore = create<UseFileEditorStore>((set, get) => ({
  ...initialState,
  reset: () => set(initialState),
  setShowEditor: (show: boolean) => set({ showEditor: show }),
  closeOnlyOfficeDocEditor: () => {
    get().setShowEditor(false);
  },

  deleteFileAfterEdit: async (url: string) => {
    try {
      await eduApi.delete(
        buildApiDeletePathUrl(FileSharingApiEndpoints.BASE, getLastPartOfUrl(url), DeleteTargetType.LOCAL),
      );
    } catch (error) {
      handleApiError(error, set);
      throw error;
    }
    return Promise.resolve();
  },

  getOnlyOfficeJwtToken: async (config: OnlyOfficeEditorConfig) => {
    try {
      const response = await eduApi.post<string>(
        `${FileSharingApiEndpoints.FILESHARING_ACTIONS}/${FileSharingApiEndpoints.ONLY_OFFICE_TOKEN}`,
        JSON.stringify(config),
        {
          headers: {
            'Content-Type': RequestResponseContentType.APPLICATION_JSON,
          },
        },
      );

      return response.data;
    } catch (error) {
      handleApiError(error, set);
      throw error;
    }
  },
}));

export default useFileEditorStore;
