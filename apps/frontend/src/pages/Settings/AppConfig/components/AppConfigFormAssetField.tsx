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

import { toast } from 'sonner';
import React, { useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FieldValues, Path, UseFormReturn } from 'react-hook-form';
import { ResolvedThemeType } from '@libs/common/types/themeType';
import { getAssetName, getAssetUrl } from '@libs/appconfig/utils/getAppAsset';
import ASSET_TYPES from '@libs/appconfig/constants/assetTypes';
import AssetType from '@libs/appconfig/types/assetType';
import useFilesystemStore from '@/store/FilesystemStore/useFilesystemStore';
import AssetUploadFieldWithFetch from '@/pages/Settings/components/AssetUploadFieldWithFetch';

type AppConfigFormAssetFieldProps<T extends FieldValues = FieldValues> = {
  settingLocation: string;
  fieldPath: string;
  form: UseFormReturn<T>;
  assetType?: AssetType;
  variant?: ResolvedThemeType;
  title?: string;
  onUploadSuccess?: (variant?: ResolvedThemeType) => void;
};

const AppConfigFormAssetField = <T extends FieldValues = FieldValues>({
  variant,
  settingLocation,
  fieldPath,
  form,
  assetType = ASSET_TYPES.logo,
  title,
  onUploadSuccess,
}: AppConfigFormAssetFieldProps<T>) => {
  const { uploadImageFile, deleteImageFile, uploadingKey } = useFilesystemStore();
  const currentUploadKey = variant ? `${assetType}-${variant}` : `${assetType}-single`;

  const { t } = useTranslation();

  const inputRef = useRef<HTMLInputElement>(null);

  const [keyValue, setKeyValue] = useState<number>(Math.floor(Math.random() * 10000));

  const path = (variant ? `${fieldPath}.${variant}` : fieldPath) as Path<T>;

  const destination = settingLocation;
  const filename = getAssetName(settingLocation, assetType, variant);
  const imageUrl = getAssetUrl(settingLocation, assetType, variant);
  const previewSrc = useMemo(
    () => (imageUrl?.includes('?') ? `${imageUrl}&t=${keyValue}` : `${imageUrl}?t=${keyValue}`),
    [imageUrl, keyValue],
  );

  const onFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    if (file) {
      if (!file.type.startsWith('image/')) {
        if (inputRef.current) inputRef.current.value = '';
        return;
      }

      const success = await uploadImageFile(destination, filename, file, undefined, currentUploadKey);
      if (success) {
        form.setValue(path, file as File & T[Path<T>], { shouldDirty: true });
        toast.success(t('survey.editor.fileUploadSuccess'));
        onUploadSuccess?.(variant);
      } else {
        form.setValue(path, null as null & T[Path<T>], { shouldDirty: true });
        toast.error(t('survey.editor.fileUploadError'));
      }
      setKeyValue((prev) => prev + 1);
    }
  };

  const onHandleReset = async () => {
    const success = await deleteImageFile(settingLocation, filename);
    if (success) {
      form.setValue(path, null as null & T[Path<T>], { shouldDirty: true });
      toast.success(t('survey.editor.fileDeletionSuccess'));
      onUploadSuccess?.(variant);
    } else {
      toast.error(t('survey.editor.fileDeletionError'));
    }
    setKeyValue((prev) => prev + 1);
  };

  const altText = variant ? t(`appExtendedOptions.appLogo.${variant}`) : t('settings.globalSettings.logo.title');

  return (
    <div className="min-w-[49%]">
      {title && <p className="mb-2 font-bold">{title}</p>}
      <AssetUploadFieldWithFetch
        assetUrl={previewSrc}
        alt={altText}
        onDelete={onHandleReset}
        variant={variant}
        inputRef={inputRef}
        onFileChange={onFileChange}
        chooseText={t('common.chooseFile')}
        changeText={t('common.changeFile')}
        uploading={uploadingKey === currentUploadKey}
      />
    </div>
  );
};

export default AppConfigFormAssetField;
