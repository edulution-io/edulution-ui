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

import { create } from 'zustand';
import eduApi from '@/api/eduApi';
import handleApiError from '@/utils/handleApiError';
import mime from 'mime';
import { RequestResponseContentType } from '@libs/common/types/http-methods';
import EDU_API_CONFIG_ENDPOINTS from '@libs/appconfig/constants/appconfig-endpoints';
import { ThemeType } from '@libs/common/constants/theme';
import convertImageFileToWebp from '@libs/common/utils/convertImageFileToWebp';
import getMainLogoFilename from '@libs/filesharing/utils/getMainLogoFilename';
import { UploadGlobalAssetDto } from '@libs/filesystem/types/uploadGlobalAssetDto';
import { GLOBAL_SETTINGS_BRANDING_LOGO } from '@libs/global-settings/constants/globalSettingsApiEndpoints';

interface FilesystemStore {
  darkVersion: number;
  setDarkVersion: (version: number | ((prev: number) => number)) => void;
  uploadingVariant: ThemeType | null;
  uploadGlobalAsset: (options: UploadGlobalAssetDto) => Promise<void>;
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

  uploadGlobalAsset: async ({ variant, file }: { variant: ThemeType; file: File | Blob }) => {
    try {
      const name = getMainLogoFilename(variant);
      const form = new FormData();
      form.append('destination', GLOBAL_SETTINGS_BRANDING_LOGO as string);
      form.append('filename', name);

      if (file instanceof File) {
        form.append('file', file, name);
      } else if (file instanceof Blob) {
        const type = file.type || RequestResponseContentType.APPLICATION_OCTET_STREAM;
        const ext = mime.getExtension(type);
        const fullName = ext && !name.toLowerCase().endsWith(`.${ext.toLowerCase()}`) ? `${name}.${ext}` : name;

        const wrapped = new File([file], fullName, { type });
        form.append('file', wrapped, fullName);
      } else {
        return;
      }

      await eduApi.post<void>(`${EDU_API_CONFIG_ENDPOINTS.FILES}`, form);
    } catch (err: unknown) {
      if (err instanceof Error) {
        handleApiError(err, set);
      } else {
        handleApiError(new Error('Unknown upload error'), set);
      }
    }
  },

  uploadVariant: async (variant: ThemeType, file: File) => {
    try {
      set({ uploadingVariant: variant });
      const webpFile = await convertImageFileToWebp(file);
      await get().uploadGlobalAsset({
        file: webpFile,
        variant,
      });
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
