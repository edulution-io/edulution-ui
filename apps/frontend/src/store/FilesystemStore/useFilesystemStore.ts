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
import EDU_API_CONFIG_ENDPOINTS from '@libs/appconfig/constants/appconfig-endpoints';
import eduApi from '@/api/eduApi';
import mimeTypeToExtension from '@libs/filesystem/constants/mimeTypeToExtension';
import { RequestResponseContentType } from '@libs/common/types/http-methods';

function getExtensionFromMimeType(mimeType?: string): string {
  return mimeType && mimeTypeToExtension[mimeType] ? `.${mimeTypeToExtension[mimeType]}` : '';
}

interface FilesystemStore {
  uploadGlobalAsset: (options: { destination: string; file: File | Blob; filename?: string }) => Promise<void>;
  reset: () => void;
}

const initialState = {};

const useFilesystemStore = create<FilesystemStore>((set) => ({
  ...initialState,

  async uploadGlobalAsset({ destination, file, filename }) {
    const filesEndpointUrl = `${EDU_API_CONFIG_ENDPOINTS.FILES}`;
    const formData = new FormData();

    if (file instanceof File) {
      formData.append('file', file);
    } else {
      const extension = getExtensionFromMimeType(file.type) || '.bin';
      const wrappedFileName = `${filename ?? 'upload'}${extension}`;
      const wrappedFile = new File([file], wrappedFileName, {
        type: file.type || RequestResponseContentType.APPLICATION_OCTET_STREAM,
      });
      formData.append('file', wrappedFile);
    }
    if (filename) {
      formData.append('filename', filename);
    }

    const response = await eduApi.post<void>(filesEndpointUrl, formData, {
      params: { destination },
      validateStatus: (status) => status < 500,
    });

    if (response.status >= 400) {
      throw new Error('Upload failed');
    }
  },

  reset() {
    set(initialState);
  },
}));

export default useFilesystemStore;
