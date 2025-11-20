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

import UploadStatistics from '@libs/filesharing/types/uploadStatistics';
import ProgressToastContent from '@libs/filesharing/types/progressToastContent';

const formatProgressToastMessage = (
  statistics: UploadStatistics,
  totalFilesCount: number,
  totalBytesCount: number,
  formatters: {
    fileText: string;
    directoryStructureText: string;
    formatBytes: (bytes: number) => string;
    formatTransferSpeed: (bytesPerSecond: number) => string;
    formatEstimatedTimeRemaining: (seconds?: number) => string;
  },
): ProgressToastContent => {
  const {
    overallPercentage,
    completedFiles,
    failedFiles,
    hasActiveUploads,
    totalLoadedBytes,
    totalBytesPerSecond,
    currentFileName,
    isCreatingDirectories,
    directoryProgress,
  } = statistics;

  const isDone = overallPercentage === 100;
  const hasErrors = failedFiles > 0;
  const currentFileNumber = completedFiles + (hasActiveUploads ? 1 : 0);

  let title: string;
  if (isCreatingDirectories) {
    title = `${formatters.directoryStructureText} (${directoryProgress.current}/${directoryProgress.total})`;
  } else if (currentFileName) {
    title = `${currentFileNumber} / ${totalFilesCount} ${formatters.fileText} • ${currentFileName}`;
  } else {
    title = `${currentFileNumber} / ${totalFilesCount} ${formatters.fileText} • ${formatters.formatBytes(totalBytesCount)}`;
  }

  const etaSeconds = totalBytesPerSecond > 0 ? (totalBytesCount - totalLoadedBytes) / totalBytesPerSecond : undefined;

  const speedEtaLine = `${formatters.formatTransferSpeed(totalBytesPerSecond)} • ${formatters.formatEstimatedTimeRemaining(etaSeconds)}`;
  const bytesLine = `${formatters.formatBytes(totalLoadedBytes)} / ${formatters.formatBytes(totalBytesCount)}`;
  const description = `${speedEtaLine}\n${bytesLine}`;

  return { title, description, isDone, hasErrors };
};

export default formatProgressToastMessage;
