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
import EDU_API_ROOT from '@libs/common/constants/eduApiRoot';
import FILE_ENDPOINTS from '@libs/filesystem/constants/endpoints';
import EDU_API_CONFIG_ENDPOINTS from '@libs/appconfig/constants/appconfig-endpoints';
import uploadImageFile from '@/store/FilesystemStore/uploadImageFile';
import LogoUploadField from '@/pages/Settings/components/LogoUploadField';

export type LogoUploadBrandingAppFieldProps = {
  variant: ThemeType;
  appName: string;
  fieldPath: string;
  form: UseFormReturn<ThemedFile>;
};

const LogoUploadBrandingAppField: React.FC<LogoUploadBrandingAppFieldProps> = ({
  variant,
  appName,
  fieldPath,
  form,
}) => {
  const { t } = useTranslation();

  const [keyValue, setKeyValue] = React.useState<number>(0);

  const path = `${fieldPath}.${variant}` as keyof ThemedFile;

  const filename = `${appName}-custom-logo-${variant}.webp`;
  const previewSrc = `/${EDU_API_ROOT}/${EDU_API_CONFIG_ENDPOINTS.FILES}/${FILE_ENDPOINTS.FILE}/${appName}/${filename}`;

  const fallbackFileName = `${appName}-default-logo-${variant}.webp`;
  const fallbackSrc = `/${EDU_API_ROOT}/public/assets/${appName}/${fallbackFileName}`;

  const inputRef = useRef<HTMLInputElement>(null);

  const hasLocalSelection = !!form.watch(path);

  const onFileChange = (): React.ChangeEventHandler<HTMLInputElement> => async (event) => {
    const file = event.target.files?.[0] ?? null;
    if (file && !file.type.startsWith('image/')) {
      if (inputRef.current) inputRef.current.value = '';
      return;
    }

    form.setValue(path, file, { shouldDirty: true });

    if (file && variant) {
      await uploadImageFile({
        destination: '',
        filename,
        file,
        appName,
      });
      setKeyValue(keyValue + 1);
    }
  };

  return (
    <LogoUploadField
      cacheKey={keyValue}
      variant={variant}
      inputRef={inputRef}
      previewSrc={previewSrc}
      fallbackSrc={fallbackSrc}
      hasLocalSelection={hasLocalSelection}
      onFileChange={onFileChange()}
      chooseText={t(`common.chooseFile`)}
      changeText={t(`common.changeFile`)}
    />
  );
};

export default LogoUploadBrandingAppField;
