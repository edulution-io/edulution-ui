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

import { Response } from 'express';
import { Injectable } from '@nestjs/common';
import TEMPORARY_ATTACHMENT_DIRECTORY_NAME from '@libs/common/constants/temporaryAttachmentDirectoryName';
import { join } from 'path';
import FilesystemService from '../../filesystem/filesystem.service';

@Injectable()
class AttachmentService {
  domain: string;

  filePath: string;

  constructor(
    domain: string,
    filePath: string,
    private fileSystemService: FilesystemService,
  ) {
    this.domain = domain;
    this.filePath = filePath;
  }

  getTemporaryAttachmentUrl = (userId: string, fileName: string): string =>
    `${this.domain}/${TEMPORARY_ATTACHMENT_DIRECTORY_NAME}/${userId}/${fileName}`;

  getPersistentAttachmentUrl = (pathWithIds: string, fileName: string): string =>
    `${this.domain}/${pathWithIds}/${fileName}`;

  getAllFilenamesInTemporaryDirectory = (userId: string) => {
    const temporaryDirectoryPath = `${this.filePath}/${TEMPORARY_ATTACHMENT_DIRECTORY_NAME}/${userId}`;
    return this.fileSystemService.getAllFilenamesInDirectory(temporaryDirectoryPath);
  };

  async deleteTemporaryDirectory(userId: string) {
    const destination = `${this.filePath}/${TEMPORARY_ATTACHMENT_DIRECTORY_NAME}/${userId}`;
    const exists = await FilesystemService.checkIfFileExist(destination);
    if (!exists) {
      return;
    }
    await this.fileSystemService.deleteDirectory(destination);
  }

  async deletePermanentDirectories(pathsWithIds: string[]): Promise<void> {
    const imageDirectories = pathsWithIds.map((pathsWithId) => join(this.filePath, pathsWithId));
    await FilesystemService.deleteDirectories(imageDirectories);
  }

  async serveTemporaryAttachment(userId: string, fileName: string, res: Response) {
    const filePath = `${this.filePath}/${TEMPORARY_ATTACHMENT_DIRECTORY_NAME}/${userId}/${fileName}`;
    const fileStream = await this.fileSystemService.createReadStream(filePath);
    fileStream.pipe(res);
    return res;
  }

  async servePersistentAttachment(pathWithIds: string, fileName: string, res: Response) {
    const filePath = `${this.filePath}/${pathWithIds}/${fileName}`;
    const fileStream = await this.fileSystemService.createReadStream(filePath);
    fileStream.pipe(res);
    return res;
  }

  async moveTempFileIntoPermanentDirectory(userId: string, pathWithIds: string, fileName: string) {
    const temporaryAttachmentPath = `${this.filePath}/${TEMPORARY_ATTACHMENT_DIRECTORY_NAME}/${userId}/${fileName}`;

    const permanentDirectory = `${this.filePath}/${pathWithIds}`;
    await this.fileSystemService.ensureDirectoryExists(permanentDirectory);
    const persistentAttachmentPath = `${permanentDirectory}/${fileName}`;

    return FilesystemService.moveFile(temporaryAttachmentPath, persistentAttachmentPath);
  }

  async moveTempFilesIntoPermanentDirectory(userId: string, pathWithIds: string, fileNames: string[]) {
    const movingPromises = fileNames.map((fileName) =>
      this.moveTempFileIntoPermanentDirectory(userId, pathWithIds, fileName),
    );
    return Promise.all(movingPromises);
  }
}

export default AttachmentService;
