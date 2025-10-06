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

import React, { useRef } from 'react';
import { AccordionContent } from '@/components/ui/AccordionSH';
import type { UseFormReturn } from 'react-hook-form';
import type { GlobalSettingsFormValues } from '@libs/global-settings/types/globalSettings.form';
import { useTranslation } from 'react-i18next';
import { Theme, ThemeType } from '@libs/common/constants/theme';
import useFilesystemStore from '@/store/FilesystemStore/useFilesystemStore';
import getMainLogoUrl from '@libs/assets/getMainLogoUrl';
import LogoUploadField from '@/pages/Settings/components/LogoUploadField';
import getDeploymentTarget from '@libs/common/utils/getDeploymentTarget';
import DEPLOYMENT_TARGET from '@libs/common/constants/deployment-target';
import BRANDING_UPLOADS_LOGO from '@libs/global-settings/constants/brandingUploadsLogo';

type AddOrganisationLogoProps = { form: UseFormReturn<GlobalSettingsFormValues> };

const AddOrganisationLogo: React.FC<AddOrganisationLogoProps> = ({ form }) => {
  const { t } = useTranslation();
  const { uploadVariant, darkVersion, uploadingVariant } = useFilesystemStore();

  const lightInputRef = useRef<HTMLInputElement>(null);
  const darkInputRef = useRef<HTMLInputElement>(null);

  const setFormFileForVariant = (variant: ThemeType, file: File | null) => {
    const path: 'brandingUploads.logo.light' | 'brandingUploads.logo.dark' =
      variant === Theme.light ? 'brandingUploads.logo.light' : 'brandingUploads.logo.dark';
    form.setValue(path, file, { shouldDirty: true });
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
  const hasDarkSelection = !!form.watch(BRANDING_UPLOADS_LOGO.dark);
  const deploymentTarget = getDeploymentTarget();
  const isGeneric = deploymentTarget === DEPLOYMENT_TARGET.GENERIC;

  return (
    <AccordionContent className="space-y-4 px-1">
      <p>
        {t(
          isGeneric
            ? 'settings.globalSettings.logo.descriptionGeneric'
            : 'settings.globalSettings.logo.descriptionSchool',
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
