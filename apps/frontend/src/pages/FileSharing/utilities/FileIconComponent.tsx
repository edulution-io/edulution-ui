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

import React from 'react';
import { DefaultExtensionType, defaultStyles, FileIcon } from 'react-file-icon';
import { getFileCategorie, getFileNameFromPath } from '@/pages/FileSharing/utilities/filesharingUtilities';
import fileIconColors from '@/theme/fileIconColor';

interface FileIconComponentProps {
  filename: string;
  size: number;
}

const FileIconComponent: React.FC<FileIconComponentProps> = ({ filename, size }) => {
  const fileType = getFileCategorie(filename);
  const extension = getFileNameFromPath(filename).split('.').pop() || '';
  const labelColor = fileIconColors[fileType] || fileIconColors.default;

  return (
    <div style={{ width: size, height: size, display: 'flex' }}>
      <FileIcon
        extension={extension}
        type={fileType || 'document'}
        labelColor={labelColor}
        {...defaultStyles[extension as DefaultExtensionType]}
      />
    </div>
  );
};

export default FileIconComponent;
