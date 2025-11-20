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
import { useTranslation } from 'react-i18next';
import { UseFormReturn } from 'react-hook-form';
import { ThemeType } from '@libs/common/constants/theme';
import ThemedFile from '@libs/common/types/themedFile';
import { getLogoName, getLogoUrl } from '@libs/appconfig/utils/getAppLogo';
import LogoUploadField from '@/pages/Settings/components/LogoUploadField';
import FilesystemStore from '@/store/FilesystemStore/useFilesystemStore';

export type AppConfigFormLogoFieldProps = {
  variant: ThemeType;
  appName: string;
  fieldPath: string;
  form: UseFormReturn<ThemedFile>;
};

const AppConfigFormLogoField: React.FC<AppConfigFormLogoFieldProps> = ({ variant, appName, fieldPath, form }) => {
  const { uploadImageFile, deleteImageFile } = FilesystemStore();

  const { t } = useTranslation();

  const [keyValue, setKeyValue] = React.useState<number>(0);

  const path = `${fieldPath}.${variant}` as keyof ThemedFile;

  const destination = appName;
  const filename = getLogoName(appName, variant);
  const previewSrc = getLogoUrl(appName, variant);

  const inputRef = useRef<HTMLInputElement>(null);

  const hasLocalSelection = !!form.watch(path);

  const onFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    if (file && !file.type.startsWith('image/')) {
      if (inputRef.current) inputRef.current.value = '';
      return;
    }

    form.setValue(path, file, { shouldDirty: true });

    if (file && variant) {
      await uploadImageFile(destination, filename, file);
      setKeyValue((prev) => prev + 1);
    }
  };

  const onHandleReset = async () => {
    await deleteImageFile(appName, filename);
    setKeyValue((prev) => prev + 1);
  };

  return (
    <LogoUploadField
      cacheKey={keyValue}
      variant={variant}
      inputRef={inputRef}
      previewSrc={previewSrc}
      hasLocalSelection={hasLocalSelection}
      onFileChange={onFileChange}
      chooseText={t(`common.chooseFile`)}
      changeText={t(`common.changeFile`)}
      onHandleReset={onHandleReset}
    />
  );
};

export default AppConfigFormLogoField;
