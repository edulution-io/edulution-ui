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
