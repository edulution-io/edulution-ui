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
import { toast } from 'sonner';
import i18n from '@/i18n';
import handleApiError from '@/utils/handleApiError';
import eduApi from '@/api/eduApi';
import {
  GLOBAL_SETTINGS_ADMIN_ENDPOINT,
  GLOBAL_SETTINGS_BRANDING_LOGO,
  GLOBAL_SETTINGS_ROOT_ENDPOINT,
} from '@libs/global-settings/constants/globalSettingsApiEndpoints';
import type GlobalSettingsDto from '@libs/global-settings/types/globalSettings.dto';
import defaultValues from '@libs/global-settings/constants/defaultValues';
import deepMerge from '@libs/common/utils/Object/deepMerge';
import BrandingDto from '@libs/global-settings/types/branding.dto';
import { GlobalSettingsFormValues } from '@libs/global-settings/types/globalSettings.form';
import PublicAssetSaveResult from '@libs/filesystem/types/publicAssetSaveResult';

import { ThemeType } from '@libs/common/types/theme';

type GlobalSettingsStore = {
  isSetGlobalSettingLoading: boolean;
  isGetGlobalSettingsLoading: boolean;
  isGetBrandingLoading: boolean;
  isGetGlobalAdminSettingsLoading: boolean;
  isGetGlobalInstitutionLogoSettingsLoading: boolean;
  globalSettings: GlobalSettingsDto;
  globalBranding: BrandingDto;
  reset: () => void;
  getGlobalSettings: () => Promise<void>;
  getGlobalAdminSettings: () => Promise<void>;
  setGlobalSettings: (globalSettingsFormValues: GlobalSettingsFormValues) => Promise<void>;
  deleteGlobalBrandingLogo: (theme?: ThemeType) => Promise<void>;
};

const initialValues = {
  isSetGlobalSettingLoading: false,
  isGetGlobalSettingsLoading: false,
  isGetBrandingLoading: false,
  isGetGlobalAdminSettingsLoading: false,
  isGetGlobalInstitutionLogoSettingsLoading: false,
  mfaEnforcedGroups: [],
  globalSettings: defaultValues,
  globalBranding: {} as BrandingDto,
};

const EMPTY_LOGO = { url: '', mimeType: '' as const };

const uploadLogoVariant = async (theme: ThemeType, file: File) => {
  const formData = new FormData();
  formData.append('file', file, file.name);
  const { data } = await eduApi.put<PublicAssetSaveResult>(
    `${GLOBAL_SETTINGS_ROOT_ENDPOINT}/${GLOBAL_SETTINGS_BRANDING_LOGO}`,
    formData,
    { params: { variant: theme } },
  );

  return data;
};

const useGlobalSettingsApiStore = create<GlobalSettingsStore>((set, get) => ({
  ...initialValues,

  getGlobalSettings: async () => {
    set({ isGetGlobalSettingsLoading: true });
    try {
      const { data } = await eduApi.get<GlobalSettingsDto>(GLOBAL_SETTINGS_ROOT_ENDPOINT);

      const merged = deepMerge(get().globalSettings, data);
      set({ globalSettings: merged });
    } catch (error) {
      handleApiError(error, set);
    } finally {
      set({ isGetGlobalSettingsLoading: false });
    }
  },

  getGlobalAdminSettings: async () => {
    set({ isGetGlobalAdminSettingsLoading: true });
    try {
      const { data } = await eduApi.get<GlobalSettingsDto>(
        `${GLOBAL_SETTINGS_ROOT_ENDPOINT}/${GLOBAL_SETTINGS_ADMIN_ENDPOINT}`,
      );

      const merged = deepMerge(get().globalSettings, data);
      set({ globalSettings: merged });
    } catch (error) {
      handleApiError(error, set);
    } finally {
      set({ isGetGlobalAdminSettingsLoading: false });
    }
  },

  setGlobalSettings: async (values) => {
    set({ isSetGlobalSettingLoading: true });
    try {
      const { brandingUploads, ...dto } = values;
      const lightFile = brandingUploads?.logo?.light ?? null;
      const darkFile = brandingUploads?.logo?.dark ?? null;

      const results: Partial<Record<ThemeType, PublicAssetSaveResult>> = {};

      if (lightFile) results.light = await uploadLogoVariant('light', lightFile);
      if (darkFile) results.dark = await uploadLogoVariant('dark', darkFile);

      if (results.light || results.dark) {
        set((state) => ({
          globalBranding: {
            ...state.globalBranding,
            logos: {
              ...(state.globalBranding?.logos ?? {}),
              ...(results.light ? { light: { url: results.light.publicPath, mimeType: results.light.mime } } : {}),
              ...(results.dark ? { dark: { url: results.dark.publicPath, mimeType: results.dark.mime } } : {}),
            },
          },
        }));
      }

      const logos: BrandingDto['logos'] = {
        light: results.light
          ? { url: results.light.publicPath, mimeType: results.light.mime }
          : (dto.branding?.logos?.light ?? EMPTY_LOGO),

        dark: results.dark
          ? { url: results.dark.publicPath, mimeType: results.dark.mime }
          : (dto.branding?.logos?.dark ?? EMPTY_LOGO),
      };

      const payload: Partial<GlobalSettingsDto> = {
        ...dto,
        branding: {
          ...(dto.branding ?? {}),
          logos,
        },
      };

      await eduApi.put<GlobalSettingsDto>(GLOBAL_SETTINGS_ROOT_ENDPOINT, payload);
      toast.success(i18n.t('settings.globalSettings.updateSuccessful'));
    } finally {
      set({ isSetGlobalSettingLoading: false });
    }
  },

  deleteGlobalBrandingLogo: async (theme?: ThemeType) => {
    set({ isSetGlobalSettingLoading: true });
    try {
      if (theme) {
        await eduApi.delete(`${GLOBAL_SETTINGS_ROOT_ENDPOINT}/${GLOBAL_SETTINGS_BRANDING_LOGO}`, {
          params: { variant: theme },
          validateStatus: (s) => s < 500,
        });

        set((state) => ({
          globalBranding: {
            ...state.globalBranding,
            logos: {
              light: theme === 'light' ? EMPTY_LOGO : (state.globalBranding?.logos?.light ?? EMPTY_LOGO),
              dark: theme === 'dark' ? EMPTY_LOGO : (state.globalBranding?.logos?.dark ?? EMPTY_LOGO),
            },
          },
        }));

        toast.success(i18n.t('settings.globalSettings.brandingLogo.deleteSuccessful'));
      } else {
        await Promise.all([
          eduApi.delete(`${GLOBAL_SETTINGS_ROOT_ENDPOINT}/${GLOBAL_SETTINGS_BRANDING_LOGO}`, {
            params: { variant: 'light' },
            validateStatus: (s) => s < 500,
          }),
          eduApi.delete(`${GLOBAL_SETTINGS_ROOT_ENDPOINT}/${GLOBAL_SETTINGS_BRANDING_LOGO}`, {
            params: { variant: 'dark' },
            validateStatus: (s) => s < 500,
          }),
        ]);

        set(() => ({
          globalBranding: { logos: { light: EMPTY_LOGO, dark: EMPTY_LOGO } },
        }));

        toast.success(i18n.t('settings.globalSettings.brandingLogo.deleteSuccessful') || 'Branding-Logos gelöscht.');
      }
    } catch (error) {
      handleApiError(error, set);
    } finally {
      set({ isSetGlobalSettingLoading: false });
    }
  },

  reset: () => set(initialValues),
}));

export default useGlobalSettingsApiStore;
