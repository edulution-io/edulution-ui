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
        const ext = mimeExtension(type);
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
