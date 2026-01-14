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
import React, { useRef, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { UseFormReturn } from 'react-hook-form';
import ThemeType from '@libs/common/types/themeType';
import ThemedFile from '@libs/common/types/themedFile';
import { getLogoName, getLogoUrl } from '@libs/appconfig/utils/getAppLogo';
import { AppConfigExtendedOption } from '@libs/appconfig/types/appConfigExtendedOption';
import LogoUploadField from '@/pages/Settings/components/LogoUploadField';
import useFilesystemStore from '@/store/FilesystemStore/useFilesystemStore';

type AppConfigFormLogoFieldProps = {
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
  const { uploadImageFile, deleteImageFile, uploadingVariant } = useFilesystemStore();

  const { t } = useTranslation();

  const inputRef = useRef<HTMLInputElement>(null);

  const [keyValue, setKeyValue] = useState<number>(Math.floor(Math.random() * 10000));

  const path = `${fieldPath}.${variant}` as keyof ThemedFile;

  const destination = appName;
  const filename = getLogoName(appName, variant);
  const logoImageUrl = getLogoUrl(appName, variant);
  const previewSrc = useMemo(
    () => (logoImageUrl?.includes('?') ? `${logoImageUrl}&t=${keyValue}` : `${logoImageUrl}?t=${keyValue}`),
    [appName, variant, logoImageUrl, keyValue],
  );

  const onFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    if (file) {
      if (!file.type.startsWith('image/')) {
        if (inputRef.current) inputRef.current.value = '';
        return;
      }

      const success = await uploadImageFile(destination, filename, file, undefined, variant);
      if (success) {
        form.setValue(path, file, { shouldDirty: true });
        toast.success(t('survey.editor.fileUploadSuccess'));
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
    } else {
      toast.error(t('survey.editor.fileDeletionError'));
    }
    setKeyValue((prev) => prev + 1);
  };

  const variantText = t(`appExtendedOptions.appLogo.${variant}`);
  return (
    <div>
      {option.title && <p className="mb-2 font-bold">{t(option.title, { variant: variantText })}</p>}
      <LogoUploadField
        variant={variant}
        inputRef={inputRef}
        previewSrc={previewSrc}
        onFileChange={onFileChange}
        chooseText={t(`common.chooseFile`)}
        changeText={t(`common.changeFile`)}
        onHandleReset={onHandleReset}
        uploading={uploadingVariant === variant}
      />
    </div>
  );
};

export default AppConfigFormLogoField;
