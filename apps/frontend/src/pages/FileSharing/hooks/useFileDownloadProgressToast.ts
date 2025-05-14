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

import { useTranslation } from 'react-i18next';
import FilesharingProgressDto from '@libs/filesharing/types/filesharingProgressDto';
import useFileSharingDownloadStore from '@/pages/FileSharing/useFileSharingDownloadStore';
import useProgressToast from '@/hooks/useProgressToast';

const useFileDownloadProgressToast = () => {
  const { t } = useTranslation();
  const { downloadProgress } = useFileSharingDownloadStore();

  const progress: FilesharingProgressDto | null = downloadProgress
    ? {
        title: t('filesharing.progressBox.downloadInfo', {
          filename: downloadProgress.fileName,
        }),
        percent: downloadProgress.percent,
        processID: downloadProgress.processId,
      }
    : null;

  useProgressToast(progress);
};

export default useFileDownloadProgressToast;
