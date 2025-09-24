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
