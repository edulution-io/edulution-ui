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

import SSE_MESSAGE_TYPE from '@libs/common/constants/sseMessageType';
import { useEffect, useState } from 'react';
import FilesharingProgressDto from '@libs/filesharing/types/filesharingProgressDto';

const useFileOperationProgress = (
  isActive: boolean,
  eventSource: EventSource | null,
  setFileOperationProgress: (d: FilesharingProgressDto | null) => void,
) => {
  const [progress, setProgress] = useState<FilesharingProgressDto | null>(null);

  useEffect(() => {
    if (!isActive || !eventSource) return () => {};

    const controller = new AbortController();
    const { signal } = controller;

    const handler = (evt: MessageEvent<string>) => {
      try {
        const data = JSON.parse(evt.data) as FilesharingProgressDto;
        setProgress(data);
        setFileOperationProgress(data);

        if (data.percent === 100 && (!data.failedPaths || data.failedPaths.length === 0)) {
          setTimeout(() => setFileOperationProgress(null), 5000);
        }
      } catch (err) {
        console.error('Invalid JSON in SSE event', err);
      }
    };

    [
      SSE_MESSAGE_TYPE.FILESHARING_DELETE_FILES,
      SSE_MESSAGE_TYPE.FILESHARING_MOVE_OR_RENAME_FILES,
      SSE_MESSAGE_TYPE.FILESHARING_COPY_FILES,
      SSE_MESSAGE_TYPE.FILESHARING_SHARE_FILES,
      SSE_MESSAGE_TYPE.FILESHARING_COLLECT_FILES,
    ].forEach((type) => eventSource.addEventListener(type, handler, { signal }));

    return () => controller.abort();
  }, [isActive, eventSource]);

  return progress;
};

export default useFileOperationProgress;
