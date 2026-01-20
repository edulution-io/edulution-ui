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
import { getSingleAssetName, getSingleAssetUrl } from '@libs/appconfig/utils/getAppAsset';
import { AppConfigExtendedOption } from '@libs/appconfig/types/appConfigExtendedOption';
import ASSET_TYPES from '@libs/appconfig/constants/assetTypes';
import AssetType from '@libs/appconfig/types/assetType';
import useFilesystemStore from '@/store/FilesystemStore/useFilesystemStore';
import AssetUploadFieldWithFetch from '@/pages/Settings/components/AssetUploadFieldWithFetch';

type AppConfigFormSingleAssetFieldProps<T extends FieldValues = FieldValues> = {
  settingLocation: string;
  fieldPath: string;
  option: AppConfigExtendedOption;
  form: UseFormReturn<T>;
  assetType?: AssetType;
  onUploadSuccess?: () => void;
};

const AppConfigFormSingleAssetField = <T extends FieldValues = FieldValues>({
  settingLocation,
  fieldPath,
  option,
  form,
  assetType = ASSET_TYPES.logo,
  onUploadSuccess,
}: AppConfigFormSingleAssetFieldProps<T>) => {
  const { uploadImageFile, deleteImageFile, uploadingKey } = useFilesystemStore();
  const currentUploadKey = `${assetType}-single`;

  const { t } = useTranslation();

  const inputRef = useRef<HTMLInputElement>(null);

  const [keyValue, setKeyValue] = useState<number>(Math.floor(Math.random() * 10000));

  const path = fieldPath as Path<T>;

  const destination = settingLocation;
  const filename = getSingleAssetName(settingLocation, assetType);
  const imageUrl = getSingleAssetUrl(settingLocation, assetType);
  const previewSrc = useMemo(
    () => (imageUrl?.includes('?') ? `${imageUrl}&t=${keyValue}` : `${imageUrl}?t=${keyValue}`),
    [settingLocation, imageUrl, keyValue],
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
        onUploadSuccess?.();
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
      onUploadSuccess?.();
    } else {
      toast.error(t('survey.editor.fileDeletionError'));
    }
    setKeyValue((prev) => prev + 1);
  };

  return (
    <div className="min-w-[49%]">
      {option.title && <p className="mb-2 font-bold">{t(option.title)}</p>}
      <AssetUploadFieldWithFetch
        assetUrl={previewSrc}
        alt={t('settings.globalSettings.logo.title')}
        onDelete={onHandleReset}
        inputRef={inputRef}
        onFileChange={onFileChange}
        chooseText={t('common.chooseFile')}
        changeText={t('common.changeFile')}
        uploading={uploadingKey === currentUploadKey}
      />
    </div>
  );
};

export default AppConfigFormSingleAssetField;
