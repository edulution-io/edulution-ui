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
import { HttpStatus, Injectable, OnModuleInit } from '@nestjs/common';
import CustomHttpException from 'apps/api/src/common/CustomHttpException';
import SURVEY_ANSWERS_ATTACHMENT_PATH from '@libs/survey/constants/surveyAnswersAttachmentPath';
import SURVEY_ANSWERS_TEMPORARY_ATTACHMENT_PATH from '@libs/survey/constants/surveyAnswersTemporaryAttachmentPath';
import CommonErrorMessages from '@libs/common/constants/common-error-messages';
import FilesystemService from '../filesystem/filesystem.service';

@Injectable()
class SurveyAnswerAttachmentsService implements OnModuleInit {
  constructor(private fileSystemService: FilesystemService) {}

  onModuleInit() {
    void this.fileSystemService.ensureDirectoryExists(SURVEY_ANSWERS_ATTACHMENT_PATH);
  }

  async serveFileFromAnswer(
    userName: string,
    surveyId: string,
    questionName: string,
    fileName: string,
    res: Response,
  ): Promise<Response> {
    const tempPath = join(SURVEY_ANSWERS_TEMPORARY_ATTACHMENT_PATH, userName, surveyId, questionName, fileName);
    const permanentPath = join(SURVEY_ANSWERS_ATTACHMENT_PATH, surveyId, userName, questionName, fileName);
    const tempFileExists = await FilesystemService.checkIfFileExist(tempPath);
    if (tempFileExists) {
      const fileStream = await this.fileSystemService.createReadStream(tempPath);
      fileStream.pipe(res);
      return res;
    }
    const permanentFileExists = await FilesystemService.checkIfFileExist(permanentPath);
    if (permanentFileExists) {
      const fileStream = await this.fileSystemService.createReadStream(permanentPath);
      fileStream.pipe(res);
      return res;
    }
    throw new CustomHttpException(CommonErrorMessages.FILE_NOT_FOUND, HttpStatus.INTERNAL_SERVER_ERROR);
  }

  async deleteTempQuestionAnswerFiles(userName: string, surveyId: string, questionName: string): Promise<void> {
    const tempFilesPath = join(SURVEY_ANSWERS_TEMPORARY_ATTACHMENT_PATH, userName, surveyId, questionName);
    return this.fileSystemService.deleteDirectory(tempFilesPath);
  }

  static async deleteTempAnswerFiles(
    userName: string,
    surveyId: string,
    questionName: string,
    fileName: string,
  ): Promise<void> {
    const tempFilesPath = join(SURVEY_ANSWERS_TEMPORARY_ATTACHMENT_PATH, userName, surveyId, questionName);
    const tempExistence = await FilesystemService.checkIfFileExist(join(tempFilesPath, fileName));
    if (!tempExistence) {
      return;
    }
    await FilesystemService.deleteFile(tempFilesPath, fileName);
  }

  async moveQuestionAttachmentsToPermanentStorage(
    userName: string,
    surveyId: string,
    questionName: string,
    questionAnswer: (object & { content: string }) | (object & { content: string })[],
  ): Promise<(object & { content: string }) | (object & { content: string })[]> {
    const directory = join(SURVEY_ANSWERS_ATTACHMENT_PATH, surveyId, userName, questionName);
    const tempDirectory = join(SURVEY_ANSWERS_TEMPORARY_ATTACHMENT_PATH, userName, surveyId, questionName);
    const tempFileNames = await this.fileSystemService.getAllFilenamesInDirectory(tempDirectory);
    if (tempFileNames.length === 0) {
      return questionAnswer;
    }

    await this.fileSystemService.ensureDirectoryExists(directory);

    const fileNamesToMove: string[] = [];
    const persistentFiles: string[] = [];
    const permanentFiles = await this.fileSystemService.getAllFilenamesInDirectory(directory);
    if (Array.isArray(questionAnswer)) {
      questionAnswer.forEach((item) => {
        const fileName = item.content?.split('/').pop();
        if (fileName && permanentFiles.includes(fileName)) {
          persistentFiles.push(fileName);
        }
        if (fileName && tempFileNames.includes(fileName)) {
          fileNamesToMove.push(fileName);
        }
      });
    } else {
      const fileName = questionAnswer.content?.split('/').pop();
      if (fileName && tempFileNames.includes(fileName)) {
        fileNamesToMove.push(fileName);
      }
    }
    const movingPromises = fileNamesToMove.map(async (fileName) =>
      FilesystemService.moveFile(join(tempDirectory, fileName), join(directory, fileName)),
    );
    await Promise.all(movingPromises);

    const deletionPromises = permanentFiles.map(
      (fileName): Promise<void> =>
        persistentFiles.includes(fileName) ? Promise.resolve() : FilesystemService.deleteFile(directory, fileName),
    );
    await Promise.all(deletionPromises);

    return questionAnswer;
  }

  async moveAnswerAttachmentsToPermanentStorage(userName: string, surveyId: string, answer: JSON): Promise<JSON> {
    const surveyAnswer = answer as unknown as Record<
      string,
      (object & { content: string }) | (object & { content: string })[]
    >;
    await Promise.all(
      Object.keys(surveyAnswer).map(async (question) => {
        surveyAnswer[question] = await this.moveQuestionAttachmentsToPermanentStorage(
          userName,
          surveyId,
          question,
          surveyAnswer[question],
        );
      }),
    );
    return JSON.parse(JSON.stringify(surveyAnswer)) as JSON;
  }

  async clearUpSurveyAnswersTempFiles(userName: string, surveyId: string): Promise<void> {
    const tempSurveyPath = join(SURVEY_ANSWERS_TEMPORARY_ATTACHMENT_PATH, userName, surveyId);
    await this.fileSystemService.deleteEmptyFolder(tempSurveyPath);
    const tempFilesPath = join(SURVEY_ANSWERS_TEMPORARY_ATTACHMENT_PATH, userName);
    await this.fileSystemService.deleteEmptyFolder(tempFilesPath);
  }
}

export default SurveyAnswerAttachmentsService;
