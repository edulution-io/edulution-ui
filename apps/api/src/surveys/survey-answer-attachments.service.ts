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
import { ANSWER, FILES, PUBLIC_SURVEYS } from '@libs/survey/constants/surveys-endpoint';
import CustomHttpException from 'apps/api/src/common/CustomHttpException';
import SurveyAnswerErrorMessages from '@libs/survey/constants/survey-answer-error-messages';
import SURVEY_ANSWERS_ATTACHMENT_PATH from '@libs/survey/constants/surveyAnswersAttachmentPath';
import SURVEY_ANSWERS_TEMPORARY_ATTACHMENT_PATH from '@libs/survey/constants/surveyAnswersTemporaryAttachmentPath';
import FilesystemService from '../filesystem/filesystem.service';

@Injectable()
class SurveyAnswerAttachmentsService implements OnModuleInit {
  constructor(private fileSystemService: FilesystemService) {}

  onModuleInit() {
    void this.fileSystemService.ensureDirectoryExists(SURVEY_ANSWERS_ATTACHMENT_PATH);
  }

  async moveAnswersAttachmentsToPermanentStorage(username: string, surveyId: string, answer: JSON): Promise<JSON> {
    if (!username || !surveyId || !answer) {
      throw new CustomHttpException(
        SurveyAnswerErrorMessages.NotAbleToUpdateSurveyAnswerError,
        HttpStatus.INTERNAL_SERVER_ERROR,
        undefined,
        SurveyAnswerAttachmentsService.name,
      );
    }
    const path = join(SURVEY_ANSWERS_ATTACHMENT_PATH, surveyId);
    const tempPath = join(SURVEY_ANSWERS_TEMPORARY_ATTACHMENT_PATH, username, surveyId);

    const tempFileNames = await this.fileSystemService.getAllFilenamesInDirectory(tempPath);
    if (tempFileNames.length === 0) {
      return answer;
    }

    await this.fileSystemService.ensureDirectoryExists(path);

    const surveyAnswer = answer as unknown as Record<
      string,
      (object & { content: string }) | (object & { content: string })[]
    >;
    const movingPromises = new Set<Promise<void>>();

    Object.keys(surveyAnswer).forEach((questionName) => {
      const questionAnswer = surveyAnswer[questionName];
      const fileNames: string[] = [];
      if (Array.isArray(questionAnswer)) {
        questionAnswer.forEach((item) => {
          const filePathParts = item.content?.split(`/${PUBLIC_SURVEYS}/${ANSWER}/${FILES}/`);
          const baseUrl = filePathParts[0];
          const fileName = filePathParts[1].split('/').pop();
          if (!baseUrl || !fileName) {
            return;
          }
          const newUrl = `${baseUrl}/${PUBLIC_SURVEYS}/${ANSWER}/${FILES}/${surveyId}/${fileName}`;
          // eslint-disable-next-line no-param-reassign
          item.content = newUrl;
          if (fileName) {
            fileNames.push(fileName);
          }
        });
      } else {
        const filePathParts = questionAnswer.content?.split(`/${PUBLIC_SURVEYS}/${ANSWER}/${FILES}/`);
        const baseUrl = filePathParts[0];
        const fileName = filePathParts[1].split('/').pop();
        if (!baseUrl || !fileName) {
          return;
        }
        const newUrl = `${baseUrl}/${PUBLIC_SURVEYS}/${ANSWER}/${FILES}/${surveyId}/${fileName}`;
        questionAnswer.content = newUrl;
        if (fileName) {
          fileNames.push(fileName);
        }
      }
      fileNames.forEach((fileName) => {
        if (tempFileNames.includes(fileName)) {
          const oldPath = join(SURVEY_ANSWERS_TEMPORARY_ATTACHMENT_PATH, username, surveyId, fileName);
          const newPath = join(SURVEY_ANSWERS_ATTACHMENT_PATH, surveyId, fileName);
          movingPromises.add(FilesystemService.moveFile(oldPath, newPath));
        }
      });
    });
    await Promise.all(movingPromises);

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
