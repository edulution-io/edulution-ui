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

import type { AxiosProgressEvent } from 'axios';
import UploadStatus from '@libs/filesharing/types/uploadStatus';
import type FileProgress from '@libs/filesharing/types/fileProgress';

type CreateProgressHandlerProps = {
  fileSize: number;
  setProgress: (next: FileProgress) => void;
  smoothingFactor?: number;
  clampToNinetyNine?: boolean;
};

const createProgressHandler = ({
  fileSize,
  setProgress,
  smoothingFactor = 0.7,
  clampToNinetyNine = true,
}: CreateProgressHandlerProps) => {
  const startTimestampMilliseconds = Date.now();
  let lastLoadedByteCount = 0;
  let lastUpdateTimestampMilliseconds = startTimestampMilliseconds;
  let smoothedBytesPerSecond = 0;

  const markStart = () =>
    setProgress({
      status: UploadStatus.uploading,
      loadedByteCount: 0,
      totalByteCount: fileSize,
      percentageComplete: 0,
      bytesPerSecond: 0,
      estimatedSecondsRemaining: undefined,
      startedAtTimestampMs: startTimestampMilliseconds,
      lastUpdateTimestampMs: startTimestampMilliseconds,
    });

  const onUploadProgress = (event: AxiosProgressEvent) => {
    const currentTimestampMilliseconds = Date.now();

    const totalByteCount = event.total ?? fileSize;
    const loadedByteCount = event.loaded ?? 0;

    const elapsedSeconds = Math.max(0.001, (currentTimestampMilliseconds - lastUpdateTimestampMilliseconds) / 1000);

    const transferredBytesSinceLastUpdate = Math.max(0, loadedByteCount - lastLoadedByteCount);

    const instantaneousBytesPerSecond =
      transferredBytesSinceLastUpdate > 0 ? transferredBytesSinceLastUpdate / elapsedSeconds : 0;

    smoothedBytesPerSecond =
      smoothedBytesPerSecond === 0
        ? instantaneousBytesPerSecond
        : (1 - smoothingFactor) * instantaneousBytesPerSecond + smoothingFactor * smoothedBytesPerSecond;

    const remainingBytes = Math.max(0, totalByteCount - loadedByteCount);
    const estimatedSecondsRemaining = smoothedBytesPerSecond > 0 ? remainingBytes / smoothedBytesPerSecond : undefined;

    const rawPercentage = totalByteCount > 0 ? Math.floor((loadedByteCount / totalByteCount) * 100) : 0;

    const percentageComplete = clampToNinetyNine ? Math.min(99, rawPercentage) : rawPercentage;

    setProgress({
      status: UploadStatus.uploading,
      loadedByteCount,
      totalByteCount,
      percentageComplete,
      bytesPerSecond: smoothedBytesPerSecond,
      estimatedSecondsRemaining,
      startedAtTimestampMs: startTimestampMilliseconds,
      lastUpdateTimestampMs: currentTimestampMilliseconds,
    });

    lastLoadedByteCount = loadedByteCount;
    lastUpdateTimestampMilliseconds = currentTimestampMilliseconds;
  };

  const markDone = () =>
    setProgress({
      status: UploadStatus.done,
      loadedByteCount: fileSize,
      totalByteCount: fileSize,
      percentageComplete: 100,
      bytesPerSecond: 0,
      estimatedSecondsRemaining: 0,
      startedAtTimestampMs: startTimestampMilliseconds,
      lastUpdateTimestampMs: Date.now(),
    });

  const markError = () =>
    setProgress({
      status: UploadStatus.error,
      loadedByteCount: lastLoadedByteCount,
      totalByteCount: fileSize,
      percentageComplete: fileSize > 0 ? Math.floor((lastLoadedByteCount / fileSize) * 100) : 0,
      bytesPerSecond: 0,
      estimatedSecondsRemaining: undefined,
      startedAtTimestampMs: startTimestampMilliseconds,
      lastUpdateTimestampMs: Date.now(),
    });

  return { markStart, onUploadProgress, markDone, markError };
};

export default createProgressHandler;
