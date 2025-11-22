/*
 * Copyright (C) [2025] [Netzint GmbH]
 * All rights reserved.
 *
 * This software is dual-licensed under the terms of:
 *
 * 1. The GNU Affero General Public License (AGPL-3.0-or-later), as published by the Free Software Foundation.
 *    You may use, modify and distribute this software under the terms of the AGPL, provided that you comply with its conditions.
 *
 *    A copy of the license can be found at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * OR
 *
 * 2. A commercial license agreement with Netzint GmbH. Licensees holding a valid commercial license from Netzint GmbH
 *    may use this software in accordance with the terms contained in such written agreement, without the obligations imposed by the AGPL.
 *
 * If you are uncertain which license applies to your use case, please contact us at info@netzint.de for clarification.
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
  isLoginPage?: boolean;
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
  isLoginPage: invertBGClolor = false,
}) => {
  const backdropClass =
    variant === Theme.light
      ? `${invertBGClolor ? 'bg-neutral-900' : 'bg-white'}`
      : `${invertBGClolor ? 'bg-white' : 'bg-neutral-900'}`;
  return (
    <div
      className={clsx(
        'relative flex min-w-[50%] flex-col items-center rounded-2xl border border-dashed border-gray-300 p-6 text-center shadow-sm hover:border-gray-400',
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
