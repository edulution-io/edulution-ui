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

const COMBINED_UPLOAD_TOAST_ID = 'upload:combined';

const useUploadProgressToast = () => {
  const { progressById, totalFilesCount, totalBytesCount, clearProgress } = useHandelUploadFileStore();
  const { currentPath, fetchFiles } = useFileSharingStore();
  const { t } = useTranslation();

  const hasRefreshedAfterComplete = useRef<boolean>(false);
  const lastShownPercentage = useRef<number>(-1);

  const getPercent = useCallback(
    (item: { percent?: number; percentageComplete?: number }) => item.percent ?? item.percentageComplete ?? 0,
    [],
  );
  const getLoadedBytes = useCallback(
    (item: { loaded?: number; loadedByteCount?: number }) => item.loaded ?? item.loadedByteCount ?? 0,
    [],
  );
  const getTotalBytes = useCallback(
    (item: { total?: number; totalByteCount?: number }) => item.total ?? item.totalByteCount ?? 0,
    [],
  );

  useEffect(() => {
    const entries = Object.entries(progressById);

    if (entries.length === 0) {
      toast.dismiss(COMBINED_UPLOAD_TOAST_ID);
      hasRefreshedAfterComplete.current = false;
      lastShownPercentage.current = -1;
      return;
    }

    let completedFiles = 0;
    let failedFiles = 0;
    let totalLoadedBytes = 0;
    let totalBytesPerSecond = 0;
    let hasActiveUploads = false;
    let webdavShare: string | undefined;
    let currentFileName: string | undefined;
    let isCreatingDirectories = false;
    let directoryProgress = { current: 0, total: 0 };

    entries.forEach(([fileId, { share, progress, fileName }]) => {
      const { status } = progress;
      const percent = getPercent(progress);
      const loadedBytes = getLoadedBytes(progress);
      const fileTotalBytes = getTotalBytes(progress);
      const bytesPerSecond = progress.bytesPerSecond ?? progress.speedBps ?? 0;

      if (!webdavShare && share) {
        webdavShare = share;
      }

      if (fileId === 'directory-creation') {
        isCreatingDirectories = true;
        directoryProgress = {
          current: progress.loaded || 0,
          total: progress.total || 0,
        };
        return;
      }

      if (status === UploadStatus.uploading) {
        currentFileName = fileName;
      }

      if (status === UploadStatus.done || percent >= 100) {
        completedFiles += 1;
        totalLoadedBytes += fileTotalBytes;
      } else if (status === UploadStatus.error) {
        failedFiles += 1;
      } else if (status === UploadStatus.uploading) {
        hasActiveUploads = true;
        totalLoadedBytes += loadedBytes;
        totalBytesPerSecond += bytesPerSecond;
      }
    });

    const overallPercentage = totalBytesCount > 0 ? Math.round((totalLoadedBytes / totalBytesCount) * 100) : 0;

    if (overallPercentage === lastShownPercentage.current && !isCreatingDirectories) {
      return;
    }
    lastShownPercentage.current = overallPercentage;

    const isDone = completedFiles + 1 === totalFilesCount;
    const hasErrors = failedFiles > 0;

    if (isDone && !hasRefreshedAfterComplete.current) {
      hasRefreshedAfterComplete.current = true;
      clearProgress();
      void fetchFiles(webdavShare, currentPath);
    }

    if (totalFilesCount === 0 || totalBytesCount === 0) {
      return;
    }

    if (hasErrors && !hasActiveUploads) {
      toast.dismiss(COMBINED_UPLOAD_TOAST_ID);
      const failedFileText = failedFiles === 1 ? t('filesharing.file') : t('filesharing.files');
      toast.error(
        t('filesharing.errors.UploadFailed', {
          filename: `${failedFiles} ${failedFileText}`,
        }),
        {
          duration: ERROR_TOAST_DURATION_MS,
        },
      );
      return;
    }

    const currentFileNumber = completedFiles + (hasActiveUploads ? 1 : 0);
    const etaSeconds = totalBytesPerSecond > 0 ? (totalBytesCount - totalLoadedBytes) / totalBytesPerSecond : undefined;

    const fileText = totalFilesCount === 1 ? t('filesharing.file') : t('filesharing.files');

    let title: string;
    if (isCreatingDirectories) {
      title = `${t('filesharing.creatingDirectoryStructure')} (${directoryProgress.current}/${directoryProgress.total})`;
    } else if (currentFileName) {
      title = `${currentFileNumber} / ${totalFilesCount} ${fileText} • ${currentFileName}`;
    } else {
      title = `${currentFileNumber} / ${totalFilesCount} ${fileText} • ${formatBytes(totalBytesCount)}`;
    }

    const speedEtaLine = `${formatTransferSpeed(totalBytesPerSecond)} • ${formatEstimatedTimeRemaining(etaSeconds)}`;
    const bytesLine = `${formatBytes(totalLoadedBytes)} / ${formatBytes(totalBytesCount)}`;
    const description = `${speedEtaLine}\n${bytesLine}`;

    const toastData = {
      percent: overallPercentage,
      title,
      id: COMBINED_UPLOAD_TOAST_ID,
      description,
      failed: failedFiles,
      processed: totalLoadedBytes,
      total: totalBytesCount,
    };

    const toastDuration = isDone ? DONE_TOAST_DURATION_MS : LIVE_TOAST_DURATION_MS;

    toast(
      <div className="whitespace-pre-wrap normal-case tabular-nums">
        <ProgressBox data={toastData} />
      </div>,
      { id: toastData.id, duration: toastDuration },
    );
  }, [
    progressById,
    totalFilesCount,
    totalBytesCount,
    currentPath,
    fetchFiles,
    t,
    getPercent,
    getLoadedBytes,
    getTotalBytes,
  ]);
};

export default useUploadProgressToast;
