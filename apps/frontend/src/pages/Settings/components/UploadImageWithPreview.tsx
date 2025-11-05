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
import { cva, type VariantProps } from 'class-variance-authority';
import { useTranslation } from 'react-i18next';
import { Theme, ThemeType } from '@libs/common/constants/theme';
import ThemedFile from '@libs/common/types/themedFile';
import uploadImageFile from '@/store/FilesystemStore/uploadImageFile';
import LogoUploadField from '@/pages/Settings/components/LogoUploadField';

const uploadImageWithPreviewVariants = cva(['p-4 hover:opacity-90 rounded-xl text-background justify-center'], {
  variants: {
    variant: {
      'dark': 'bg-black',
      'light': 'bg-white',
    },
    size: {
      half: 'w-1/2',
      full: 'w-full',
    },
  },
});

export type UploadImageWithPreviewProps = VariantProps<typeof uploadImageWithPreviewVariants> & {
  destination: string;
  filename: string;
  appName: string;
  path: string;
  formValue: ThemedFile;
  setFormValue: (path: string, file: File | null, options?: object) => void;
  getUrl: (variant: ThemeType) => string;
};

const UploadImageWithPreview: React.FC<UploadImageWithPreviewProps> = ({ destination, filename, appName, variant, path, formValue, setFormValue, getUrl }) => {
  const { t } = useTranslation();

  const lightInputRef = useRef<HTMLInputElement>(null);
  const darkInputRef = useRef<HTMLInputElement>(null);

  const setFormFileForVariant = (file: File | null) => {
    setFormValue(variant === Theme.light ? `${path}.light` : `${path}.dark`, file, { shouldDirty: true });
  };

  const onFileChange = (): React.ChangeEventHandler<HTMLInputElement> =>
    async (event) => {
      const file = event.target.files?.[0] ?? null;
      if (file && !file.type.startsWith('image/')) {
        const input = variant === Theme.light ? lightInputRef : darkInputRef;
        if (input.current) input.current.value = '';
        return;
      }
      setFormFileForVariant(file);
      if (file && variant) await uploadImageFile({
        destination,
        filename,
        file,
        appName,
      });
    };

  const darkPreviewSrc = getUrl(Theme.dark);
  const hasDarkSelection = !!formValue.dark;

  return (
    <LogoUploadField
      variant={Theme.dark}
      previewSrc={darkPreviewSrc}
      hasLocalSelection={hasDarkSelection}
      inputRef={darkInputRef}
      onFileChange={onFileChange()}
      chooseText={t('common.chooseFile')}
      changeText={t('common.changeFile')}
    />
  );
};

export default UploadImageWithPreview;
