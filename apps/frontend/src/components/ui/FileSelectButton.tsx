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

import React, { forwardRef, useId } from 'react';

type FileSelectButtonProps = {
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  accept?: string;
  multiple?: boolean;
  disabled?: boolean;
  hasSelection?: boolean;
  chooseText?: React.ReactNode;
  changeText?: React.ReactNode;
  labelClassName?: string;
  inputId?: string;
};

const FileSelectButton = forwardRef<HTMLInputElement, FileSelectButtonProps>(
  (
    {
      onChange,
      accept = 'image/*',
      multiple = false,
      disabled = false,
      hasSelection = false,
      chooseText = '',
      changeText = '',
      labelClassName = '',
      inputId,
    },
    ref,
  ) => {
    const autoId = useId();
    const id = inputId ?? `file-select-${autoId}`;

    return (
      <>
        <input
          id={id}
          ref={ref}
          type="file"
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          onChange={onChange}
          className="sr-only"
        />
        <label
          htmlFor={id}
          className={`flex w-full cursor-pointer items-center justify-center rounded-xl border bg-primary px-4 py-2 text-sm font-medium
            ${disabled ? 'cursor-not-allowed opacity-50' : ''} ${labelClassName}`}
        >
          {hasSelection ? changeText : chooseText}
        </label>
      </>
    );
  },
);

FileSelectButton.displayName = 'FileSelectButton';
export default FileSelectButton;
