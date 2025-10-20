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
import FilesharingProgressDto from '@libs/filesharing/types/filesharingProgressDto';
import ProgressBox from '@/components/ui/ProgressBox';
import { t } from 'i18next';
import {
  DONE_TOAST_DURATION_MS,
  ERROR_TOAST_DURATION_MS,
  LIVE_TOAST_DURATION_MS,
} from '@libs/ui/constants/showToasterDuration';

const useFileOperationProgressToast = (progress: FilesharingProgressDto | null | undefined) => {
  const lastPercent = useRef<number | null>(null);

  useEffect(() => {
    if (!progress) return;

    const pct = progress.percent ?? 0;
    if (pct === 100) {
      lastPercent.current = null;
    }
    if (pct === 0 || pct === lastPercent.current) return;
    lastPercent.current = pct;

    const failed = progress.failedPaths?.length ?? 0;
    const filename = progress.currentFilePath?.split('/').pop() ?? '';

    const toasterData = {
      percent: pct,
      title: t(progress.title ?? ''),
      id: progress.title ?? progress.processID,
      description: t(progress.description ?? '', {
        filename,
        username: progress.username,
      }),
      statusDescription: progress.statusDescription,
      failed,
      processed: progress.processed,
      total: progress.total,
    };

    const getToastDuration = (failedOperations: number, precent: number): number | undefined => {
      if (failedOperations > 0) return ERROR_TOAST_DURATION_MS;
      if (precent >= 100) return DONE_TOAST_DURATION_MS;
      return LIVE_TOAST_DURATION_MS;
    };

    toast(<ProgressBox data={toasterData} />, {
      id: toasterData.id,
      duration: getToastDuration(failed, pct),
    });
  }, [progress]);
};

export default useFileOperationProgressToast;
