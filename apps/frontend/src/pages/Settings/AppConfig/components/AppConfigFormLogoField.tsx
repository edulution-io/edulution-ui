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

import i18n from '@/i18n';
import React, { useRef, useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { ThemeType } from '@libs/common/constants/theme';
import ThemedFile from '@libs/common/types/themedFile';
import { getLogoName, getLogoUrl } from '@libs/appconfig/utils/getAppLogo';
import { AppConfigExtendedOption } from '@libs/appconfig/types/appConfigExtendedOption';
import LogoUploadField from '@/pages/Settings/components/LogoUploadField';
import FilesystemStore from '@/store/FilesystemStore/useFilesystemStore';

export type AppConfigFormLogoFieldProps = {
  variant: ThemeType;
  appName: string;
  fieldPath: string;
  option: AppConfigExtendedOption;
  form: UseFormReturn<ThemedFile>;
};

const AppConfigFormLogoField: React.FC<AppConfigFormLogoFieldProps> = ({
  variant,
  appName,
  fieldPath,
  option,
  form,
}) => {
  const { uploadImageFile, deleteImageFile, error, reset } = FilesystemStore();

  const [keyValue, setKeyValue] = useState<number>(0);

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

    if (file) {
      const success = await uploadImageFile(destination, filename, file);
      if (success) {
        form.setValue(path, file, { shouldDirty: true });
        setKeyValue((prev) => prev + 1);
      }
    }
  };

  const onHandleReset = async () => {
    const success = await deleteImageFile(appName, filename);
    if (success) {
      reset();
      form.setValue(path, null, { shouldDirty: true });
      setKeyValue((prev) => prev + 1);
    }
  };

  const variantText = i18n.t(`appExtendedOptions.appLogo.${variant}`);
  return (
    <div>
      {option.title && <p className="font-bold">{i18n.t(option.title, { variant: variantText })}</p>}
      {option.description && <p className="mb-2 text-[0.8rem] text-muted-foreground">{i18n.t(option.description)}</p>}
      <LogoUploadField
        cacheKey={keyValue}
        variant={variant}
        inputRef={inputRef}
        previewSrc={previewSrc}
        hasLocalSelection={hasLocalSelection}
        onFileChange={onFileChange}
        chooseText={i18n.t(`common.chooseFile`)}
        changeText={i18n.t(`common.changeFile`)}
        onHandleReset={onHandleReset}
      />
      {error && <p className="text-sm text-red-600">{error.message}</p>}
    </div>
  );
};

export default AppConfigFormLogoField;
