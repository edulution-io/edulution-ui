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

interface CreateProgressHandlerProps {
  fileName: string;
  fileSize: number;
  setProgress: (fp: FileProgress) => void;
}

const createProgressHandler = ({ fileSize, setProgress }: CreateProgressHandlerProps) => {
  const startTs = Date.now();
  let lastLoaded = 0;
  let lastTs = startTs;
  let smoothedBps = 0;

  const markStart = () =>
    setProgress({
      status: UploadStatus.uploading,
      loadedByteCount: 0,
      totalByteCount: fileSize,
      percentageComplete: 0,
      bytesPerSecond: 0,
      estimatedSecondsRemaining: undefined,
      startedAtTimestampMs: startTs,
      lastUpdateTimestampMs: startTs,
    });

  const onUploadProgress = (event: AxiosProgressEvent) => {
    const now = Date.now();
    const total = event.total ?? fileSize;
    const loaded = event.loaded ?? 0;

    const elapsedSec = Math.max(1e-3, (now - lastTs) / 1000);
    const delta = Math.max(0, loaded - lastLoaded);
    const instBps = delta > 0 ? delta / elapsedSec : 0;
    smoothedBps = smoothedBps === 0 ? instBps : 0.3 * instBps + 0.7 * smoothedBps;

    const remaining = Math.max(0, total - loaded);
    const eta = smoothedBps > 0 ? remaining / smoothedBps : undefined;
    const pct = total > 0 ? Math.min(99, Math.floor((loaded / total) * 100)) : 0;

    setProgress({
      status: UploadStatus.uploading,
      loadedByteCount: loaded,
      totalByteCount: total,
      percentageComplete: pct,
      bytesPerSecond: smoothedBps,
      estimatedSecondsRemaining: eta,
      startedAtTimestampMs: startTs,
      lastUpdateTimestampMs: now,
    });

    lastLoaded = loaded;
    lastTs = now;
  };

  const markDone = () =>
    setProgress({
      status: UploadStatus.done,
      loadedByteCount: fileSize,
      totalByteCount: fileSize,
      percentageComplete: 100,
      bytesPerSecond: 0,
      estimatedSecondsRemaining: 0,
      startedAtTimestampMs: startTs,
      lastUpdateTimestampMs: Date.now(),
    });

  const markError = () =>
    setProgress({
      status: UploadStatus.error,
      loadedByteCount: lastLoaded,
      totalByteCount: fileSize,
      percentageComplete: fileSize > 0 ? Math.floor((lastLoaded / fileSize) * 100) : 0,
      bytesPerSecond: 0,
      estimatedSecondsRemaining: undefined,
      startedAtTimestampMs: startTs,
      lastUpdateTimestampMs: Date.now(),
    });

  return { markStart, onUploadProgress, markDone, markError };
};

export default createProgressHandler;
