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
import { HttpStatus, Injectable, OnModuleInit } from '@nestjs/common';
import SurveyAnswerErrorMessages from '@libs/survey/constants/survey-answer-error-messages';
import SURVEY_ANSWERS_ATTACHMENT_PATH from '@libs/survey/constants/surveyAnswersAttachmentPath';
import SURVEY_ANSWERS_TEMPORARY_ATTACHMENT_PATH from '@libs/survey/constants/surveyAnswersTemporaryAttachmentPath';
import { PUBLIC_SURVEYS, SURVEYS } from '@libs/survey/constants/surveys-endpoint';
import CustomHttpException from 'apps/api/src/common/CustomHttpException';
import FilesystemService from '../filesystem/filesystem.service';

@Injectable()
class SurveyAnswerAttachmentsService implements OnModuleInit {
  constructor(private fileSystemService: FilesystemService) {}

  onModuleInit() {
    void this.fileSystemService.ensureDirectoryExists(SURVEY_ANSWERS_ATTACHMENT_PATH);
  }

  static async deleteTempFileFromAnswer(userName: string, surveyId: string, fileName: string): Promise<void> {
    const tempFilesPath = join(SURVEY_ANSWERS_TEMPORARY_ATTACHMENT_PATH, userName, surveyId);
    const tempExistence = await FilesystemService.checkIfFileExist(join(tempFilesPath, fileName));
    if (!tempExistence) {
      return;
    }
    await FilesystemService.deleteFile(tempFilesPath, fileName);
  }

  static makeUrlPermanent = (url: string | undefined): string | undefined =>
    url?.replace(`/${PUBLIC_SURVEYS}/`, `/${SURVEYS}/`);

  static getFileNameFromUrl = (url: string | undefined): string | undefined => url?.split('/').pop();

  async moveAnswersAttachmentsToPermanentStorage(userName: string, surveyId: string, answer: JSON): Promise<JSON> {
    if (!userName || !surveyId || !answer) {
      throw new CustomHttpException(
        SurveyAnswerErrorMessages.NotAbleToUpdateSurveyAnswerError,
        HttpStatus.INTERNAL_SERVER_ERROR,
        undefined,
        SurveyAnswerAttachmentsService.name,
      );
    }
    const directory = join(SURVEY_ANSWERS_ATTACHMENT_PATH, surveyId, userName);
    const tempDirectory = join(SURVEY_ANSWERS_TEMPORARY_ATTACHMENT_PATH, userName, surveyId);
    const tempFileNames = await this.fileSystemService.getAllFilenamesInDirectory(tempDirectory);
    if (tempFileNames.length === 0) {
      return answer;
    }

    await this.fileSystemService.ensureDirectoryExists(directory);

    const surveyAnswer = answer as unknown as Record<
      string,
      (object & { content: string }) | (object & { content: string })[]
    >;

    const permanentFiles = await this.fileSystemService.getAllFilenamesInDirectory(directory);

    const fileNamesToMove: string[] = [];
    const persistentFiles: string[] = [];

    const nextAnswer: Record<string, (object & { content: string }) | (object & { content: string })[]> = {};
    const nextAnswerContent: (object & { content: string })[] = [];
    Object.keys(surveyAnswer).forEach((questionName) => {
      const questionAnswer = surveyAnswer[questionName];
      if (Array.isArray(questionAnswer)) {
        questionAnswer.forEach((item) => {
          const fileName = SurveyAnswerAttachmentsService.getFileNameFromUrl(item.content);
          if (fileName && permanentFiles.includes(fileName)) {
            persistentFiles.push(fileName);
          }
          if (fileName && tempFileNames.includes(fileName)) {
            fileNamesToMove.push(fileName);
            const newFile: object & { content: string } = {
              ...item,
              content: SurveyAnswerAttachmentsService.makeUrlPermanent(item.content)!,
            };
            nextAnswerContent.push(newFile);
          }
        });
      } else {
        const fileName = SurveyAnswerAttachmentsService.getFileNameFromUrl(questionAnswer.content);
        if (fileName && tempFileNames.includes(fileName)) {
          fileNamesToMove.push(fileName);
        }
        const newFile: object & { content: string } = {
          ...questionAnswer,
          content: SurveyAnswerAttachmentsService.makeUrlPermanent(questionAnswer.content)!,
        };
        nextAnswerContent.push(newFile);
      }
      nextAnswer[questionName] = nextAnswerContent;
    });

    const movingPromises = fileNamesToMove.map(async (fileName) =>
      FilesystemService.moveFile(join(tempDirectory, fileName), join(directory, fileName)),
    );
    await Promise.all(movingPromises);

    const deletionPromises = permanentFiles.map(
      (fileName): Promise<void> =>
        persistentFiles.includes(fileName) ? Promise.resolve() : FilesystemService.deleteFile(directory, fileName),
    );
    await Promise.all(deletionPromises);

    return JSON.parse(JSON.stringify(nextAnswer)) as JSON;
  }

  async clearUpSurveyAnswersTempFiles(userName: string, surveyId: string): Promise<void> {
    const tempSurveyPath = join(SURVEY_ANSWERS_TEMPORARY_ATTACHMENT_PATH, userName, surveyId);
    await this.fileSystemService.deleteEmptyFolder(tempSurveyPath);
    const tempFilesPath = join(SURVEY_ANSWERS_TEMPORARY_ATTACHMENT_PATH, userName);
    await this.fileSystemService.deleteEmptyFolder(tempFilesPath);
  }
}

export default SurveyAnswerAttachmentsService;
