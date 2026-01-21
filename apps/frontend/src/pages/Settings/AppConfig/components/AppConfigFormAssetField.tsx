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
