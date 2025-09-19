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
import getMainLogoUrl from '@libs/assets/getMainLogoUrl';
import LogoUploadField from '@/pages/Settings/components/LogoUploadField';
import convertImageFileToWebp from '@libs/common/utils/convertImageFileToWebp';
import getDeploymentTarget from '@libs/common/utils/getDeploymentTarget';
import DEPLOYMENT_TARGET from '@libs/common/constants/deployment-target';

type Props = { form: UseFormReturn<GlobalSettingsFormValues> };

const AddOrganisationLogo: React.FC<Props> = ({ form }) => {
  const { t } = useTranslation();
  const { uploadGlobalAsset } = useFilesystemStore();

  const lightInputRef = useRef<HTMLInputElement>(null);
  const darkInputRef = useRef<HTMLInputElement>(null);

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
      const webpFile = await convertImageFileToWebp(file);
      await uploadGlobalAsset({
        destination: GLOBAL_SETTINGS_BRANDING_LOGO,
        file: webpFile,
        filename: `main-logo-${variant}.webp`,
      });
      setDarkVersion((version) => version + 1);
    } finally {
      setUploadingVariant(null);
    }
  };

  const onFileChange =
    (variant: ThemeType): React.ChangeEventHandler<HTMLInputElement> =>
    async (event) => {
      const file = event.target.files?.[0] ?? null;
      if (file && !file.type.startsWith('image/')) {
        const input = variant === Theme.light ? lightInputRef : darkInputRef;
        if (input.current) input.current.value = '';
        return;
      }
      setFormFileForVariant(variant, file);
      if (file) await uploadVariant(variant, file);
    };

  const darkPreviewSrc = `${getMainLogoUrl(Theme.dark)}?v=${darkVersion}`;
  const hasDarkSelection = !!form.watch('brandingUploads.logo.dark');

  const isGeneric = getDeploymentTarget() === DEPLOYMENT_TARGET.GENERIC;

  return (
    <AccordionContent className="space-y-4 px-1">
      <p>
        {t(
          isGeneric
            ? 'settings.globalSettings.brandingLogo.descriptionGeneric'
            : 'settings.globalSettings.brandingLogo.descriptionSchool',
        )}
      </p>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-1">
        <LogoUploadField
          variant={Theme.dark}
          previewSrc={darkPreviewSrc}
          cacheKey={darkVersion}
          hasLocalSelection={hasDarkSelection}
          uploading={uploadingVariant === Theme.dark}
          inputRef={darkInputRef}
          onFileChange={onFileChange(Theme.dark)}
          chooseText={t('common.chooseFile')}
          changeText={t('common.changeFile')}
        />
      </div>
    </AccordionContent>
  );
};

export default AddOrganisationLogo;
