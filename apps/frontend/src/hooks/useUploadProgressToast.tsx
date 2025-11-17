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
import ProgressBox from '@/components/ui/ProgressBox';
import useFileSharingStore from '@/pages/FileSharing/useFileSharingStore';
import useHandleUploadFileStore from '@/pages/FileSharing/Dialog/upload/useHandleUploadFileStore';
import formatTransferSpeed from '@libs/filesharing/utils/formatTransferSpeed';
import formatEstimatedTimeRemaining from '@libs/filesharing/utils/formatEstimatedTimeRemaining';
import { useTranslation } from 'react-i18next';
import { formatBytes } from '@/pages/FileSharing/utilities/filesharingUtilities';
import {
  DONE_TOAST_DURATION_MS,
  ERROR_TOAST_DURATION_MS,
  LIVE_TOAST_DURATION_MS,
} from '@libs/ui/constants/showToasterDuration';
import UploadProgressEntry from '@libs/filesharing/types/uploadProgressEntry';
import aggregateUploadProgress from '@libs/filesharing/utils/aggregateUploadProgress';
import formatProgressToastMessage from '@libs/filesharing/utils/formatProgressToastMessage';

const COMBINED_UPLOAD_TOAST_ID = 'upload:combined';

const useUploadProgressToast = () => {
  const { progressById, totalFilesCount, totalBytesCount, clearProgress } = useHandleUploadFileStore();
  const { currentPath, fetchFiles } = useFileSharingStore();
  const { t } = useTranslation();

  const hasRefreshedAfterComplete = useRef<boolean>(false);
  const lastShownPercentage = useRef<number>(-1);

  useEffect(() => {
    const entries = Object.entries(progressById) as [string, UploadProgressEntry][];

    if (entries.length === 0) {
      toast.dismiss(COMBINED_UPLOAD_TOAST_ID);
      hasRefreshedAfterComplete.current = false;
      lastShownPercentage.current = -1;
      return;
    }

    const statistics = aggregateUploadProgress(entries, totalBytesCount);
    const { overallPercentage, failedFiles, hasActiveUploads, totalLoadedBytes, webdavShare } = statistics;

    if (overallPercentage === lastShownPercentage.current && !statistics.isCreatingDirectories) {
      return;
    }
    lastShownPercentage.current = overallPercentage;

    const isDone = overallPercentage === 100;
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
      const failedFileText = failedFiles === 1 ? t('filesharingUpload.file') : t('filesharingUpload.files');
      toast.error(
        t('filesharingUpload.errors.fileUploadFailed', {
          filename: `${failedFiles} ${failedFileText}`,
        }),
        {
          duration: ERROR_TOAST_DURATION_MS,
        },
      );
      return;
    }

    const fileText = totalFilesCount === 1 ? t('filesharingUpload.file') : t('filesharingUpload.files');
    const { title, description } = formatProgressToastMessage(statistics, totalFilesCount, totalBytesCount, {
      fileText,
      directoryStructureText: t('filesharingUpload.creatingDirectoryStructure'),
      formatBytes,
      formatTransferSpeed,
      formatEstimatedTimeRemaining,
    });

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
  }, [progressById, totalFilesCount, totalBytesCount, currentPath, fetchFiles, t, clearProgress]);
};

export default useUploadProgressToast;
