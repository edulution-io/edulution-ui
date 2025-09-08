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

interface FilesystemStore {
  uploadGlobalAsset: (options: { destination: string; file: File | Blob; filename?: string }) => Promise<void>;
  reset: () => void;
}

const initialState = {};

const useFilesystemStore = create<FilesystemStore>((set) => ({
  ...initialState,

  uploadGlobalAsset: async ({ destination, file, filename }) => {
    const route = `${EDU_API_CONFIG_ENDPOINTS.FILES}`;
    const form = new FormData();
    const extensionFromMimetype = (mime?: string) =>
      mime && mimeTypeToExtension[mime] ? `.${mimeTypeToExtension[mime]}` : '';

    if (file instanceof File) {
      form.append('file', file);
    } else {
      const ext = extensionFromMimetype(file.type);
      const name = `${filename ?? 'upload'}${ext}`;
      const wrapped = new File([file], name, {
        type: file.type || RequestResponseContentType.APPLICATION_OCTET_STREAM,
      });
      form.append('file', wrapped);
    }

    const resp = await eduApi.post<void>(route, form, {
      params: { destination, filename },
      validateStatus: (s) => s < 500,
    });
    if (resp.status >= 400) throw new Error('Upload failed');
  },

  reset: () => set(initialState),
}));

export default useFilesystemStore;
