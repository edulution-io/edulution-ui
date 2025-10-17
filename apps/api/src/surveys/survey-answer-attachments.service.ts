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
            nextAnswer[questionName] = {
              ...item,
              content: SurveyAnswerAttachmentsService.makeUrlPermanent(item.content)!,
            };
          }
        });
      } else {
        const fileName = SurveyAnswerAttachmentsService.getFileNameFromUrl(questionAnswer.content);
        if (fileName && tempFileNames.includes(fileName)) {
          fileNamesToMove.push(fileName);
        }
        nextAnswer[questionName] = {
          ...questionAnswer,
          content: SurveyAnswerAttachmentsService.makeUrlPermanent(questionAnswer.content)!,
        };
      }
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
