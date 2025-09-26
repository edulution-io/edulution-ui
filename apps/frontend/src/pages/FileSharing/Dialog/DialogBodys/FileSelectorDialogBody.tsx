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
import ContentType from '@libs/filesharing/types/contentType';
import FileSelectorDialogProps from '@libs/filesharing/types/fileSelectorDialogProps';
import useOpenFileDialogStore from '@/pages/FileSharing/useOpenFileDialogStore';
import MoveContentDialogBody from '@/pages/FileSharing/Dialog/DialogBodys/MoveContentDialogBody';

const FileSelectorDialogBody: React.FC<FileSelectorDialogProps> = ({
  initialPath = '',
  showHome = true,
  showFooterSelection = true,
}) => {
  const { allowedExtensions } = useOpenFileDialogStore();

  const fileHasAllowedExtension = (name: string) =>
    !allowedExtensions.length || allowedExtensions.some((ext) => name.toLowerCase().endsWith(ext.toLowerCase()));

  return (
    <MoveContentDialogBody
      showAllFiles
      pathToFetch={initialPath}
      showSelectedFile={showFooterSelection}
      showHome={showHome}
      fileType={ContentType.FILE}
      enableRowSelection={(row) =>
        row.original.type === ContentType.FILE && fileHasAllowedExtension(row.original.filename)
      }
      getRowDisabled={(row) =>
        row.original.type === ContentType.FILE && !fileHasAllowedExtension(row.original.filename)
      }
    />
  );
};

export default FileSelectorDialogBody;
