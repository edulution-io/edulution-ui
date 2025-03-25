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

import { join } from 'path';
import { Response } from 'express';
import { Injectable, Logger } from '@nestjs/common';
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

  checkExistence = async (path: string): Promise<boolean> => FilesystemService.checkIfFileExist(path);

  getTemporaryAttachmentUrl = (userId: string, fileName: string): string => `${this.domain}/TEMP/${userId}/${fileName}`;

  getPersistentAttachmentUrl = (pathWithIds: string, fileName: string): string =>
    `${this.domain}/${pathWithIds}/${fileName}`;

  getTemporaryDirectory = (userId: string): string => `${this.filePath}/TEMP/${userId}`;

  getTemporaryAttachmentPath = (userId: string, fileName: string): string =>
    `${this.filePath}/TEMP/${userId}/${fileName}`;

  getTemporaryAttachmentAbsolutePath = (userId: string, fileName: string): string =>
    join(process.cwd(), this.filePath, 'TEMP', userId, fileName);

  getPersistentDirectory = (pathWithIds: string): string => `${this.filePath}/${pathWithIds}`;

  getPersistentDirectoryAbsolutePath = (pathWithIds: string): string => join(process.cwd(), this.filePath, pathWithIds);

  createPersistentDirectory = (pathWithIds: string): Promise<void> => this.fileSystemService.ensureDirectoryExists(this.getPersistentDirectoryAbsolutePath(pathWithIds));

  getPersistentAttachmentPath = (pathWithIds: string, fileName: string): string =>
    `${this.filePath}/${pathWithIds}/${fileName}`;

  getPersistentAttachmentAbsolutePath = (pathWithIds: string, fileName: string): string =>
    join(process.cwd(), this.filePath, pathWithIds, fileName);

  async clearTEMP(userId: string) {
    const destination = this.getTemporaryDirectory(userId);
    await this.fileSystemService.deleteDirectory(destination);
  }

  async clearPersistent(pathWithIds: string) {
    const destination = this.getPersistentDirectory(pathWithIds);
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

  getFileNamesFromTEMP = (userId: string) => {
    const tempFolder = this.getTemporaryDirectory(userId);
    return this.fileSystemService.getFileNamesFromDirectory(tempFolder);
  };

  async moveFileToPermanent(fileName: string, userId: string, pathWithIds: string) {
    // const permanentDirectory = this.getPersistentDirectory(pathWithIds);
    // await this.fileSystemService.ensureDirectoryExists(permanentDirectory)

    Logger.log(`moveFileToPermanent`);

    const temporaryAttachmentPath = this.getTemporaryAttachmentPath(userId, fileName);
    // const temporaryAttachmentPath = this.getTemporaryAttachmentAbsolutePath(userId, fileName);
    const persistentAttachmentPath = this.getPersistentAttachmentPath(pathWithIds, fileName);
    // const persistentAttachmentPath = this.getPersistentAttachmentAbsolutePath(pathWithIds, fileName);

    Logger.log(`temporaryAttachmentPath ${temporaryAttachmentPath}`);
    Logger.log(`persistentAttachmentPath ${persistentAttachmentPath}`);

    return FilesystemService.renameFile(temporaryAttachmentPath, persistentAttachmentPath);
  }

  async moveTempFileIntoPermanentDirectory(fileName: string, userId: string, pathWithIds: string) {

    Logger.log(`moveTempFileIntoPermanentDirectory`);

    const permanentDirectory = this.getPersistentDirectory(pathWithIds);
    await this.fileSystemService.ensureDirectoryExists(permanentDirectory)

    Logger.log(`PERMANENT DIRECTORY DOES EXIST`);

    return this.moveFileToPermanent(fileName, userId, pathWithIds);
  }

  async moveTempFilesIntoPermanentDirectory(fileNames: string[], userId: string, pathWithIds: string) {
    const permanentDirectory = this.getPersistentDirectory(pathWithIds);
    await this.fileSystemService.ensureDirectoryExists(permanentDirectory)
    const movingPromises = fileNames.map((fileName) => this.moveFileToPermanent(fileName, userId, pathWithIds));
    return Promise.all(movingPromises);
  }
}

export default AttachmentService;
