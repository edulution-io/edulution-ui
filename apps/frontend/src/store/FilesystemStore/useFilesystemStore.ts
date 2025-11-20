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

import mime from 'mime';
import { create } from 'zustand';
import eduApi from '@/api/eduApi';
import handleApiError from '@/utils/handleApiError';
import { ThemeType } from '@libs/common/constants/theme';
import convertImageFileToWebp from '@libs/common/utils/convertImageFileToWebp';
import { RequestResponseContentType } from '@libs/common/types/http-methods';
import getMainLogoFilename from '@libs/filesharing/utils/getMainLogoFilename';
import { GLOBAL_SETTINGS_BRANDING_LOGO } from '@libs/global-settings/constants/globalSettingsApiEndpoints';
import EDU_API_CONFIG_ENDPOINTS from '@libs/appconfig/constants/appconfig-endpoints';
import FILE_ENDPOINTS from '@libs/filesystem/constants/endpoints';

interface FilesystemStore {
  darkVersion: number;
  setDarkVersion: (version: number | ((prev: number) => number)) => void;

  deleteImageFile: (appName: string, filename: string) => Promise<void>;
  uploadImageFile: (destination: string, filename: string, file: File | Blob, appName?: string) => Promise<void>;

  uploadingVariant: ThemeType | null;
  uploadVariant: (variant: ThemeType, file: File) => Promise<void>;

  reset: () => void;
}

const initialState = {
  darkVersion: 0,
  uploadingVariant: null,
};

const useFilesystemStore = create<FilesystemStore>((set, get) => ({
  ...initialState,

  setDarkVersion: (version) =>
    set((state) => ({
      darkVersion: typeof version === 'function' ? version(state.darkVersion) : version,
    })),

  deleteImageFile: async (appName: string, fileName: string) => {
    try {
      const url = `${EDU_API_CONFIG_ENDPOINTS.FILES}/public/${FILE_ENDPOINTS.FILE}/${appName}/${fileName}`;
      await eduApi.delete<void>(url);
    } catch (err: unknown) {
      if (err instanceof Error) {
        handleApiError(err, () => {});
      } else {
        handleApiError(new Error('Unknown deletion error'), () => {});
      }
    }
  },

  uploadImageFile: async (destination: string, filename: string, file: File | Blob, appName?: string) => {
    try {
      const form = new FormData();
      form.append('destination', destination);
      form.append('filename', filename);

      if (file instanceof File) {
        const webpFile = await convertImageFileToWebp(file);
        form.append('file', webpFile, filename);
      } else if (file instanceof Blob) {
        const type = file.type || RequestResponseContentType.APPLICATION_OCTET_STREAM;

        const ext = mime.getExtension(type);
        const fullName =
          ext && !filename.toLowerCase().endsWith(`.${ext.toLowerCase()}`) ? `${filename}.${ext}` : filename;

        const wrapped = new File([file], fullName, { type });
        form.append('file', wrapped, fullName);
      } else {
        return;
      }

      const endpoint = appName ? `${EDU_API_CONFIG_ENDPOINTS.FILES}/${appName}` : `${EDU_API_CONFIG_ENDPOINTS.FILES}`;
      await eduApi.post<void>(endpoint, form);
    } catch (err: unknown) {
      if (err instanceof Error) {
        handleApiError(err, () => {});
      } else {
        handleApiError(new Error('Unknown upload error'), () => {});
      }
    }
  },

  uploadVariant: async (variant: ThemeType, file: File) => {
    try {
      set({ uploadingVariant: variant });
      await get().uploadImageFile(GLOBAL_SETTINGS_BRANDING_LOGO as string, getMainLogoFilename(variant), file);
      get().setDarkVersion((v) => v + 1);
    } catch (error) {
      handleApiError(error, set);
    } finally {
      set({ uploadingVariant: null });
    }
  },

  reset: () => set(initialState),
}));

export default useFilesystemStore;
