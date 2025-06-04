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

import { zip as zipArchive } from 'fflate';
import { RequestResponseContentType } from '@libs/common/types/http-methods';
import WorkerOutputMessage from '@/worker/workerOutputMessage';
import WorkerProgressMessage from '@/worker/workerProgressMessage';
import WorkerInputMessage from '@/worker/workerInputMessage';

export {};

const workerContext = globalThis as unknown as DedicatedWorkerGlobalScope;

workerContext.onmessage = async (event: MessageEvent<WorkerInputMessage>): Promise<void> => {
  const { files, root } = event.data;

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

    workerContext.postMessage({ blob: zipBlob, root } as WorkerOutputMessage);
  });
};
