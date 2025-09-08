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

import React, { useRef, useState } from 'react';
import { AccordionContent } from '@/components/ui/AccordionSH';
import type { UseFormReturn } from 'react-hook-form';
import type { GlobalSettingsFormValues } from '@libs/global-settings/types/globalSettings.form';
import { useTranslation } from 'react-i18next';
import { Theme, ThemeType } from '@libs/common/types/theme';
import useFilesystemStore from '@/store/FilesystemStore/useFilesystemStore';
import { GLOBAL_SETTINGS_BRANDING_LOGO } from '@libs/global-settings/constants/globalSettingsApiEndpoints';
import BrandingLogoField from '@/pages/Settings/components/BrandingLogoField';
import getMainLogoUrl from '@libs/assets/getMainLogoUrl';

type Props = { form: UseFormReturn<GlobalSettingsFormValues> };

const AddBrandingLogo: React.FC<Props> = ({ form }) => {
  const { t } = useTranslation();
  const { uploadGlobalAsset } = useFilesystemStore();

  const lightInputRef = useRef<HTMLInputElement>(null);
  const darkInputRef = useRef<HTMLInputElement>(null);

  const [lightVersion, setLightVersion] = useState(0);
  const [darkVersion, setDarkVersion] = useState(0);
  const [uploadingVariant, setUploadingVariant] = useState<ThemeType | null>(null);

  const setFormFileForVariant = (variant: ThemeType, file: File | null) => {
    const path: 'brandingUploads.logo.light' | 'brandingUploads.logo.dark' =
      variant === Theme.light ? 'brandingUploads.logo.light' : 'brandingUploads.logo.dark';
    form.setValue(path, file, { shouldDirty: true });
  };

  const uploadVariant = async (variant: ThemeType, file: File) => {
    try {
      setUploadingVariant(variant);
      await uploadGlobalAsset({
        destination: GLOBAL_SETTINGS_BRANDING_LOGO,
        file,
        filename: `main-logo-${variant}`,
      });
      if (variant === Theme.light) setLightVersion((v) => v + 1);
      else setDarkVersion((v) => v + 1);
    } finally {
      setUploadingVariant(null);
    }
  };

  const onFileChange =
    (variant: ThemeType): React.ChangeEventHandler<HTMLInputElement> =>
    (event) => {
      const file = event.target.files?.[0] ?? null;

      if (file && !file.type.startsWith('image/')) {
        const ref = variant === Theme.light ? lightInputRef : darkInputRef;
        if (ref.current) ref.current.value = '';
        return;
      }

      setFormFileForVariant(variant, file);
      if (file) void uploadVariant(variant, file);
    };

  const lightPreviewSrc = `${getMainLogoUrl(Theme.light)}?v=${lightVersion}`;
  const darkPreviewSrc = `${getMainLogoUrl(Theme.dark)}?v=${darkVersion}`;

  return (
    <AccordionContent className="space-y-4 px-1">
      <p>{t('settings.globalSettings.brandingLogo.description')}</p>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-1">
        <BrandingLogoField
          variant={Theme.dark}
          lightPreviewSrc={lightPreviewSrc}
          darkPreviewSrc={darkPreviewSrc}
          lightCacheKey={lightVersion}
          darkCacheKey={darkVersion}
          lightLocalSrc={null}
          darkLocalSrc={null}
          uploadingVariant={uploadingVariant}
          onFileChange={onFileChange}
          lightInputRef={lightInputRef}
          darkInputRef={darkInputRef}
        />
      </div>
    </AccordionContent>
  );
};

export default AddBrandingLogo;
