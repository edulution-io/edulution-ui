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
import { RequestResponseContentType } from '@libs/common/types/http-methods';
import EDU_API_CONFIG_ENDPOINTS from '@libs/appconfig/constants/appconfig-endpoints';
import THEME from '@libs/common/constants/theme';
import ThemeType from '@libs/common/types/themeType';
import convertImageFileToWebp from '@libs/common/utils/convertImageFileToWebp';
import getMainLogoFilename from '@libs/filesharing/utils/getMainLogoFilename';
import { GLOBAL_SETTINGS_BRANDING_LOGO } from '@libs/global-settings/constants/globalSettingsApiEndpoints';

interface FilesystemStore {
  darkVersion: number;
  setDarkVersion: (version: number | ((prev: number) => number)) => void;

  deleteImageFile: (appName: string, filename: string, variant?: ThemeType) => Promise<boolean>;
  uploadImageFile: (
    destination: string,
    filename: string,
    file: File | Blob,
    appName?: string,
    variant?: ThemeType,
  ) => Promise<boolean>;

  uploadingVariant: ThemeType | null;
  uploadVariant: (variant: ThemeType, file: File) => Promise<void>;

  customLogoLightThemedExists: boolean;
  customLogoDarkThemedExists: boolean;
  setCustomLogoExists: (variant: ThemeType, exists: boolean) => void;
  doesCustomImageExist: (appName: string, fileName: string, variant: ThemeType) => Promise<void>;

  errorLightThemed: Error | null;
  errorDarkThemed: Error | null;
  setError: (variant: ThemeType, error: Error | null) => void;

  error: Error | null;
  reset: () => void;
}

const initialState = {
  darkVersion: 0,
  uploadingVariant: null,
  customLogoLightThemedExists: false,
  customLogoDarkThemedExists: false,
  errorLightThemed: null,
  errorDarkThemed: null,
  error: null,
};

const useFilesystemStore = create<FilesystemStore>((set, get) => ({
  ...initialState,

  setDarkVersion: (version) =>
    set((state) => ({
      darkVersion: typeof version === 'function' ? version(state.darkVersion) : version,
    })),

  deleteImageFile: async (appName: string, fileName: string, variant: ThemeType = THEME.dark): Promise<boolean> => {
    const { setError, setCustomLogoExists } = get();
    setError(variant, null);
    try {
      const url = `${EDU_API_CONFIG_ENDPOINTS.FILES}/public/assets/${appName}/${fileName}`;
      await eduApi.delete<void>(url);
      setCustomLogoExists(variant, false);
      return true;
    } catch (e) {
      setCustomLogoExists(variant, true);
      setError(variant, e as Error);
      handleApiError(e, set);
      return false;
    }
  },

  uploadImageFile: async (
    destination: string,
    filename: string,
    file: File | Blob,
    appName?: string,
    variant: ThemeType = THEME.dark,
  ): Promise<boolean> => {
    const { setError, setCustomLogoExists } = get();
    setError(variant, null);
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
        return false;
      }

      const endpoint = appName ? `${EDU_API_CONFIG_ENDPOINTS.FILES}/${appName}` : `${EDU_API_CONFIG_ENDPOINTS.FILES}`;
      await eduApi.post<void>(endpoint, form);
      setCustomLogoExists(variant, true);
      return true;
    } catch (e) {
      setCustomLogoExists(variant, false);
      setError(variant, e as Error);
      handleApiError(e, set);
      return false;
    }
  },

  uploadVariant: async (variant: ThemeType, file: File) => {
    try {
      set({ uploadingVariant: variant });
      await get().uploadImageFile(GLOBAL_SETTINGS_BRANDING_LOGO as string, getMainLogoFilename(variant), file);
      get().setDarkVersion((v) => v + 1);
    } catch (e) {
      handleApiError(e, set);
    } finally {
      set({ uploadingVariant: null });
    }
  },

  setCustomLogoExists: (variant: ThemeType, exists: boolean) => {
    if (variant === THEME.dark) {
      set({ customLogoDarkThemedExists: exists });
    } else {
      set({ customLogoLightThemedExists: exists });
    }
  },

  doesCustomImageExist: async (appName: string, fileName: string, variant: ThemeType = THEME.dark): Promise<void> => {
    const { setError, setCustomLogoExists } = get();
    setError(variant, null);
    try {
      const url = `${EDU_API_CONFIG_ENDPOINTS.FILES}/public/assets/${appName}/${fileName}`;
      await eduApi.get<File>(url);
      setCustomLogoExists(variant, true);
    } catch (e) {
      setCustomLogoExists(variant, false);
      handleApiError(e, set);
    }
  },

  setError: (variant: ThemeType, error: Error | null) => {
    if (variant === THEME.dark) {
      set({ errorDarkThemed: error });
    } else {
      set({ errorLightThemed: error });
    }
  },

  reset: () => set(initialState),
}));

export default useFilesystemStore;
