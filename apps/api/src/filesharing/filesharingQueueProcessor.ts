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

import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import FILE_PATHS from '@libs/filesharing/constants/file-paths';
import ContentType from '@libs/filesharing/types/contentType';
import FilesharingService from './filesharing.service';

@Processor('genericQueue')
class FilesharingQueueProcessor {
  constructor(private readonly fileSharingService: FilesharingService) {}

  @Process({ name: 'duplicate-file', concurrency: 1 })
  public async handleDuplicateFile(
    job: Job<{
      username: string;
      originFilePath: string;
      destinationPath: string;
    }>,
  ) {
    const { username, originFilePath, destinationPath } = job.data;
    const client = await this.fileSharingService.getClient(username);
    const pathUpToTransferFolder = FilesharingService.getPathUntilFolder(destinationPath, FILE_PATHS.TRANSFER);
    const pathUpToTeacherFolder = FilesharingService.getPathUntilFolder(destinationPath, username);

    const userFolderExists = await this.fileSharingService.checkIfFileOrFolderExists(
      username,
      pathUpToTransferFolder,
      username,
      ContentType.DIRECTORY,
    );

    if (!userFolderExists) {
      await this.fileSharingService.createFolder(username, pathUpToTransferFolder, username);
    }

    if (!userFolderExists) {
      const collectFolderExists = await this.fileSharingService.checkIfFileOrFolderExists(
        username,
        pathUpToTeacherFolder,
        FILE_PATHS.COLLECT,
        ContentType.DIRECTORY,
      );

      if (!collectFolderExists) {
        await this.fileSharingService.createFolder(username, pathUpToTeacherFolder, FILE_PATHS.COLLECT);
      }
    }
    await FilesharingService.copyFileViaWebDAV(client, originFilePath, destinationPath);
  }
}

export default FilesharingQueueProcessor;
