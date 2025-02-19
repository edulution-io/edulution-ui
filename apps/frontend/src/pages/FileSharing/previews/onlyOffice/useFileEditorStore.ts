/*
 * LICENSE
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

import { create } from 'zustand';
import eduApi from '@/api/eduApi';
import FileSharingApiEndpoints from '@libs/filesharing/types/fileSharingApiEndpoints';
import { RequestResponseContentType } from '@libs/common/types/http-methods';
import OnlyOfficeEditorConfig from '@libs/filesharing/types/OnlyOfficeEditorConfig';
import buildApiDeletePathUrl from '@libs/filesharing/utils/buildApiDeletePathUrl';
import DeleteTargetType from '@libs/filesharing/types/deleteTargetType';
import getLastPartOfUrl from '@libs/filesharing/utils/getLastPartOfUrl';
import handleApiError from '@/utils/handleApiError';

type FileEditorStore = {
  closeOnlyOfficeDocEditor: () => void;
  showEditor: boolean;
  setShowEditor: (show: boolean) => void;
  getOnlyOfficeJwtToken: (config: OnlyOfficeEditorConfig) => Promise<string>;
  deleteFileAfterEdit: (url: string) => Promise<void>;
  reset: () => void;
};

const initialState = { showEditor: false };

const useFileEditorStore = create<FileEditorStore>((set, get) => ({
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
    }
    return Promise.resolve('');
  },
}));

export default useFileEditorStore;
