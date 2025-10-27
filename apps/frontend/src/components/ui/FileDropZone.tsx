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

import React, { useState } from 'react';
import { Upload } from 'lucide-react';

interface FileDropZoneProps {
  onFileDrop: (files: File[]) => void;
  children: React.ReactNode;
  disabled?: boolean;
  accept?: string;
  maxFiles?: number;
}

const FileDropZone: React.FC<FileDropZoneProps> = ({ onFileDrop, children, disabled = false, accept, maxFiles }) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (disabled) return;

    if (e.dataTransfer.types.includes('Files')) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;

    if (x <= rect.left || x >= rect.right || y <= rect.top || y >= rect.bottom) {
      setIsDragOver(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (disabled) return;

    let files = Array.from(e.dataTransfer.files);

    if (accept) {
      const acceptedTypes = accept.split(',').map((type) => type.trim());
      files = files.filter((file) => {
        const fileType = file.type;
        const fileExtension = `.${file.name.split('.').pop()?.toLowerCase()}`;

        return acceptedTypes.some((acceptedType) => {
          if (acceptedType.endsWith('/*')) {
            const generalType = acceptedType.replace('/*', '');
            return fileType.startsWith(generalType);
          }
          return acceptedType === fileType || acceptedType === fileExtension;
        });
      });
    }

    if (maxFiles && files.length > maxFiles) {
      files = files.slice(0, maxFiles);
    }

    if (files.length > 0) {
      onFileDrop(files);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="relative h-full w-full"
    >
      {children}

      {isDragOver && (
        <div className="bg-primary/5 absolute inset-0 z-50 flex items-center justify-center rounded-lg border-4 border-dashed border-primary backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4 text-center">
            <Upload className="size-16 text-primary" />
            <div>
              <p className="text-lg font-semibold text-primary">Dateien hier ablegen</p>
              <p className="text-sm text-muted-foreground">zum Hochladen</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileDropZone;
