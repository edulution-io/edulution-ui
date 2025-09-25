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
import handleApiError from '@/utils/handleApiError';
import { extension as mimeExtension } from 'mime-types';
import { RequestResponseContentType } from '@libs/common/types/http-methods';
import UploadGlobalAsset from '@libs/filesharing/types/uploadGlobalAsset';
import EDU_API_CONFIG_ENDPOINTS from '@libs/appconfig/constants/appconfig-endpoints';

interface FilesystemStore {
  uploadGlobalAsset: (options: UploadGlobalAsset) => Promise<void>;
  reset: () => void;
}

const initialState = {};

const useFilesystemStore = create<FilesystemStore>((set) => ({
  ...initialState,

  uploadGlobalAsset: async ({ destination, file, filename }: UploadGlobalAsset) => {
    try {
      const dest = destination?.trim();
      const name = filename?.trim();

      if (!dest) throw new Error('Destination is required');
      if (!name) throw new Error('Filename is required');

      const form = new FormData();

      form.append('destination', dest);
      form.append('filename', name);

      if (file instanceof File) {
        form.append('file', file, name);
      } else {
        const ext = mimeExtension(file.type || '') || '';
        const fullName = ext && !name.toLowerCase().endsWith(`.${ext.toLowerCase()}`) ? `${name}.${ext}` : name;

        const wrapped = new File([file], fullName, {
          type: file.type || RequestResponseContentType.APPLICATION_OCTET_STREAM,
        });
        form.append('file', wrapped, fullName);
      }

      await eduApi.post<void>(`${EDU_API_CONFIG_ENDPOINTS.FILES}`, form);
    } catch (error) {
      handleApiError(error, set);
    }
  },

  reset: () => set(initialState),
}));

export default useFilesystemStore;
