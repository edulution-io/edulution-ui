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
import NAME_OF_TEMPORARY_FOLDER from '@libs/common/constants/nameOfTemporaryFolder';
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

  getTemporaryAttachmentUrl = (userId: string, fileName: string): string => `${this.domain}/${NAME_OF_TEMPORARY_FOLDER}/${userId}/${fileName}`;

  getPersistentAttachmentUrl = (pathWithIds: string, fileName: string): string =>
    `${this.domain}/${pathWithIds}/${fileName}`;

  getTemporaryDirectory = (userId: string): string => `${this.filePath}/${NAME_OF_TEMPORARY_FOLDER}/${userId}`;

  getTemporaryAttachmentPath = (userId: string, fileName: string): string =>
    `${this.filePath}/${NAME_OF_TEMPORARY_FOLDER}/${userId}/${fileName}`;

  createPersistentDirectory = (pathWithIds: string): Promise<void> =>
    this.fileSystemService.ensureDirectoryExists(this.getPersistentDirectory(pathWithIds));

  getPersistentDirectory = (pathWithIds: string): string => `${this.filePath}/${pathWithIds}`;

  getPersistentAttachmentPath = (pathWithIds: string, fileName: string): string =>
    `${this.filePath}/${pathWithIds}/${fileName}`;

  getFileNamesFromTEMP = (userId: string) => {
    const tempFolder = this.getTemporaryDirectory(userId);
    return this.fileSystemService.getFileNamesFromDirectory(tempFolder);
  };

  async clearTEMP(userId: string) {
    const destination = this.getTemporaryDirectory(userId);
    await this.fileSystemService.deleteDirectory(destination);
  }

  async serveTemporaryAttachment(userId: string, fileName: string, res: Response) {
    const filePath = this.getTemporaryAttachmentPath(userId, fileName);
    const fileStream = await this.fileSystemService.createReadStream(filePath);
    fileStream.pipe(res);
    return res;
  }

  async servePersistentAttachment(pathWithIds: string, fileName: string, res: Response) {
    const filePath = this.getPersistentAttachmentPath(pathWithIds, fileName);
    const fileStream = await this.fileSystemService.createReadStream(filePath);
    fileStream.pipe(res);
    return res;
  }

  async moveFileToPermanent(userId: string, pathWithIds: string, fileName: string) {
    const temporaryAttachmentPath = this.getTemporaryAttachmentPath(userId, fileName);
    const persistentAttachmentPath = this.getPersistentAttachmentPath(pathWithIds, fileName);
    return FilesystemService.moveFile(temporaryAttachmentPath, persistentAttachmentPath);
  }

  async moveTempFileIntoPermanentDirectory(userId: string, pathWithIds: string, fileName: string) {
    const permanentDirectory = this.getPersistentDirectory(pathWithIds);
    await this.fileSystemService.ensureDirectoryExists(permanentDirectory);
    return this.moveFileToPermanent(userId, pathWithIds, fileName);
  }

  async moveTempFilesIntoPermanentDirectory(userId: string, pathWithIds: string, fileNames: string[]) {
    const permanentDirectory = this.getPersistentDirectory(pathWithIds);
    await this.fileSystemService.ensureDirectoryExists(permanentDirectory);
    const movingPromises = fileNames.map((fileName) => this.moveFileToPermanent(userId, pathWithIds, fileName));
    return Promise.all(movingPromises);
  }
}

export default AttachmentService;
