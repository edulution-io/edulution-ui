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
