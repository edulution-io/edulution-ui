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

import React from 'react';
import { Upload } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useDropzone } from 'react-dropzone';

interface FileDropZoneProps {
  onFileDrop: (files: File[]) => void;
  children: React.ReactNode;
  disabled?: boolean;
  accept?: Record<string, string[]>;
  maxFiles?: number;
}

const FileDropZone: React.FC<FileDropZoneProps> = ({ onFileDrop, children, disabled = false, accept, maxFiles }) => {
  const { t } = useTranslation();
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: onFileDrop,
    disabled,
    accept,
    maxFiles,
    noClick: true,
    noKeyboard: true,
  });

  return (
    <div
      {...getRootProps()}
      className="relative h-full w-full"
    >
      <input {...getInputProps()} />
      {children}

      {isDragActive && (
        <div className="bg-primary/5 absolute inset-0 z-50 flex items-center justify-center rounded-lg border-4 border-dashed border-primary backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4 text-center">
            <Upload className="size-16 text-primary" />
            <div>
              <p className="text-lg font-semibold text-primary">{t('filesharingUpload.dropHere')}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileDropZone;
