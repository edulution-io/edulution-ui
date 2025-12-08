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

import UploadProgressEntry from '@libs/filesharing/types/uploadProgressEntry';
import UploadStatistics from '@libs/filesharing/types/uploadStatistics';
import UploadStatus from '@libs/filesharing/types/uploadStatus';
import unifyProgressFields from '@libs/filesharing/utils/unifyProgressFields';

const aggregateUploadProgress = (
  entries: [string, UploadProgressEntry][],
  totalBytesCount: number,
): UploadStatistics => {
  const aggregation = entries.reduce(
    (acc, [fileId, { share, progress, fileName }]) => {
      const { status } = progress;
      const { percent, loadedBytes, totalBytes, bytesPerSecond } = unifyProgressFields(progress);

      if (!acc.webdavShare && share) {
        acc.webdavShare = share;
      }

      if (fileId === 'directory-creation') {
        acc.isCreatingDirectories = true;
        acc.directoryProgress = {
          current: progress.loaded ?? 0,
          total: progress.total ?? 0,
        };
        return acc;
      }

      if (status === UploadStatus.uploading) {
        acc.currentFileName = fileName;
      }

      if (status === UploadStatus.done || percent >= 100) {
        acc.completedFiles += 1;
        acc.totalLoadedBytes += totalBytes;
      } else if (status === UploadStatus.error) {
        acc.failedFiles += 1;
      } else if (status === UploadStatus.uploading) {
        acc.hasActiveUploads = true;
        acc.totalLoadedBytes += loadedBytes;
        acc.totalBytesPerSecond += bytesPerSecond;
      }

      return acc;
    },
    {
      completedFiles: 0,
      failedFiles: 0,
      totalLoadedBytes: 0,
      totalBytesPerSecond: 0,
      hasActiveUploads: false,
      webdavShare: undefined as string | undefined,
      currentFileName: undefined as string | undefined,
      isCreatingDirectories: false,
      directoryProgress: { current: 0, total: 0 },
      overallPercentage: 0,
    },
  );

  aggregation.overallPercentage =
    totalBytesCount > 0 ? Math.round((aggregation.totalLoadedBytes / totalBytesCount) * 100) : 0;

  return aggregation;
};

export default aggregateUploadProgress;
