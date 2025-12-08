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

import { useParams } from 'react-router-dom';
import { DirectoryFileDTO } from '@libs/filesharing/types/directoryFileDTO';
import useFileSharingStore from '@/pages/FileSharing/useFileSharingStore';
import useFileSharingDownloadStore from '@/pages/FileSharing/useFileSharingDownloadStore';
import triggerBrowserDownload from '@libs/common/utils/triggerBrowserDownload';
import ContentType from '@libs/filesharing/types/contentType';

const useStartWebdavFileDownload = () => {
  const { webdavShare } = useParams();
  const { downloadFile } = useFileSharingDownloadStore();
  const { setFileIsCurrentlyDisabled } = useFileSharingStore();

  return async (files: DirectoryFileDTO[]) => {
    if (!files?.length) return;

    await Promise.all(
      files.map(async (file) => {
        await setFileIsCurrentlyDisabled(file.filename, true);
        try {
          const blobUrl = await downloadFile(file, webdavShare);
          if (blobUrl) {
            const name = file.type === ContentType.DIRECTORY ? `${file.filename}.zip` : file.filename;
            triggerBrowserDownload(blobUrl, name);
          }
        } finally {
          await setFileIsCurrentlyDisabled(file.filename, false);
        }
      }),
    );
  };
};

export default useStartWebdavFileDownload;
