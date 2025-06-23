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
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
// import JwtUser from '@libs/user/types/jwt/jwtUser';
import {
  SURVEY_FILE_ATTACHMENT_ENDPOINT,
  SURVEY_TEMP_FILE_ATTACHMENT_ENDPOINT,
} from '@libs/survey/constants/surveys-endpoint';
import SURVEYS_ATTACHMENT_PATH from '@libs/survey/constants/surveysAttachmentPath';
import SURVEYS_TEMP_FILES_PATH from '@libs/survey/constants/surveysTempFilesPath';
import TEMPORAL_SURVEY_ID_STRING from '@libs/survey/constants/temporal-survey-id-string';
import SURVEYS_HEADER_IMAGE from '@libs/survey/constants/surveys-header-image';
import SurveyElement from '@libs/survey/types/TSurveyElement';
import SurveyPage from '@libs/survey/types/TSurveyPage';
import QuestionsType from '@libs/survey/constants/question-types';
// import QuestionTypes from '@libs/survey/types/TSurveyQuestionTypes';
import isQuestionTypeImageType from '@libs/survey/utils/isQuestionTypeImageType';
import SurveyFormula from '@libs/survey/types/TSurveyFormula';
import SurveyDto from '@libs/survey/types/api/survey.dto';
import { SurveyDocument } from 'apps/api/src/surveys/survey.schema';
import FilesystemService from '../filesystem/filesystem.service';

@Injectable()
class SurveysAttachmentService implements OnModuleInit {
  constructor(private fileSystemService: FilesystemService) {}

  private readonly attachmentsPath = SURVEYS_ATTACHMENT_PATH;

  onModuleInit() {
    void this.fileSystemService.ensureDirectoryExists(this.attachmentsPath);
  }

  // preProcessFormula = async (survey: SurveyDocument, user: JwtUser): Promise<SurveyFormula> => {
  //   const allQuestions = await SurveysAttachmentService.getAllQuestions(survey);
  //   const currentQuestionNames = allQuestions.map(question => question.name);
  //   await this.cleanupOrphanedQuestionFolders(survey.id, currentQuestionNames);

  //   const { formula } = survey;
  //   const processedFormula = { ...formula };
  //   const { logo, elements, pages } = processedFormula || {};

  //   const includedFileNames: Set<string> = new Set();

  //   if (logo) {
  //     const processedLogo = logo ? await this.processUrl(logo, user.preferred_username, survey.id, SURVEYS_HEADER_IMAGE) : undefined;
  //     processedFormula.logo = processedLogo?.newUrl;
  //   }

  //   if (elements && elements.length > 0) {
  //     const processingElements = elements?.map(async (element: SurveyElement) => await this.processElement(element, user.preferred_username, survey.id, includedFileNames));
  //     const processedElements = await Promise.all(processingElements || []);
  //     processedFormula.elements = processedElements;
  //   }

  //   if (pages && pages.length > 0) {
  //     const processingPages = pages?.map(async (page: SurveyPage) => {
  //       const { elements: pageElements } = page;
  //       const processingPageElements = pageElements?.map(async (element: SurveyElement) => await this.processElement(element, user.preferred_username, survey.id, includedFileNames));
  //       const processedPageElements = await Promise.all(processingPageElements || []);
  //       return { ...page, elements: processedPageElements };
  //     });
  //     const processedPages = await Promise.all(processingPages || []);
  //     processedFormula.pages = processedPages;
  //   }

  //   return processedFormula;
  // }
  preProcessFormula = async (surveyId: string, formula: SurveyFormula, username: string): Promise<SurveyFormula> => {
    const processedFormula = { ...formula };
    const allAttachmentNames: Set<string> = new Set();

    if (processedFormula.logo) {
      const { newUrl, filename } = await this.processUrl(
        processedFormula.logo,
        username,
        surveyId,
        SURVEYS_HEADER_IMAGE,
      );
      processedFormula.logo = newUrl;
      if (filename) allAttachmentNames.add(join(SURVEYS_HEADER_IMAGE, filename));
    }

    if (processedFormula.pages) {
      processedFormula.pages = await Promise.all(
        processedFormula.pages.map(async (page) => ({
          ...page,
          elements: await this.processElements(page.elements, username, surveyId, allAttachmentNames),
        })),
      );
    }

    if (processedFormula.elements) {
      processedFormula.elements = await this.processElements(
        processedFormula.elements,
        username,
        surveyId,
        allAttachmentNames,
      );
    }

    // After processing all attachments, clean up any that are no longer referenced.
    await this.cleanupOrphanedAttachments(surveyId, allAttachmentNames);

    return processedFormula;
  };

  static getAllQuestions = (survey: SurveyDocument | SurveyDto): SurveyElement[] => {
    const { formula } = survey;
    const { logo, elements, pages } = formula;

    const questions: SurveyElement[] = logo
      ? [{ name: SURVEYS_HEADER_IMAGE, type: QuestionsType.IMAGE, value: logo }]
      : [];

    questions.concat(elements || []);

    pages?.forEach((page: SurveyPage) => {
      const { elements: pageElements } = page;
      questions.concat(pageElements || []);
    });
    return questions;
  };

  // cleanupOrphanedQuestionFolders = async (surveyId: string, questionNames: string[]): Promise<void> => {
  //   const permanentDirectoryPath = join(SURVEYS_ATTACHMENT_PATH, surveyId);
  //   const oldQuestionNames = await this.fileSystemService.getAllFilenamesInDirectory(permanentDirectoryPath);
  //   questionNames.forEach((questionName) => {
  //     if (oldQuestionNames.includes(questionName)) {
  //       oldQuestionNames.splice(oldQuestionNames.indexOf(questionName), 1);
  //     }
  //   });
  //   const promises = oldQuestionNames.map((questionName) => {
  //     const questionPath = join(SURVEYS_ATTACHMENT_PATH, surveyId, questionName);
  //     return this.fileSystemService.deleteDirectory(questionPath);
  //   });
  //   try {
  //     await Promise.all(promises);
  //   } catch (error) {
  //     Logger.warn(`Failed to delete the deprecated questions folders for survey ${surveyId}`, error.stack, SurveysAttachmentService.name);
  //   }
  // }
  private async cleanupOrphanedAttachments(surveyId: string, referencedAttachments: Set<string>): Promise<void> {
    const allQuestionFolders = await this.fileSystemService.getAllFilenamesInDirectory(
      join(SURVEYS_ATTACHMENT_PATH, surveyId),
    );
    const cleanupPromises = allQuestionFolders.map(async (questionFolder) =>
      this.cleanupQuestionFolder(surveyId, questionFolder, referencedAttachments),
    );
    await Promise.all(cleanupPromises);
  }

  private async cleanupQuestionFolder(
    surveyId: string,
    questionFolder: string,
    referencedAttachments: Set<string>,
  ): Promise<void> {
    const questionPath = join(SURVEYS_ATTACHMENT_PATH, surveyId, questionFolder);
    const filesInFolder = await this.fileSystemService.getAllFilenamesInDirectory(questionPath);

    const deletePromises = filesInFolder
      .filter((file) => !referencedAttachments.has(join(questionFolder, file)))
      .map((fileToDelete) => FilesystemService.deleteFile(questionPath, fileToDelete));
    await Promise.all(deletePromises);
  }

  cleanupTemporaryFiles = (username: string): void => {
    const temporaryAttachmentPath = join(SURVEYS_TEMP_FILES_PATH, username);
    void this.fileSystemService.deleteDirectory(temporaryAttachmentPath);
  };

  processElements = async (
    elements: SurveyElement[] | undefined,
    username: string,
    surveyId: string,
    includedFileNames: Set<string>,
  ) => {
    if (!elements) return [];
    return Promise.all(elements.map(async (el) => this.processElement(el, username, surveyId, includedFileNames)));
  };

  processElement = async (
    element: SurveyElement,
    username: string,
    surveyId: string,
    includedFileNames: Set<string>,
  ): Promise<SurveyElement> => {
    const processedElement = { ...element };
    switch (element.type) {
      case QuestionsType.CHECKBOX:
      case QuestionsType.DROPDOWN:
      case QuestionsType.RADIO_GROUP:
        if (element.choicesByUrl && element.choicesByUrl?.url.includes(TEMPORAL_SURVEY_ID_STRING)) {
          processedElement.choicesByUrl = {
            ...element.choicesByUrl,
            url: element.choicesByUrl.url.replace(TEMPORAL_SURVEY_ID_STRING, surveyId),
          };
        }
        break;

      case QuestionsType.IMAGE:
        if (element.imageLink) {
          const { newUrl, filename } = await this.processUrl(element.imageLink, username, surveyId, element.name);
          processedElement.imageLink = newUrl;
          if (filename) includedFileNames.add(join(element.name, filename));
        }
        break;

      case QuestionsType.IMAGE_PICKER:
        if (element.choices) {
          processedElement.choices = await Promise.all(
            element.choices.map(async (choice) => {
              if (typeof choice !== 'string' && choice.imageLink) {
                const { newUrl, filename } = await this.processUrl(choice.imageLink, username, surveyId, element.name);
                if (filename) includedFileNames.add(join(element.name, filename));
                return { ...choice, imageLink: newUrl };
              }
              return choice;
            }),
          );
        }
        break;

      case QuestionsType.FILE:
        if (element.value && typeof element.value === 'string') {
          const { newUrl, filename } = await this.processUrl(element.value, username, surveyId, element.name);
          processedElement.value = newUrl;
          if (filename) includedFileNames.add(join(element.name, filename));
        }
        break;

      default:
        await this.removeAttachmentForOtherQuestionTypes(surveyId, element);
        break;
    }

    return processedElement;
  };

  static updateLinkForRestfulChoices(surveyId: string, question: SurveyElement): SurveyElement {
    if (question.choicesByUrl && question.choicesByUrl?.url.includes(TEMPORAL_SURVEY_ID_STRING)) {
      return {
        ...question,
        choicesByUrl: {
          ...question.choicesByUrl,
          url: question.choicesByUrl.url.replace(TEMPORAL_SURVEY_ID_STRING, surveyId),
        },
      };
    }
    return question;
  }

  processUrl = async (
    url: string,
    username: string,
    surveyId: string,
    subfolder: string,
  ): Promise<{ newUrl: string; filename: string | null }> => {
    if (!url || !url.includes(`/${SURVEY_TEMP_FILE_ATTACHMENT_ENDPOINT}`)) {
      const filename = url.split('/').pop() || null;
      return { newUrl: url, filename };
    }

    const filename = url.split('/').pop();
    if (!filename) {
      return { newUrl: url, filename: null };
    }

    const tempPath = join(SURVEYS_TEMP_FILES_PATH, username, filename);
    const permanentDir = join(SURVEYS_ATTACHMENT_PATH, surveyId, subfolder);
    const permanentPath = join(permanentDir, filename);
    const pathForUrl = join(surveyId, subfolder, filename);

    try {
      await this.fileSystemService.ensureDirectoryExists(permanentDir);
      await FilesystemService.moveFile(tempPath, permanentPath);
      const baseUrl = url.substring(0, url.indexOf(`/${SURVEY_TEMP_FILE_ATTACHMENT_ENDPOINT}`));
      Logger.log(`Moved temp file ${tempPath} to ${permanentPath}`, SurveysAttachmentService.name);
      Logger.log(
        `filename: ${filename}; newUrl: ${baseUrl}/${SURVEY_FILE_ATTACHMENT_ENDPOINT}/${pathForUrl}`,
        SurveysAttachmentService.name,
      );
      return {
        newUrl: `${baseUrl}/${SURVEY_FILE_ATTACHMENT_ENDPOINT}/${pathForUrl}`,
        filename,
      };
    } catch (error) {
      Logger.error(`Failed to move temp file ${tempPath} to ${permanentPath}`, SurveysAttachmentService.name);
      return { newUrl: url, filename: null };
    }
  };

  async removeAttachmentForOtherQuestionTypes(surveyId: string, question: SurveyElement): Promise<void> {
    const { type } = question;
    if (isQuestionTypeImageType(type)) {
      return;
    }
    await this.removeQuestionAttachment(surveyId, question.name);
  }

  async removeQuestionAttachment(surveyId: string, questionName: string) {
    const permaDirectory = join(SURVEYS_ATTACHMENT_PATH, surveyId, questionName);
    await this.fileSystemService.deleteDirectory(permaDirectory);
  }

  static async onSurveyRemoval(surveyIds: string[]): Promise<void> {
    const filePath = surveyIds.map((surveyId) => join(SURVEYS_ATTACHMENT_PATH, surveyId));
    return FilesystemService.deleteDirectories(filePath);
  }

  async serveFiles(surveyId: string, questionId: string, fileName: string, res: Response): Promise<Response> {
    const filePath = join(SURVEYS_ATTACHMENT_PATH, surveyId, questionId, fileName);
    const fileStream = await this.fileSystemService.createReadStream(filePath);
    fileStream.pipe(res);
    return res;
  }

  async serveTempFiles(userId: string, fileName: string, res: Response): Promise<Response> {
    const filePath = `${SURVEYS_TEMP_FILES_PATH}/${userId}/${fileName}`;
    const fileStream = await this.fileSystemService.createReadStream(filePath);
    fileStream.pipe(res);
    return res;
  }
}

export default SurveysAttachmentService;
