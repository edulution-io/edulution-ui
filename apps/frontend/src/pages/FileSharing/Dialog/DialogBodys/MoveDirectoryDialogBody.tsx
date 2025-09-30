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
import { useSearchParams } from 'react-router-dom';
import useUserPath from '@/pages/FileSharing/hooks/useUserPath';
import MoveContentDialogBody from '@/pages/FileSharing/Dialog/DialogBodys/MoveContentDialogBody';
import type MoveContentDialogProps from '@libs/filesharing/types/moveContentDialogBodyProps';
import ContentType from '@libs/filesharing/types/contentType';

const MoveDirectoryDialogBody: React.FC<Omit<MoveContentDialogProps, 'pathToFetch'>> = (props) => {
  const { homePath } = useUserPath();
  const [searchParams] = useSearchParams();
  const pathToFetch = searchParams.get('path');

  return (
    <MoveContentDialogBody
      {...props}
      showAllFiles
      pathToFetch={pathToFetch || homePath}
      fileType={ContentType.DIRECTORY}
    />
  );
};

export default MoveDirectoryDialogBody;
