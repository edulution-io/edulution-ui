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

import { existsSync, mkdirSync, readdirSync, renameSync } from 'fs';
import { Response } from 'express';
import { Injectable } from '@nestjs/common';
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

  getTemporaryAttachmentUrl = (userId: string, fileName: string): string => `${this.domain}/TEMP/${userId}/${fileName}`;

  getPersistentAttachmentUrl = (pathWithIds: string, fileName: string): string =>
    `${this.domain}/${pathWithIds}/${fileName}`;

  getTemporaryDirectory = (userId: string): string => `${this.filePath}/TEMP/${userId}`;

  getTemporaryAttachmentPath = (userId: string, fileName: string): string =>
    `${this.filePath}/TEMP/${userId}/${fileName}`;

  getPersistentDirectory = (pathWithIds: string): string => `${this.filePath}/${pathWithIds}`;

  getPersistentAttachmentPath = (pathWithIds: string, fileName: string): string =>
    `${this.filePath}/${pathWithIds}/${fileName}`;

  async clearTEMP(userId: string) {
    const destination = this.getTemporaryDirectory(userId);
    await this.fileSystemService.deleteDirectory(destination);
  }

  async clearPersistent(pathWithIds: string) {
    const destination = this.getPersistentDirectory(pathWithIds);
    await this.fileSystemService.deleteDirectory(destination);
  }

  async servePersistentAttachment(pathWithIds: string, fileName: string, res: Response) {
    const filePath = this.getPersistentAttachmentPath(pathWithIds, fileName);
    const fileStream = await this.fileSystemService.createReadStream(filePath);
    fileStream.pipe(res);
    return res;
  }

  async serveTemporaryAttachment(userId: string, fileName: string, res: Response) {
    const filePath = this.getTemporaryAttachmentPath(userId, fileName);
    const fileStream = await this.fileSystemService.createReadStream(filePath);
    fileStream.pipe(res);
    return res;
  }

  getFileNamesFromTEMP = (userId: string) => {
    const tempFolder = this.getTemporaryDirectory(userId);
    if (!existsSync(tempFolder)) {
      return [];
    }
    return readdirSync(tempFolder);
  };

  moveFileToPermanent(fileName: string, userId: string, pathWithIds: string) {
    const temporaryAttachmentPath = this.getTemporaryAttachmentPath(userId, fileName);
    const persistentAttachmentPath = this.getPersistentAttachmentPath(pathWithIds, fileName);
    renameSync(temporaryAttachmentPath, persistentAttachmentPath);
  }

  moveTempFileIntoPermanentDirectory(fileName: string, userId: string, pathWithIds: string) {
    const permanentDirectory = this.getPersistentDirectory(pathWithIds);
    if (!existsSync(permanentDirectory)) {
      mkdirSync(permanentDirectory, { recursive: true });
    }
    this.moveFileToPermanent(fileName, userId, pathWithIds);
  }

  moveTempFilesIntoPermanentDirectory(fileNames: string[], userId: string, pathWithIds: string) {
    const permanentDirectory = this.getPersistentDirectory(pathWithIds);
    if (!existsSync(permanentDirectory)) {
      mkdirSync(permanentDirectory, { recursive: true });
    }
    fileNames.forEach((fileName) => this.moveFileToPermanent(fileName, userId, pathWithIds));
  }
}

export default AttachmentService;
