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

import React, { useRef } from 'react';
import { AccordionContent } from '@/components/ui/AccordionSH';
import type { UseFormReturn } from 'react-hook-form';
import type { GlobalSettingsFormValues } from '@libs/global-settings/types/globalSettings.form';
import { useTranslation } from 'react-i18next';
import { Theme, ThemeType } from '@libs/common/constants/theme';
import useFilesystemStore from '@/store/FilesystemStore/useFilesystemStore';
import getMainLogoUrl from '@libs/assets/getMainLogoUrl';
import LogoUploadField from '@/pages/Settings/components/LogoUploadField';
import BRANDING_UPLOADS_LOGO from '@libs/global-settings/constants/brandingUploadsLogo';
import useDeploymentTarget from '@/hooks/useDeploymentTarget';

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
  const { isGeneric } = useDeploymentTarget();

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
