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

import { zip as zipArchive } from 'fflate';
import { RequestResponseContentType } from '@libs/common/types/http-methods';
import WorkerOutputMessage from '@/worker/workerOutputMessage';
import WorkerProgressMessage from '@/worker/workerProgressMessage';
import WorkerInputMessage from '@/worker/workerInputMessage';

export {};

const workerContext = globalThis as unknown as DedicatedWorkerGlobalScope;

workerContext.onmessage = async (event: MessageEvent<WorkerInputMessage>): Promise<void> => {
  const { files, root } = event.data;
  const fileCount = files.length;
  const zipEntries: Record<string, Uint8Array> = {};
  const directoryPlaceholderSet = new Set<string>();

  const totalBytesToProcess = files.reduce((aggregate, currentFile) => aggregate + currentFile.size, 0);
  let processedBytes = 0;

  await Promise.all(
    files
      .filter((file) => !file.name.startsWith('.'))
      .map(async (file) => {
        const unixStylePath = file.webkitRelativePath.replaceAll('\\', '/');

        const relativePath = unixStylePath.split('/').slice(1).join('/');

        const pathParts = relativePath.split('/').slice(0, -1);
        let cumulativeDirectoryPath = '';
        pathParts.forEach((segment) => {
          cumulativeDirectoryPath += `${segment}/`;
          directoryPlaceholderSet.add(cumulativeDirectoryPath);
        });

        zipEntries[relativePath] = new Uint8Array(await file.arrayBuffer());

        processedBytes += file.size;
        const progressPercentage = Math.round((processedBytes / totalBytesToProcess) * 90);
        workerContext.postMessage({
          progress: progressPercentage,
        } as WorkerProgressMessage);
      }),
  );

  directoryPlaceholderSet.forEach((directoryPath) => {
    zipEntries[directoryPath] = zipEntries[directoryPath] ?? new Uint8Array(0);
  });

  zipArchive(zipEntries, { level: 6 }, (error, zippedData) => {
    if (error) {
      workerContext.postMessage({ error: error.message });
      return;
    }

    workerContext.postMessage({ progress: 100 } as WorkerProgressMessage);

    const zipBlob = new Blob([zippedData], {
      type: RequestResponseContentType.APPLICATION_ZIP,
    });

    workerContext.postMessage({ blob: zipBlob, root, fileCount } as WorkerOutputMessage);
  });
};
