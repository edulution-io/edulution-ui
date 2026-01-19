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
import { UseFormReturn } from 'react-hook-form';
import THEME from '@libs/common/constants/theme';
import ThemeType from '@libs/common/types/themeType';
import ThemedFile from '@libs/common/types/themedFile';
import { getAssetName, getAssetUrl } from '@libs/appconfig/utils/getAppAsset';
import { AppConfigExtendedOption } from '@libs/appconfig/types/appConfigExtendedOption';
import ASSET_TYPES from '@libs/appconfig/constants/assetTypes';
import AssetType from '@libs/appconfig/types/assetType';
import useFilesystemStore from '@/store/FilesystemStore/useFilesystemStore';
import AssetUploadFieldWithFetch from '@/pages/Settings/components/AssetUploadFieldWithFetch';

type AppConfigFormAssetFieldProps = {
  variant: typeof THEME.light | typeof THEME.dark;
  appName: string;
  fieldPath: string;
  option: AppConfigExtendedOption;
  form: UseFormReturn<ThemedFile>;
  assetType?: AssetType;
  onUploadSuccess?: (variant: ThemeType) => void;
};

const AppConfigFormAssetField: React.FC<AppConfigFormAssetFieldProps> = ({
  variant,
  appName,
  fieldPath,
  option,
  form,
  assetType = ASSET_TYPES.logo,
  onUploadSuccess,
}) => {
  const { uploadImageFile, deleteImageFile, uploadingKey } = useFilesystemStore();
  const currentUploadKey = `${assetType}-${variant}`;

  const { t } = useTranslation();

  const inputRef = useRef<HTMLInputElement>(null);

  const [keyValue, setKeyValue] = useState<number>(Math.floor(Math.random() * 10000));

  const path = `${fieldPath}.${variant}` as keyof ThemedFile;

  const destination = appName;
  const filename = getAssetName(appName, variant, assetType);
  const imageUrl = getAssetUrl(appName, variant, assetType);
  const previewSrc = useMemo(
    () => (imageUrl?.includes('?') ? `${imageUrl}&t=${keyValue}` : `${imageUrl}?t=${keyValue}`),
    [appName, variant, imageUrl, keyValue],
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
        form.setValue(path, file, { shouldDirty: true });
        toast.success(t('survey.editor.fileUploadSuccess'));
        onUploadSuccess?.(variant);
      } else {
        form.setValue(path, null, { shouldDirty: true });
        toast.error(t('survey.editor.fileUploadError'));
      }
      setKeyValue((prev) => prev + 1);
    }
  };

  const onHandleReset = async () => {
    const success = await deleteImageFile(appName, filename, variant);
    if (success) {
      form.setValue(path, null, { shouldDirty: true });
      toast.success(t('survey.editor.fileDeletionSuccess'));
      onUploadSuccess?.(variant);
    } else {
      toast.error(t('survey.editor.fileDeletionError'));
    }
    setKeyValue((prev) => prev + 1);
  };

  const variantText = t(`appExtendedOptions.appLogo.${variant}`);
  return (
    <div className="min-w-[49%]">
      {option.title && <p className="mb-2 font-bold">{t(option.title, { variant: variantText })}</p>}
      <AssetUploadFieldWithFetch
        assetUrl={previewSrc}
        alt={t(`appExtendedOptions.appLogo.${variant}`)}
        onDelete={onHandleReset}
        variant={variant}
        inputRef={inputRef}
        onFileChange={onFileChange}
        chooseText={t(`common.chooseFile`)}
        changeText={t(`common.changeFile`)}
        uploading={uploadingKey === currentUploadKey}
      />
    </div>
  );
};

export default AppConfigFormAssetField;
