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

import React, { useCallback, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import ProgressBox from '@/components/ui/ProgressBox';
import useFileSharingStore from '@/pages/FileSharing/useFileSharingStore';
import useHandelUploadFileStore from '@/pages/FileSharing/Dialog/upload/useHandelUploadFileStore';
import formatTransferSpeed from '@libs/filesharing/utils/formatTransferSpeed';
import formatEstimatedTimeRemaining from '@libs/filesharing/utils/formatEstimatedTimeRemaining';
import { useTranslation } from 'react-i18next';
import UploadStatus from '@libs/filesharing/types/uploadStatus';
import { formatBytes } from '@/pages/FileSharing/utilities/filesharingUtilities';
import {
  DONE_TOAST_DURATION_MS,
  ERROR_TOAST_DURATION_MS,
  LIVE_TOAST_DURATION_MS,
} from '@libs/ui/constants/showToasterDuration';
import { UploadStatusType } from '@libs/filesharing/types/uploadStatusType';

const useUploadProgressToast = () => {
  const { progressByName } = useHandelUploadFileStore();
  const { currentPath, fetchFiles } = useFileSharingStore();
  const { t } = useTranslation();

  const lastShownPercentageByFileName = useRef<Record<string, number>>({});
  const hasRefreshedForFile = useRef<Set<string>>(new Set());
  const mountedAtMs = useRef<number>(Date.now());

  const prevStatusByName = useRef<Record<string, UploadStatusType | undefined>>({});

  const getLastUpdateTs = useCallback(
    (item: { lastUpdateTimestampMs?: number; lastTsMs?: number }) => item.lastUpdateTimestampMs ?? item.lastTsMs ?? 0,
    [],
  );
  const getPercent = useCallback(
    (item: { percent?: number; percentageComplete?: number }) => item.percent ?? item.percentageComplete ?? 0,
    [],
  );
  const getLoadedBytes = useCallback(
    (item: { loaded?: number; loadedByteCount?: number }) => item.loaded ?? item.loadedByteCount ?? 0,
    [],
  );
  const getTotalBytes = useCallback(
    (item: { total?: number; totalByteCount?: number }) => item.total ?? item.totalByteCount,
    [],
  );

  useEffect(() => {
    Object.entries(progressByName).forEach(([fileName, progress]) => {
      const { status } = progress;
      const rawPercent = getPercent(progress);

      const isUploading = status === UploadStatus.uploading;
      const isDone = status === UploadStatus.done || rawPercent >= 100;
      const isError = status === UploadStatus.error;

      if (!isUploading && !isDone && !isError) return;

      const progressToastId = `upload:${fileName}`;
      const errorToastId = `upload:${fileName}:error`;
      const prev = prevStatusByName.current[fileName];

      if (isUploading && prev !== UploadStatus.uploading) {
        delete lastShownPercentageByFileName.current[fileName];
      }

      if (isError && prev !== UploadStatus.error) {
        toast.dismiss(progressToastId);
        toast.error(t('filesharing.errors.UploadFailed', { filename: fileName }), {
          id: errorToastId,
          description: undefined,
          duration: ERROR_TOAST_DURATION_MS,
        });
        prevStatusByName.current[fileName] = status;
        return;
      }

      const lastTs = getLastUpdateTs(progress as { lastUpdateTimestampMs?: number; lastTsMs?: number });
      if (!lastTs || lastTs < mountedAtMs.current) {
        prevStatusByName.current[fileName] = status;
        return;
      }

      const percentage = isDone ? 100 : rawPercent;
      const last = lastShownPercentageByFileName.current[fileName] ?? -1;
      if (percentage === last) {
        prevStatusByName.current[fileName] = status;
        return;
      }
      lastShownPercentageByFileName.current[fileName] = percentage;

      const loadedBytes = getLoadedBytes(progress);
      const totalBytes = getTotalBytes(progress);
      const bytesPerSecond = progress.bytesPerSecond ?? progress.speedBps ?? 0;
      const etaSeconds = progress.estimatedSecondsRemaining ?? progress.etaSeconds;

      const speedEtaLine = `${formatTransferSpeed(bytesPerSecond)} • ${formatEstimatedTimeRemaining(etaSeconds)}`;
      const description = `${speedEtaLine}\n${formatBytes(loadedBytes)} / ${formatBytes(totalBytes || 0)}`;

      const toastData = {
        percent: percentage,
        title: t('filesharing.progressBox.fileIsUploading', { filename: fileName }),
        id: progressToastId,
        description,
        failed: 0,
        processed: loadedBytes,
        total: totalBytes,
      };

      const toastDuration = isDone ? DONE_TOAST_DURATION_MS : LIVE_TOAST_DURATION_MS;

      toast(
        <div className="whitespace-pre-wrap normal-case tabular-nums">
          <ProgressBox data={toastData} />
        </div>,
        { id: toastData.id, duration: toastDuration },
      );

      if (isDone && !hasRefreshedForFile.current.has(fileName)) {
        hasRefreshedForFile.current.add(fileName);
        void fetchFiles(currentPath);
      }

      prevStatusByName.current[fileName] = status;
    });
  }, [progressByName, currentPath, fetchFiles, t]);
};

export default useUploadProgressToast;
