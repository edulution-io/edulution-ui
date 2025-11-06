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
import { useParams } from 'react-router-dom';
import { UploadStatusType } from '@libs/filesharing/types/uploadStatusType';

const useUploadProgressToast = () => {
  const { webdavShare } = useParams();
  const { progressById } = useHandelUploadFileStore();
  const { currentPath, fetchFiles } = useFileSharingStore();
  const { t } = useTranslation();

  const lastShownPercentageByFileId = useRef<Record<string, number>>({});
  const hasRefreshedForFile = useRef<Set<string>>(new Set());
  const mountedAtMs = useRef<number>(Date.now());
  const prevStatusById = useRef<Record<string, UploadStatusType | undefined>>({});

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
    Object.entries(progressById).forEach(([fileId, { share, fileName, progress }]) => {
      const { status } = progress;
      const rawPercent = getPercent(progress);

      const isUploading = status === UploadStatus.uploading;
      const isDone = status === UploadStatus.done || rawPercent >= 100;
      const isError = status === UploadStatus.error;

      if (!isUploading && !isDone && !isError) return;

      const progressToastId = `upload:${share ?? 'default'}:${fileId}`;
      const errorToastId = `${progressToastId}:error`;
      const prev = prevStatusById.current[fileId];

      if (isUploading && prev !== UploadStatus.uploading) {
        delete lastShownPercentageByFileId.current[fileId];
      }

      if (isError && prev !== UploadStatus.error) {
        toast.dismiss(progressToastId);
        toast.error(t('filesharing.errors.UploadFailed', { filename: fileName }), {
          id: errorToastId,
          description: undefined,
          duration: ERROR_TOAST_DURATION_MS,
        });
        prevStatusById.current[fileId] = status;
        return;
      }

      const lastTs = getLastUpdateTs(progress);
      if (!lastTs || lastTs < mountedAtMs.current) {
        prevStatusById.current[fileId] = status;
        return;
      }

      const percentage = isDone ? 100 : rawPercent;
      const last = lastShownPercentageByFileId.current[fileId] ?? -1;
      if (percentage === last) {
        prevStatusById.current[fileId] = status;
        return;
      }
      lastShownPercentageByFileId.current[fileId] = percentage;

      const loadedBytes = getLoadedBytes(progress);
      const totalBytes = getTotalBytes(progress);
      const bytesPerSecond = progress.bytesPerSecond ?? progress.speedBps ?? 0;
      const etaSeconds = progress.estimatedSecondsRemaining ?? progress.etaSeconds;
      const speedEtaLine = `${formatTransferSpeed(bytesPerSecond)} • ${formatEstimatedTimeRemaining(etaSeconds)}`;
      const description = `${speedEtaLine}\n${formatBytes(loadedBytes)} / ${formatBytes(totalBytes || 0)}`;

      const toastData = {
        percent: percentage,
        title: t('filesharing.progressBox.fileIsUploading', {
          filename: fileName ?? `File ${fileId}`,
        }),
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

      if (isDone && !hasRefreshedForFile.current.has(fileId)) {
        hasRefreshedForFile.current.add(fileId);
        void fetchFiles(share ?? webdavShare, currentPath);
      }

      prevStatusById.current[fileId] = status;
    });
  }, [progressById, currentPath, fetchFiles, t]);
};

export default useUploadProgressToast;
