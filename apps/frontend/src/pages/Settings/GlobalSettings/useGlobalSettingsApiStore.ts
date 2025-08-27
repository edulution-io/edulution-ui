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
  GLOBAL_SETTINGS_BRANDING_LOGO_ENDPOINT,
  GLOBAL_SETTINGS_ROOT_ENDPOINT,
} from '@libs/global-settings/constants/globalSettingsApiEndpoints';
import type GlobalSettingsDto from '@libs/global-settings/types/globalSettings.dto';
import defaultValues from '@libs/global-settings/constants/defaultValues';
import deepMerge from '@libs/common/utils/Object/deepMerge';
import BrandingDto from '@libs/global-settings/types/branding.dto';
import { GlobalSettingsFormValues } from '@libs/global-settings/types/globalSettings.form';
import PublicAssetSaveResult from '@libs/filesystem/types/publicAssetSaveResult';
import EDU_API_ROOT from '@libs/common/constants/eduApiRoot';
import { AxiosResponse } from 'axios';

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
  getGlobalBranding: () => Promise<void>;
  deleteGlobalBranding: () => Promise<void>;
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

  setGlobalSettings: async (globalSettingsFormValues) => {
    set({ isSetGlobalSettingLoading: true });
    try {
      let brandingResponse: PublicAssetSaveResult | null = null;

      if (globalSettingsFormValues.brandingUploadFile) {
        const fileData = new FormData();
        fileData.append(
          'file',
          globalSettingsFormValues.brandingUploadFile,
          globalSettingsFormValues.brandingUploadFile.name,
        );
        const { data } = await eduApi.put<PublicAssetSaveResult>(
          `${GLOBAL_SETTINGS_ROOT_ENDPOINT}/${GLOBAL_SETTINGS_BRANDING_LOGO_ENDPOINT}`,
          fileData,
        );
        brandingResponse = data;
      }

      set({
        globalBranding: {
          logo: {
            url: brandingResponse?.publicPath || '',
            mimeType: brandingResponse?.mime || '',
          },
        },
      });

      const { ...dto } = globalSettingsFormValues;

      const mergedDto: typeof dto = brandingResponse
        ? {
            ...dto,
            branding: {
              ...dto.branding,
              logo: {
                ...(dto.branding?.logo ?? { url: '', mimeType: '' }),
                url: brandingResponse.publicPath,
                mimeType: brandingResponse.mime,
              },
            },
          }
        : dto;

      await eduApi.put(GLOBAL_SETTINGS_ROOT_ENDPOINT, mergedDto);

      set({ globalSettings: mergedDto });
      toast.success(i18n.t('settings.globalSettings.updateSuccessful'));
    } catch (error) {
      handleApiError(error, set);
    } finally {
      set({ isSetGlobalSettingLoading: false });
    }
  },
  getGlobalBranding: async () => {
    set({ isGetBrandingLoading: true });
    try {
      const requestUrl = `${window.location.origin}/${EDU_API_ROOT}/${GLOBAL_SETTINGS_ROOT_ENDPOINT}/${GLOBAL_SETTINGS_BRANDING_LOGO_ENDPOINT}`;

      const response: AxiosResponse<string> = await eduApi.get<string>(requestUrl, {
        responseType: 'text',
        validateStatus: (status: number) => status < 400,
      });

      const contentTypeHeaderValue =
        (response.headers as Record<string, string | undefined>)['content-type']?.toLowerCase() ?? '';

      if (contentTypeHeaderValue.includes('application/json')) {
        let parsed: unknown = response.data;

        if (typeof parsed === 'string') {
          try {
            parsed = JSON.parse(parsed) as unknown;
          } catch {
            parsed = null;
          }
        }

        const isObject = (value: unknown): value is Record<string, unknown> =>
          typeof value === 'object' && value !== null;

        const isBrandingDto = (value: unknown): value is BrandingDto => {
          if (!isObject(value)) return false;
          const { logo } = value;
          if (!isObject(logo)) return false;
          return typeof logo.url === 'string' && typeof logo.mimeType === 'string';
        };

        if (isBrandingDto(parsed)) {
          set({ globalBranding: parsed });
        } else {
          set({ globalBranding: { logo: { url: '', mimeType: '' } } });
        }
      } else {
        set({
          globalBranding: {
            logo: {
              url: requestUrl,
              mimeType: contentTypeHeaderValue,
            },
          },
        });
      }
    } catch (error) {
      handleApiError(error, set);
    } finally {
      set({ isGetBrandingLoading: false });
    }
  },

  deleteGlobalBranding: async () => {
    set({ isSetGlobalSettingLoading: true });
    try {
      await eduApi.delete(`${GLOBAL_SETTINGS_ROOT_ENDPOINT}/${GLOBAL_SETTINGS_BRANDING_LOGO_ENDPOINT}`);

      set(() => ({
        globalBranding: { logo: { url: '', mimeType: '' } },
      }));

      toast.success(i18n.t('settings.globalSettings.brandingLogo.deleteSuccessful') || 'Branding-Logo gelöscht.');
    } catch (error) {
      handleApiError(error, set);
    } finally {
      set({ isSetGlobalSettingLoading: false });
    }
  },

  reset: () => set(initialValues),
}));

export default useGlobalSettingsApiStore;
