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
import uploadImageFile from '@/store/FilesystemStore/uploadImageFile';
import LogoUploadField from '@/pages/Settings/components/LogoUploadField';
import EDU_API_ROOT from '@libs/common/constants/eduApiRoot';

export type UploadImageVariantProps = {
  variant: ThemeType;
  settingLocation: string;
  fieldPath: string;
  form: UseFormReturn<ThemedFile>;
};

const UploadImageVariant: React.FC<UploadImageVariantProps> = ({ variant, settingLocation, fieldPath, form }) => {
  const { t } = useTranslation();

  const path = `${fieldPath}.${variant}` as keyof ThemedFile;

  const fileName = `${settingLocation}-default-logo-${variant}.webp`;
  const url = `/${EDU_API_ROOT}/public/assets/${settingLocation}/${fileName}`;

  const inputRef = useRef<HTMLInputElement>(null);

  const hasLocalSelection = !!form.watch(path);

  const onFileChange = (): React.ChangeEventHandler<HTMLInputElement> => async (event) => {
    const file = event.target.files?.[0] ?? null;
    if (file && !file.type.startsWith('image/')) {
      if (inputRef.current) inputRef.current.value = '';
      return;
    }

    form.setValue(path, file, { shouldDirty: true });

    if (file && variant)
      await uploadImageFile({
        destination: path,
        filename: fileName,
        file,
        appName: settingLocation,
      });
  };

  return (
    <LogoUploadField
      variant={variant}
      inputRef={inputRef}
      previewSrc={url}
      hasLocalSelection={hasLocalSelection}
      onFileChange={onFileChange()}
      chooseText={t(`common.chooseFile`)}
      changeText={t(`common.changeFile`)}
    />
  );
};

export default UploadImageVariant;
