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
import useFileSharingDownloadStore from '@/pages/FileSharing/useFileSharingDownloadStore';
import { useTranslation } from 'react-i18next';
import { formatBytes } from '@/pages/FileSharing/utilities/filesharingUtilities';
import {
  DONE_TOAST_DURATION_MS,
  ERROR_TOAST_DURATION_MS,
  LIVE_TOAST_DURATION_MS,
} from '@libs/ui/constants/showToasterDuration';
import ProgressBox from '@/components/ui/ProgressBox';

const useDownloadProgressToast = () => {
  const { t } = useTranslation();
  const downloadProgress = useFileSharingDownloadStore((s) => s.downloadProgress);

  const lastShownPercentRef = useRef<number | null>(null);
  const mountedAtMs = useRef<number>(Date.now());

  useEffect(() => {
    if (!downloadProgress || !downloadProgress.fileName) return;

    const {
      fileName,
      processId,
      percent = 0,
      lastUpdateAt = 0,
      loadedBytes = 0,
      totalBytes = 0,
      speedFormatted,
      etaFormatted,
    } = downloadProgress;

    if (!lastUpdateAt || lastUpdateAt < mountedAtMs.current) return;

    const isDone = percent >= 100;
    const isError = false;

    if (lastShownPercentRef.current === percent && !isDone) return;
    lastShownPercentRef.current = percent;

    const speedEtaLine = `${speedFormatted ?? '–'} • ${etaFormatted ?? '–'}`;

    const description = `${speedEtaLine}\n${formatBytes(loadedBytes)} / ${formatBytes(totalBytes ?? 0)}`;

    const toastData = {
      percent: isDone ? 100 : Math.max(0, Math.min(100, Math.round(percent))),
      title: t('filesharing.progressBox.downloadInfo', { filename: fileName }),
      id: `download:${fileName}:${processId ?? 'na'}`,
      description,
      failed: 0,
      processed: loadedBytes,
      total: totalBytes,
    };

    let duration = LIVE_TOAST_DURATION_MS;
    if (isError) duration = ERROR_TOAST_DURATION_MS;
    else if (isDone) duration = DONE_TOAST_DURATION_MS;

    toast(
      <div className="whitespace-pre-wrap normal-case tabular-nums">
        <ProgressBox data={toastData} />
      </div>,
      { id: toastData.id, duration },
    );
  }, [downloadProgress, t]);
};

export default useDownloadProgressToast;
