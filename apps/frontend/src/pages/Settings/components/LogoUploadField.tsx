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

import clsx from 'clsx';
import React from 'react';
import { HiTrash } from 'react-icons/hi2';
import { Theme, ThemeType } from '@libs/common/constants/theme';
import FileSelectButton from '@/components/ui/FileSelectButton';

type LogoUploadFieldProps = {
  variant: ThemeType;
  previewSrc?: string | null;
  cacheKey?: number;
  hasLocalSelection?: boolean;
  uploading?: boolean;
  inputRef: React.RefObject<HTMLInputElement>;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  chooseText?: string;
  changeText?: string;
  accept?: string;
  alt?: string;
  fallbackSrc?: string;
  className?: string;
  onHandleReset?: () => Promise<void>;
};

const LogoUploadField: React.FC<LogoUploadFieldProps> = ({
  variant,
  previewSrc,
  cacheKey,
  hasLocalSelection = false,
  uploading = false,
  inputRef,
  onFileChange,
  chooseText = 'Choose file',
  changeText = 'Change file',
  accept = 'image/*',
  alt = 'Logo preview',
  fallbackSrc,
  className,
  onHandleReset,
}) => {
  const backdropClass = variant === Theme.light ? 'bg-white' : 'bg-neutral-900';

  return (
    <div
      className={clsx(
        'relative flex flex-col items-center rounded-2xl border border-dashed border-gray-300 p-6 text-center shadow-sm hover:border-gray-400',
        backdropClass,
        uploading && 'pointer-events-none opacity-60',
        className,
      )}
      aria-busy={uploading}
      aria-live="polite"
    >
      <div className="absolute right-4 top-4">
        {onHandleReset && (
          <button
            type="button"
            onClick={async () => {
              await onHandleReset();
            }}
          >
            <HiTrash className="h-6 w-6 p-1 text-ciRed" />
          </button>
        )}
      </div>
      {(previewSrc || fallbackSrc) && (
        <img
          key={cacheKey}
          src={previewSrc || fallbackSrc}
          alt={alt}
          className="h-20 w-auto object-contain"
          onError={(e) => {
            if (fallbackSrc) {
              (e.currentTarget as HTMLImageElement).src = fallbackSrc;
            }
          }}
        />
      )}

      <div className="mt-3 grid w-full grid-cols-1 gap-2">
        <FileSelectButton
          ref={inputRef}
          accept={accept}
          onChange={onFileChange}
          hasSelection={hasLocalSelection}
          chooseText={chooseText}
          changeText={changeText}
          labelClassName="w-full"
          disabled={uploading}
        />
      </div>

      {uploading && (
        <div className="pointer-events-none absolute inset-0 grid place-items-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-current border-t-transparent" />
        </div>
      )}
    </div>
  );
};

export default LogoUploadField;
