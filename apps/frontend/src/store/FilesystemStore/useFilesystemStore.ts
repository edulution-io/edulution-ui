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
import handleApiError from '@/utils/handleApiError';
import { ThemeType } from '@libs/common/constants/theme';
import convertImageFileToWebp from '@libs/common/utils/convertImageFileToWebp';
import getMainLogoFilename from '@libs/filesharing/utils/getMainLogoFilename';
import { GLOBAL_SETTINGS_BRANDING_LOGO } from '@libs/global-settings/constants/globalSettingsApiEndpoints';
import uploadImageFile from '@/store/FilesystemStore/uploadImageFile';

interface FilesystemStore {
  darkVersion: number;
  setDarkVersion: (version: number | ((prev: number) => number)) => void;
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

  uploadVariant: async (variant: ThemeType, file: File) => {
    try {
      set({ uploadingVariant: variant });
      const webpFile = await convertImageFileToWebp(file);
      await uploadImageFile({
        destination: GLOBAL_SETTINGS_BRANDING_LOGO as string,
        filename: getMainLogoFilename(variant),
        file: webpFile,
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
