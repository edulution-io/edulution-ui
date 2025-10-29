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
import {
  SURVEY_FILE_ATTACHMENT_ENDPOINT,
  PUBLIC_SURVEY_FILE_ATTACHMENT_ENDPOINT,
  SURVEY_CHOICES,
  PUBLIC_SURVEY_CHOICES,
} from '@libs/survey/constants/surveys-endpoint';
import SURVEYS_ATTACHMENT_PATH from '@libs/survey/constants/surveysAttachmentPath';
import SURVEYS_TEMP_FILES_PATH from '@libs/survey/constants/surveysTempFilesPath';
import TEMPORAL_SURVEY_ID_STRING from '@libs/survey/constants/temporal-survey-id-string';
import SURVEYS_HEADER_IMAGE from '@libs/survey/constants/surveys-header-image';
import TSurveyElement from '@libs/survey/types/TSurveyElement';
import QuestionsType from '@libs/survey/constants/questions-type';
import isQuestionTypeImageType from '@libs/survey/utils/isQuestionTypeImageType';
import SurveyFormula from '@libs/survey/types/SurveyFormula';
import FilesystemService from '../filesystem/filesystem.service';

@Injectable()
class SurveysAttachmentService implements OnModuleInit {
  constructor(private fileSystemService: FilesystemService) {}

  private readonly attachmentsPath = SURVEYS_ATTACHMENT_PATH;

  onModuleInit() {
    void this.fileSystemService.ensureDirectoryExists(this.attachmentsPath);
  }

  async preProcessFormula(
    surveyId: string,
    formula: SurveyFormula,
    username: string,
    isPublic?: boolean,
  ): Promise<SurveyFormula> {
    const processedFormula = { ...formula };
    const includedFileNames: Set<string> = new Set();

    if (processedFormula.logo) {
      const { newUrl, filename } = await this.processUrl(
        processedFormula.logo,
        username,
        surveyId,
        SURVEYS_HEADER_IMAGE,
        isPublic,
      );
      processedFormula.logo = newUrl;
      if (filename) includedFileNames.add(join(SURVEYS_HEADER_IMAGE, filename));
    }

    if (processedFormula.pages) {
      processedFormula.pages = await Promise.all(
        processedFormula.pages.map(async (page) => ({
          ...page,
          elements: await this.processElements(page.elements, username, surveyId, includedFileNames, isPublic),
        })),
      );
    }

    if (processedFormula.elements) {
      processedFormula.elements = await this.processElements(
        processedFormula.elements,
        username,
        surveyId,
        includedFileNames,
        isPublic,
      );
    }

    await this.cleanupOrphanedAttachments(surveyId, includedFileNames);

    return processedFormula;
  }

  private async cleanupOrphanedAttachments(surveyId: string, referencedAttachments: Set<string>): Promise<void> {
    const allQuestionFolders = await this.fileSystemService.getAllFilenamesInDirectory(
      join(SURVEYS_ATTACHMENT_PATH, surveyId),
    );
    const cleanupPromises = allQuestionFolders.map(async (questionFolder) =>
      this.cleanupQuestionFolder(surveyId, questionFolder, referencedAttachments),
    );
    await Promise.all(cleanupPromises);

    const surveyPath = join(SURVEYS_ATTACHMENT_PATH, surveyId);
    const remainingQuestionFolders = await this.fileSystemService.getAllFilenamesInDirectory(surveyPath);
    if (remainingQuestionFolders.length === 0) {
      await this.fileSystemService.deleteDirectory(surveyPath);
    }
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

    const remainingFiles = await this.fileSystemService.getAllFilenamesInDirectory(questionPath);
    if (remainingFiles.length === 0) {
      await this.fileSystemService.deleteDirectory(questionPath);
    }
  }

  cleanupTemporaryFiles(username: string): void {
    const temporaryAttachmentPath = join(SURVEYS_TEMP_FILES_PATH, username);
    void this.fileSystemService.deleteDirectory(temporaryAttachmentPath);
  }

  async processElements(
    elements: TSurveyElement[] | undefined,
    username: string,
    surveyId: string,
    includedFileNames: Set<string>,
    isPublic?: boolean,
  ) {
    if (!elements) return [];
    return Promise.all(
      elements.map(async (el) => this.processElement(el, username, surveyId, includedFileNames, isPublic)),
    );
  }

  async processElement(
    element: TSurveyElement,
    username: string,
    surveyId: string,
    includedFileNames: Set<string>,
    isPublic?: boolean,
  ): Promise<TSurveyElement> {
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
        if (element.choicesByUrl && !element.choicesByUrl?.url.includes(`/${PUBLIC_SURVEY_CHOICES}/`) && isPublic) {
          processedElement.choicesByUrl = {
            ...element.choicesByUrl,
            url: element.choicesByUrl.url.replace(`/${PUBLIC_SURVEY_CHOICES}/`, `/${SURVEY_CHOICES}/`),
          };
        } else if (element.choicesByUrl && !element.choicesByUrl?.url.includes(`/${SURVEY_CHOICES}/`) && !isPublic) {
          processedElement.choicesByUrl = {
            ...element.choicesByUrl,
            url: element.choicesByUrl.url.replace(`/${SURVEY_CHOICES}/`, `/${PUBLIC_SURVEY_CHOICES}/`),
          };
        }
        break;

      case QuestionsType.IMAGE:
        if (element.imageLink) {
          const { newUrl, filename } = await this.processUrl(
            element.imageLink,
            username,
            surveyId,
            element.name,
            isPublic,
          );
          processedElement.imageLink = newUrl;
          if (filename) includedFileNames.add(join(element.name, filename));
        }
        break;

      case QuestionsType.IMAGE_PICKER:
        if (element.choices) {
          processedElement.choices = await Promise.all(
            element.choices.map(async (choice) => {
              if (typeof choice !== 'string' && choice.imageLink) {
                const { newUrl, filename } = await this.processUrl(
                  choice.imageLink,
                  username,
                  surveyId,
                  element.name,
                  isPublic,
                );
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
          const { newUrl, filename } = await this.processUrl(element.value, username, surveyId, element.name, isPublic);
          processedElement.value = newUrl;
          if (filename) includedFileNames.add(join(element.name, filename));
        }
        break;

      default:
        await this.removeAttachmentForOtherQuestionTypes(surveyId, element);
        break;
    }

    return processedElement;
  }

  static updateLinkForRestfulChoices(surveyId: string, question: TSurveyElement): TSurveyElement {
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

  async processUrl(
    url: string,
    username: string,
    surveyId: string,
    subfolder: string,
    isPublic = false,
  ): Promise<{ newUrl: string; filename: string | null }> {
    const filename = url.split('/').pop();
    if (!filename) {
      return { newUrl: url, filename: null };
    }

    const permanentDir = join(SURVEYS_ATTACHMENT_PATH, surveyId, subfolder);
    const permanentPath = join(permanentDir, filename);
    const permanentFileExists = await FilesystemService.checkIfFileExist(permanentPath);
    if (permanentFileExists) {
      return { newUrl: url, filename };
    }

    const tempPath = join(SURVEYS_TEMP_FILES_PATH, username, filename);
    const tempFileExists = await FilesystemService.checkIfFileExist(tempPath);
    if (!tempFileExists) {
      return { newUrl: url, filename: null };
    }

    const pathForUrl = join(surveyId, subfolder, filename);
    try {
      await this.fileSystemService.ensureDirectoryExists(permanentDir);
      await FilesystemService.moveFile(tempPath, permanentPath);
      const baseUrl = url.substring(0, url.indexOf(`/${SURVEY_FILE_ATTACHMENT_ENDPOINT}`));
      const endpoint = isPublic ? PUBLIC_SURVEY_FILE_ATTACHMENT_ENDPOINT : SURVEY_FILE_ATTACHMENT_ENDPOINT;
      Logger.log(`Moved temp file ${tempPath} to ${permanentPath}`, SurveysAttachmentService.name);
      Logger.log(`filename: ${filename}; newUrl: ${baseUrl}/${endpoint}/${pathForUrl}`, SurveysAttachmentService.name);
      return {
        newUrl: `${baseUrl}/${endpoint}/${pathForUrl}`,
        filename,
      };
    } catch (error) {
      Logger.error(`Failed to move temp file ${tempPath} to ${permanentPath}`, SurveysAttachmentService.name);
      return { newUrl: url, filename: null };
    }
  }

  async removeAttachmentForOtherQuestionTypes(surveyId: string, question: TSurveyElement): Promise<void> {
    const { type } = question;
    if (isQuestionTypeImageType(type)) {
      return;
    }
    const permaDirectory = join(SURVEYS_ATTACHMENT_PATH, surveyId, question.name);
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
