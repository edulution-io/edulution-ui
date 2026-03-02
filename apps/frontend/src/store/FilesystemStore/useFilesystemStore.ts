/*
 * Copyright (C) [2025] [Netzint GmbH]
 * All rights reserved.
 *
 * This software is dual-licensed under the terms of:
 *
 * 1. The GNU Affero General Public License (AGPL-3.0-or-later), as published by the Free Software Foundation.
 *    You may use, modify and distribute this software under the terms of the AGPL, provided that you comply with its conditions.
 *
 *    A copy of the license can be found at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * OR
 *
 * 2. A commercial license agreement with Netzint GmbH. Licensees holding a valid commercial license from Netzint GmbH
 *    may use this software in accordance with the terms contained in such written agreement, without the obligations imposed by the AGPL.
 *
 * If you are uncertain which license applies to your use case, please contact us at info@netzint.de for clarification.
 */

import axios from 'axios';
import mime from 'mime';
import { create } from 'zustand';
import eduApi from '@/api/eduApi';
import handleApiError from '@/utils/handleApiError';
import { RequestResponseContentType, ResponseType } from '@libs/common/types/http-methods';
import EDU_API_CONFIG_ENDPOINTS from '@libs/appconfig/constants/appconfig-endpoints';
import ThemeType from '@libs/common/types/themeType';
import AssetSource from '@libs/filesystem/types/AssetSource';
import convertImageFileToCompressedWebp from '@libs/common/utils/convertImageFileToCompressedWebp';

interface FilesystemStore {
  fetchImage: (url: string, variant?: ThemeType) => Promise<{ source: AssetSource; content: string } | null>;
  fetchingImageVariant: ThemeType | null;

  deleteImageFile: (appName: string, filename: string) => Promise<boolean>;
  uploadImageFile: (
    destination: string,
    filename: string,
    file: File | Blob,
    appName?: string,
    uploadKey?: string,
  ) => Promise<boolean>;

  uploadingKey: string | null;

  error: Error | null;
  reset: () => void;
}

const initialState = {
  fetchingImageVariant: null,
  uploadingKey: null,
  error: null,
};

const useFilesystemStore = create<FilesystemStore>((set) => ({
  ...initialState,

  fetchImage: async (url: string, variant?: ThemeType): Promise<{ source: AssetSource; content: string } | null> => {
    if (variant) {
      set({ fetchingImageVariant: variant, error: null });
    }
    try {
      const response = await axios.get(url, {
        responseType: ResponseType.BLOB,
      });
      if (!response) {
        throw new Error('No response from server');
      }
      const source = (response.headers['x-asset-source'] as AssetSource) || 'none';

      const blob = response.data as Blob;
      const content = URL.createObjectURL(blob);

      return { source, content };
    } catch (e) {
      handleApiError(e, set);
      return { source: 'none', content: '' };
    } finally {
      set({ fetchingImageVariant: null, error: null });
    }
  },

  deleteImageFile: async (appName: string, fileName: string): Promise<boolean> => {
    set({ error: null });
    try {
      const url = `${EDU_API_CONFIG_ENDPOINTS.FILES}/public/assets/${appName}/${fileName}`;
      await eduApi.delete<void>(url);
      return true;
    } catch (e) {
      handleApiError(e, set);
      return false;
    }
  },

  uploadImageFile: async (
    destination: string,
    filename: string,
    file: File | Blob,
    appName?: string,
    uploadKey?: string,
  ): Promise<boolean> => {
    set({ uploadingKey: uploadKey ?? null, error: null });
    try {
      const form = new FormData();
      form.append('destination', destination);
      if (file instanceof File) {
        const webpFile = await convertImageFileToCompressedWebp(file, 1024, 3840);
        form.append('filename', webpFile.name);
        form.append('file', webpFile, webpFile.name);
      } else if (file instanceof Blob) {
        const type = file.type || RequestResponseContentType.APPLICATION_OCTET_STREAM;

        const ext = mime.getExtension(type);
        const fullName =
          ext && !filename.toLowerCase().endsWith(`.${ext.toLowerCase()}`) ? `${filename}.${ext}` : filename;

        const wrapped = new File([file], fullName, { type });
        form.append('file', wrapped, fullName);
      } else {
        return false;
      }

      const endpoint = appName ? `${EDU_API_CONFIG_ENDPOINTS.FILES}/${appName}` : `${EDU_API_CONFIG_ENDPOINTS.FILES}`;
      await eduApi.post<void>(endpoint, form);
      return true;
    } catch (e) {
      handleApiError(e, set);
      return false;
    } finally {
      set({ uploadingKey: null });
    }
  },

  reset: () => set(initialState),
}));

export default useFilesystemStore;
