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
import ATTACHMENT_FOLDER from '@libs/common/constants/attachmentFolder';
import SURVEYS_ANSWER_FOLDER from '@libs/survey/constants/surveyAnswersFolder';
import SURVEY_ANSWERS_ATTACHMENT_PATH from '@libs/survey/constants/surveyAnswersAttachmentPath';
import SURVEY_ANSWERS_TEMPORARY_ATTACHMENT_PATH from '@libs/survey/constants/surveyAnswersTemporaryAttachmentPath';
import TSurveyAnswer from '@libs/survey/types/TSurveyAnswer';
import TSurveyFileQuestionAnswerType from '@libs/survey/types/TSurveyFileQuestionAnswerType';
import TSurveyQuestionAnswerTypes from '@libs/survey/types/TSurveyQuestionAnswerTypes';
import isAnswerSimpleQuestionAnswer from '@libs/survey/utils/isAnswerSimpleQuestionAnswer';
import isAnswerFileQuestionAnswer from '@libs/survey/utils/isAnswerFileQuestionAnswer';
import isAnswerSimpleFileQuestionAnswer from '@libs/survey/utils/isAnswerSimpleFileQuestionAnswer';
import CommonErrorMessages from '@libs/common/constants/common-error-messages';
import CustomHttpException from 'apps/api/src/common/CustomHttpException';
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
    questionId: string,
    fileName: string,
    res: Response,
  ): Promise<Response> {
    const tempFilePath = join(SURVEY_ANSWERS_TEMPORARY_ATTACHMENT_PATH, userName, surveyId, questionId, fileName);
    const permanentFilePath = join(SURVEY_ANSWERS_ATTACHMENT_PATH, surveyId, questionId, userName, fileName);
    const tempFileExists = await FilesystemService.checkIfFileExist(tempFilePath);
    if (tempFileExists) {
      const path = join(SURVEYS_ANSWER_FOLDER, userName, surveyId, questionId);
      return this.fileSystemService.serveTempFiles(path, fileName, res);
    }
    const permanentFileExists = await FilesystemService.checkIfFileExist(permanentFilePath);
    if (permanentFileExists) {
      const path = join(SURVEYS_ANSWER_FOLDER, ATTACHMENT_FOLDER, surveyId, questionId, userName);
      return this.fileSystemService.serveFiles(path, fileName, res);
    }
    throw new CustomHttpException(CommonErrorMessages.FILE_NOT_FOUND, HttpStatus.INTERNAL_SERVER_ERROR);
  }

  async deleteTempQuestionAnswerFiles(userName: string, surveyId: string, questionId: string): Promise<void> {
    const tempFilesPath = join(SURVEY_ANSWERS_TEMPORARY_ATTACHMENT_PATH, userName, surveyId, questionId);
    return this.fileSystemService.deleteDirectory(tempFilesPath);
  }

  static async deleteTempQuestionAnswerFile(
    userName: string,
    surveyId: string,
    questionId: string,
    fileName: string,
  ): Promise<void> {
    const tempFilesPath = join(SURVEY_ANSWERS_TEMPORARY_ATTACHMENT_PATH, userName, surveyId, questionId);
    await FilesystemService.checkIfFileExistAndDelete(join(tempFilesPath, fileName));
  }

  static async moveNewFiles(fileNamesToMove: string[], tempDirectory: string, targetDirectory: string): Promise<void> {
    await Promise.all(
      fileNamesToMove.map((fileName) =>
        FilesystemService.moveFile(join(tempDirectory, fileName), join(targetDirectory, fileName)),
      ),
    );
  }

  static async removeOldFiles(
    directory: string,
    permanentFileNames: string[],
    keepOldFiles: boolean,
    fileNamesToKeep?: string[],
  ): Promise<void> {
    if (keepOldFiles) {
      return;
    }
    const deletions = permanentFileNames
      .filter((fileName) => !(fileNamesToKeep || []).includes(fileName))
      .map((fileName) => FilesystemService.deleteFile(directory, fileName));

    await Promise.all(deletions);
  }

  static getFileNamesFromFileQuestionAnswer(answer: TSurveyQuestionAnswerTypes): string[] {
    const fileNames: string[] = [];
    const asArray = Array.isArray(answer) ? answer : [answer];
    asArray.forEach((item) => {
      if (isAnswerSimpleFileQuestionAnswer(item)) {
        const fileName = (item as TSurveyFileQuestionAnswerType).content?.split('/').pop();
        if (fileName) {
          fileNames.push(fileName);
        }
      }
    });
    return fileNames;
  }

  async updateSurveyAnswerAttachments(
    fileNames: string[],
    tempDirectory: string,
    directory: string,
    keepOldFiles = false,
  ): Promise<void> {
    const tempFileNames = await this.fileSystemService.getAllFilenamesInDirectory(tempDirectory);
    const permanentFileNames = await this.fileSystemService.getAllFilenamesInDirectory(directory);

    const fileNamesToMove: string[] = [];
    const fileNamesToKeep: string[] = [];
    fileNames.forEach((fileName) => {
      if (!fileName) return;
      if (tempFileNames.includes(fileName)) {
        fileNamesToMove.push(fileName);
      }
      if (permanentFileNames.includes(fileName)) {
        fileNamesToKeep.push(fileName);
      }
    });

    await SurveyAnswerAttachmentsService.moveNewFiles(fileNamesToMove, tempDirectory, directory);

    if (!keepOldFiles) {
      await SurveyAnswerAttachmentsService.removeOldFiles(directory, permanentFileNames, true, fileNamesToKeep);
    }

    await this.fileSystemService.deleteEmptyFolderWithDepth(tempDirectory, 3);
  }

  async processFileQuestionAnswer(
    userName: string,
    surveyId: string,
    questionId: string,
    questionAnswer: TSurveyQuestionAnswerTypes,
    keepOldFiles = false,
  ): Promise<TSurveyQuestionAnswerTypes> {
    const directory = join(SURVEY_ANSWERS_ATTACHMENT_PATH, surveyId, questionId, userName);
    await this.fileSystemService.ensureDirectoryExists(directory);

    const tempDirectory = join(SURVEY_ANSWERS_TEMPORARY_ATTACHMENT_PATH, userName, surveyId, questionId);

    const fileNames = SurveyAnswerAttachmentsService.getFileNamesFromFileQuestionAnswer(questionAnswer);

    await this.updateSurveyAnswerAttachments(fileNames, tempDirectory, directory, keepOldFiles);

    return Array.isArray(questionAnswer) ? questionAnswer : [questionAnswer];
  }

  async processQuestionAnswer(
    userName: string,
    surveyId: string,
    questionId: string,
    questionAnswer: TSurveyQuestionAnswerTypes,
    keepOldFiles = false,
  ): Promise<TSurveyQuestionAnswerTypes> {
    if (isAnswerSimpleQuestionAnswer(questionAnswer)) {
      return questionAnswer;
    }

    if (!isAnswerFileQuestionAnswer(questionAnswer)) {
      const nested = questionAnswer as TSurveyAnswer;
      return this.processSurveyAnswer(userName, surveyId, nested, true);
    }

    return this.processFileQuestionAnswer(userName, surveyId, questionId, questionAnswer, keepOldFiles);
  }

  async processSurveyAnswer(
    userName: string,
    surveyId: string,
    answer: TSurveyAnswer,
    keepOldFiles = false,
  ): Promise<TSurveyAnswer> {
    const entries = Object.entries(answer);

    const processedEntries = await Promise.all(
      entries.map(async ([questionId, questionAnswer]) => {
        const processed = await this.processQuestionAnswer(
          userName,
          surveyId,
          questionId,
          questionAnswer,
          keepOldFiles,
        );
        return [questionId, processed] as const;
      }),
    );

    return Object.fromEntries(processedEntries) as TSurveyAnswer;
  }

  async updateSurveyAnswer(userName: string, surveyId: string, answer: JSON, keepOldFiles = false): Promise<JSON> {
    const surveyAnswer = answer as unknown as TSurveyAnswer;
    const processedSurveyAnswer = await this.processSurveyAnswer(userName, surveyId, surveyAnswer, keepOldFiles);
    return processedSurveyAnswer as unknown as JSON;
  }

  async clearUpSurveyAnswersTempFiles(userName: string, surveyId: string): Promise<void> {
    const tempSurveyPath = join(SURVEY_ANSWERS_TEMPORARY_ATTACHMENT_PATH, userName, surveyId);
    await this.fileSystemService.deleteEmptyFolder(tempSurveyPath);
    const tempFilesPath = join(SURVEY_ANSWERS_TEMPORARY_ATTACHMENT_PATH, userName);
    await this.fileSystemService.deleteEmptyFolder(tempFilesPath);
  }
}

export default SurveyAnswerAttachmentsService;
