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

const useFileOperationToast = (
  fileOperationProgress: FilesharingProgressDto | null,
  filesharingProgress: FilesharingProgressDto | null,
) => {
  const { t } = useTranslation();

  const lastProgressRef = useRef<number | null>(null);

  useEffect(() => {
    const progress = fileOperationProgress ?? filesharingProgress;
    if (!progress) return;

    const percent = progress.percent ?? 0;

    if (lastProgressRef.current === percent) return;
    lastProgressRef.current = percent;

    const failedCount = progress.failedPaths?.length ?? 0;
    const filename = progress.currentFilePath?.split('/')?.pop() || '';

    const toasterData = {
      percent,
      title: t(progress.title || ''), // Fallback '' falls undefined
      id: progress.currentFilePath,
      description: t(progress.description || '', {
        filename,
        studentName: progress.studentName,
      }),
      statusDescription: progress.statusDescription,
      failed: failedCount,
      processed: progress.processed,
      total: progress.total,
    };

    let toastDuration: number;
    if (toasterData.failed > 0) {
      toastDuration = Infinity;
    } else if (percent >= 100) {
      toastDuration = 5000;
    } else {
      toastDuration = Infinity;
    }

    toast(<ProgressBox data={toasterData} />, {
      id: toasterData.title,
      duration: toastDuration,
    });
  }, [fileOperationProgress, filesharingProgress, t]);
};

export default useFileOperationToast;
