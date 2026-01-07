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
import { FcFolder } from 'react-icons/fc';
import { DirectoryFileDTO } from '@libs/filesharing/types/directoryFileDTO';
import ContentType from '@libs/filesharing/types/contentType';
import isImageExtension from '@libs/filesharing/utils/isImageExtension';
import getFileExtension from '@libs/filesharing/utils/getFileExtension';
import CircleLoader from '@/components/ui/Loading/CircleLoader';
import FileIconComponent from './FileIconComponent';
import FileThumbnail from './FileThumbnail';

interface FileSharingIconProps {
  file: DirectoryFileDTO;
  size: number;
  isLoading?: boolean;
}

const FileSharingIcon = ({ file, size, isLoading = false }: FileSharingIconProps) => {
  if (isLoading) {
    return (
      <CircleLoader
        height="h-6"
        width="w-6"
      />
    );
  }

  if (file.type === ContentType.DIRECTORY) {
    return <FcFolder size={size} />;
  }

  const extension = getFileExtension(file.filePath);
  if (isImageExtension(extension) && file.etag) {
    return (
      <FileThumbnail
        filePath={file.filePath}
        etag={file.etag}
        size={size}
      />
    );
  }

  return (
    <FileIconComponent
      filename={file.filePath}
      size={size}
    />
  );
};

export default FileSharingIcon;
