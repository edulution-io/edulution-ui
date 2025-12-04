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

import SSE_MESSAGE_TYPE from '@libs/common/constants/sseMessageType';
import { useEffect, useState } from 'react';
import FilesharingProgressDto from '@libs/filesharing/types/filesharingProgressDto';
import useIsAppActive from '@/hooks/useIsAppActive';
import useSseStore from '@/store/useSseStore';
import APPS from '@libs/appconfig/constants/apps';
import useFileSharingStore from '../useFileSharingStore';

const useFileOperationProgress = () => {
  const [progress, setProgress] = useState<FilesharingProgressDto | null>(null);
  const { setFileOperationProgress } = useFileSharingStore();
  const isClassRoomManagementActive = useIsAppActive(APPS.CLASS_MANAGEMENT);
  const { eventSource } = useSseStore();
  const isFileSharingActive = useIsAppActive(APPS.FILE_SHARING);

  const isActive = isFileSharingActive || isClassRoomManagementActive;

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
      SSE_MESSAGE_TYPE.FILESHARING_CREATE_FOLDER,
      SSE_MESSAGE_TYPE.FILESHARING_FILE_UPLOAD,
    ].forEach((type) => eventSource.addEventListener(type, handler, { signal }));

    return () => controller.abort();
  }, [isActive, eventSource]);

  return progress;
};

export default useFileOperationProgress;
