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

import React, { forwardRef, useId } from 'react';

export type FileSelectButtonProps = {
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
          className={`flex w-full cursor-pointer items-center justify-center rounded-lg border bg-ciLightBlue px-4 py-2 text-sm font-medium
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
