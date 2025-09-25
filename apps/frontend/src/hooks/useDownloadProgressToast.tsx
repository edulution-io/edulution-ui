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

    const speedEtaLine = `${speedFormatted ?? '–'  } • ${  etaFormatted ?? '–'}`;

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
