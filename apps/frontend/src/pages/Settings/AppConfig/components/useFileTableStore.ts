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
import { type FileTableStore } from '@libs/appconfig/types/fileTableStore';
import eduApi from '@/api/eduApi';
import FileInfoDto from '@libs/appconfig/types/fileInfo.dto';
import handleApiError from '@/utils/handleApiError';
import EDU_API_CONFIG_ENDPOINTS from '@libs/appconfig/constants/appconfig-endpoints';

const initialValues = {
  publicFilesInfo: [],
  tableContentData: [],
  isLoading: true,
  error: null,
  selectedRows: {},
  files: {},
};

const useFileTableStore = create<FileTableStore>((set) => ({
  ...initialValues,

  setSelectedRows: (selectedRows) => set({ selectedRows }),

  setIsLoading: (isLoading: boolean) => set({ isLoading }),

  fetchTableContent: async (applicationName) => {
    set({ isLoading: true });
    try {
      const { data } = await eduApi.get<FileInfoDto[]>(`${EDU_API_CONFIG_ENDPOINTS.FILES}/info/${applicationName}`);

      set({ tableContentData: data });
    } catch (error) {
      handleApiError(error, set);
    } finally {
      set({ isLoading: false });
    }
  },

  getPublicFilesInfo: async (applicationName) => {
    set({ isLoading: true });
    try {
      const { data } = await eduApi.get<FileInfoDto[]>(
        `${EDU_API_CONFIG_ENDPOINTS.FILES}/public/info/${applicationName}`,
      );
      set({ publicFilesInfo: data });
    } catch (error) {
      handleApiError(error, set);
    } finally {
      set({ isLoading: false });
    }
  },

  deleteTableEntry: async (applicationName, fileName) => {
    set({ isLoading: true, error: null });
    try {
      await eduApi.delete(`${EDU_API_CONFIG_ENDPOINTS.FILES}/${applicationName}/${fileName}`);
    } catch (e) {
      handleApiError(e, set);
    } finally {
      set({ isLoading: false });
    }
  },
  reset: () => set(initialValues),
}));

export default useFileTableStore;
