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

import { join } from 'path';
import { Response } from 'express';
import { HttpStatus, Injectable, OnModuleInit } from '@nestjs/common';
import ATTACHMENT_FOLDER from '@libs/common/constants/attachmentFolder';
import SURVEYS_ANSWER_FOLDER from '@libs/survey/constants/surveyAnswersFolder';
import SURVEY_ANSWERS_ATTACHMENT_PATH from '@libs/survey/constants/surveyAnswersAttachmentPath';
import SURVEY_ANSWERS_TEMPORARY_ATTACHMENT_PATH from '@libs/survey/constants/surveyAnswersTemporaryAttachmentPath';
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

  async moveQuestionAttachmentsToPermanentStorage(
    userName: string,
    surveyId: string,
    questionId: string,
    questionAnswer: (object & { content: string }) | (object & { content: string })[],
    keepOldFiles: boolean = false,
  ): Promise<(object & { content: string }) | (object & { content: string })[]> {
    const directory = join(SURVEY_ANSWERS_ATTACHMENT_PATH, surveyId, questionId, userName);
    const tempDirectory = join(SURVEY_ANSWERS_TEMPORARY_ATTACHMENT_PATH, userName, surveyId, questionId);
    const tempFileNames = await this.fileSystemService.getAllFilenamesInDirectory(tempDirectory);
    if (tempFileNames.length === 0) {
      return questionAnswer;
    }

    await this.fileSystemService.ensureDirectoryExists(directory);

    const fileNamesToMove: string[] = [];
    const persistentFiles: string[] = [];
    const permanentFiles = await this.fileSystemService.getAllFilenamesInDirectory(directory);

    const nextAnswerContent: (object & { content: string })[] = [];
    if (Array.isArray(questionAnswer)) {
      questionAnswer.forEach((item) => {
        const fileName = item.content?.split('/').pop();
        if (fileName && permanentFiles.includes(fileName)) {
          persistentFiles.push(fileName);
        }
        if (fileName && tempFileNames.includes(fileName)) {
          fileNamesToMove.push(fileName);
          nextAnswerContent.push(item);
        }
      });
    } else {
      const fileName = questionAnswer.content?.split('/').pop();
      if (fileName && tempFileNames.includes(fileName)) {
        fileNamesToMove.push(fileName);
      }
      nextAnswerContent.push(questionAnswer);
    }
    const movingPromises = fileNamesToMove.map(async (fileName) =>
      FilesystemService.moveFile(join(tempDirectory, fileName), join(directory, fileName)),
    );
    await Promise.all(movingPromises);

    if (!keepOldFiles) {
      const deletionPromises = permanentFiles.map(
        (fileName): Promise<void> =>
          persistentFiles.includes(fileName) ? Promise.resolve() : FilesystemService.deleteFile(directory, fileName),
      );
      await Promise.all(deletionPromises);
    }

    await this.fileSystemService.deleteFolderAndParentsUpToDepth(
      join(SURVEY_ANSWERS_TEMPORARY_ATTACHMENT_PATH, userName, surveyId, questionId),
      3,
    );

    return nextAnswerContent;
  }

  async moveAnswerAttachmentsToPermanentStorage(
    userName: string,
    surveyId: string,
    answer: JSON,
    keepOldFiles?: boolean,
  ): Promise<JSON> {
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
          keepOldFiles,
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
