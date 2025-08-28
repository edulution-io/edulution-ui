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

import type LogoAsset from '@libs/common/types/logoAsset';
import { create } from 'zustand';
import EDU_API_CONFIG_ENDPOINTS from '@libs/appconfig/constants/appconfig-endpoints';
import eduApi from '@/api/eduApi';
import { HTTP_HEADERS, RequestResponseContentType } from '@libs/common/types/http-methods';

interface FilesystemStore {
  getGlobalAsset: (path: string, filename: string) => Promise<LogoAsset>;
  reset: () => void;
}

const initialState = {};

const useFilesystemStore = create<FilesystemStore>((set) => ({
  ...initialState,

  getGlobalAsset: async (path, filename) => {
    const route = `${EDU_API_CONFIG_ENDPOINTS.FILES}/public/${encodeURI(path)}`;

    const resp = await eduApi.get<Blob>(route, {
      params: { filename },
      responseType: 'blob',
      validateStatus: (status) => status < 500,
    });

    if (resp.status === 204) {
      throw new Error('Asset not found');
    }

    const blob = resp.data;
    const headerCT = resp.headers?.[HTTP_HEADERS.ContentType];
    const ctFromHeader = typeof headerCT === 'string' ? headerCT : undefined;
    const mimeType = ctFromHeader || blob.type || RequestResponseContentType.APPLICATION_OCTET_STREAM;

    const url = URL.createObjectURL(blob);
    const asset: LogoAsset = { url, mimeType };
    return asset;
  },

  reset: () => set(initialState),
}));

export default useFilesystemStore;
