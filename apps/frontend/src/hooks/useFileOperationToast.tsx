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

import React, { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import FilesharingProgressDto from '@libs/filesharing/types/filesharingProgressDto';
import ProgressBox from '@/components/ui/ProgressBox';
import useFileSharingDownloadStore from '@/pages/FileSharing/useFileSharingDownloadStore';

const useFileOperationToast = () => {
  const { t } = useTranslation();
  const { downloadProgress } = useFileSharingDownloadStore();
  const lastProgressRef = useRef<number | null>(null);

  const filesharingProgressDto: FilesharingProgressDto = {
    title: t('filesharing.progressBox.downloadInfo', { filename: downloadProgress?.fileName }),
    percent: downloadProgress.percent,
    processID: downloadProgress.processId,
  };

  useEffect(() => {
    const progress = filesharingProgressDto;
    if (!progress) return;

    const percent = progress.percent ?? 0;

    if (percent === 0) {
      lastProgressRef.current = 0;
      return;
    }

    if (lastProgressRef.current === percent) return;
    lastProgressRef.current = percent;

    const failedCount = progress.failedPaths?.length ?? 0;
    const filename = progress.currentFilePath?.split('/')?.pop() || '';

    const toasterData = {
      percent,
      title: t(progress.title || ''),
      id: progress.currentFilePath || progress.processID,
      description: t(progress.description || '', {
        filename,
        studentName: progress.username,
      }),
      statusDescription: progress.statusDescription,
      failed: failedCount,
      processed: progress.processed,
      total: progress.total,
    };

    const getToastDuration = (failed: number, pct: number) => {
      if (failed > 0) return Infinity;
      if (pct >= 100) return 5000;
      return Infinity;
    };

    const toastDuration = getToastDuration(failedCount, percent);

    toast(<ProgressBox data={toasterData} />, {
      id: toasterData.title,
      duration: toastDuration,
    });
  }, [filesharingProgressDto]);
};

export default useFileOperationToast;
