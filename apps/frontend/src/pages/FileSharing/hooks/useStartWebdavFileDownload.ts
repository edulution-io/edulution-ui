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

const useStartWebdavFileDownload = () => {
  const { webdavShare } = useParams();
  const { loadDownloadUrlMultipleFiles } = useFileSharingDownloadStore();
  const { setFileIsCurrentlyDisabled } = useFileSharingStore();

  return async (files: DirectoryFileDTO[]) => {
    if (!files.length) return;

    await Promise.all(files.map((file) => setFileIsCurrentlyDisabled(file.filename, true)));

    const url = await loadDownloadUrlMultipleFiles(files, webdavShare);
    if (!url) {
      await Promise.all(files.map((file) => setFileIsCurrentlyDisabled(file.filename, false)));
      return;
    }

    const link = Object.assign(document.createElement('a'), {
      href: url,
      download: files.length > 1 ? 'download.zip' : files[0].filename,
    });
    document.body.append(link);
    link.click();
    link.remove();

    await Promise.all(files.map((file) => setFileIsCurrentlyDisabled(file.filename, false)));
  };
};

export default useStartWebdavFileDownload;
