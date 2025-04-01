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
import { join } from 'path';
import SURVEYS_IMAGES_PATH from '@libs/survey/constants/surveysImagesPaths';
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
    `${this.domain}/${NAME_OF_TEMPORARY_FOLDER}/${userId}/${fileName}`;

  getPersistentAttachmentUrl = (pathWithIds: string, fileName: string): string =>
    `${this.domain}/${pathWithIds}/${fileName}`;

  getFileNamesFromTEMP = (userId: string) => {
    const tempFolder = `${this.filePath}/${NAME_OF_TEMPORARY_FOLDER}/${userId}`;
    return this.fileSystemService.getFileNamesFromDirectory(tempFolder);
  };

  async clearTEMP(userId: string) {
    const destination = `${this.filePath}/${NAME_OF_TEMPORARY_FOLDER}/${userId}`;
    await this.fileSystemService.deleteDirectory(destination);
  }

  async clearPermanentDirectories(surveyIds: string[]): Promise<void> {
    const imageDirectories = surveyIds.map((surveyId) => join(SURVEYS_IMAGES_PATH, surveyId));
    await this.fileSystemService.deleteDirectories(imageDirectories);
  }

  async serveTemporaryAttachment(userId: string, fileName: string, res: Response) {
    const filePath = `${this.filePath}/${NAME_OF_TEMPORARY_FOLDER}/${userId}/${fileName}`;
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
    const temporaryAttachmentPath = `${this.filePath}/${NAME_OF_TEMPORARY_FOLDER}/${userId}/${fileName}`;

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
