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
import { Model } from 'mongoose';
import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { InjectModel } from '@nestjs/mongoose';
import { HttpStatus, Injectable, OnModuleInit } from '@nestjs/common';
import CommonErrorMessages from '@libs/common/constants/common-error-messages';
import getCurrentDateTimeString from '@libs/common/utils/Date/getCurrentDateTimeString';
import SURVEYS_TEMPLATE_EXCHANGE_PATH from '@libs/survey/constants/surveysTemplateExchangePath';
import SURVEYS_TEMPLATE_DEFAULT_PATH from '@libs/survey/constants/surveysTemplateDefaultPath';
import { SurveyTemplateDto, TemplateDto } from '@libs/survey/types/api/surveyTemplate.dto';
import { SurveysTemplate, SurveysTemplateDocument } from 'apps/api/src/surveys/surveys-template.schema';
import CustomHttpException from '../common/CustomHttpException';
import FilesystemService from '../filesystem/filesystem.service';

@Injectable()
class SurveysTemplateService implements OnModuleInit {
  constructor(
    @InjectModel(SurveysTemplate.name) private surveyTemplateModel: Model<SurveysTemplateDocument>,
    private fileSystemService: FilesystemService,
  ) {}

  async onModuleInit() {
    await this.fileSystemService.ensureDirectoryExists(SURVEYS_TEMPLATE_EXCHANGE_PATH);
    await this.getNewTemplatesFromExchangeFolder();
  }

  async createTemplateDocument(surveyTemplate: SurveyTemplateDto): Promise<SurveysTemplateDocument | null> {
    const { template, fileName = `${getCurrentDateTimeString()}_-_${uuidv4()}.SurveyTemplate.json` } = surveyTemplate;
    try {
      return await this.surveyTemplateModel.create({ template, fileName });
    } catch (error) {
      throw new CustomHttpException(
        CommonErrorMessages.DB_ACCESS_FAILED,
        HttpStatus.INTERNAL_SERVER_ERROR,
        error,
        SurveysTemplateService.name,
      );
    }
  }

  async updateOrCreateTemplateDocument(surveyTemplate: SurveyTemplateDto): Promise<SurveysTemplateDocument | null> {
    const { fileName, template } = surveyTemplate;
    try {
      return await this.surveyTemplateModel.findOneAndUpdate(
        { fileName },
        { template, fileName },
        { new: true, upsert: true },
      );
    } catch (error) {
      throw new CustomHttpException(
        CommonErrorMessages.DB_ACCESS_FAILED,
        HttpStatus.INTERNAL_SERVER_ERROR,
        error,
        SurveysTemplateService.name,
      );
    }
  }

  async serveTemplateNames(): Promise<string[]> {
    let templates = await this.surveyTemplateModel.find({});
    templates = templates.filter((template) => !!template.fileName && template.isActive);
    const fileNames = templates.map((template) => template.fileName);
    return fileNames;
  }

  async serveTemplate(fileName: string, res: Response): Promise<Response> {
    const document = await this.surveyTemplateModel.findOne({ fileName, isActive: true });
    if (!document) {
      throw new CustomHttpException(
        CommonErrorMessages.FILE_NOT_FOUND,
        HttpStatus.NOT_FOUND,
        undefined,
        SurveysTemplateService.name,
      );
    }
    return res.status(HttpStatus.OK).json(document.template);
  }

  async migrateTemplatesFromFolderToDb(path: string): Promise<void> {
    const fileNames = await this.fileSystemService.getAllFilenamesInDirectory(path);
    if (fileNames.length === 0) {
      return;
    }

    const filesToDelete: string[] = [];

    const creationPromises = fileNames.map(async (fileName) => {
      const content = await FilesystemService.readFile<TemplateDto>(join(path, fileName));
      if (!content) {
        throw new CustomHttpException(
          CommonErrorMessages.FILE_READING_FAILED,
          HttpStatus.NOT_FOUND,
          undefined,
          SurveysTemplateService.name,
        );
      }
      const newDocument: SurveysTemplateDocument | null = await this.updateOrCreateTemplateDocument({
        fileName,
        template: { ...content },
      });
      if (newDocument !== null) {
        filesToDelete.push(fileName);
      }
    });
    await Promise.all(creationPromises);

    await FilesystemService.deleteFiles(path, filesToDelete);
  }

  async getNewTemplatesFromExchangeFolder(): Promise<void> {
    await this.migrateTemplatesFromFolderToDb(SURVEYS_TEMPLATE_DEFAULT_PATH);
    await this.migrateTemplatesFromFolderToDb(SURVEYS_TEMPLATE_EXCHANGE_PATH);
  }
}

export default SurveysTemplateService;
