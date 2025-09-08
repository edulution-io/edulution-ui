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
import SURVEY_TEMPLATES_EXCHANGE_PATH from '@libs/survey/constants/surveyTemplatesExchangePath';
import { SurveyTemplateDto, TemplateDto } from '@libs/survey/types/api/surveyTemplate.dto';
import getIsAdmin from '@libs/user/utils/getIsAdmin';
import { SurveysTemplate, SurveysTemplateDocument } from 'apps/api/src/surveys/surveys-template.schema';
import CustomHttpException from '../common/CustomHttpException';
import FilesystemService from '../filesystem/filesystem.service';
import MigrationService from '../migration/migration.service';
import surveysTemplateMigrationsList from './migrations/surveysTemplateMigrationsList';

@Injectable()
class SurveysTemplateService implements OnModuleInit {
  constructor(
    @InjectModel(SurveysTemplate.name) private surveyTemplateModel: Model<SurveysTemplateDocument>,
    private fileSystemService: FilesystemService,
  ) {}

  async onModuleInit() {
    await this.fileSystemService.ensureDirectoryExists(SURVEY_TEMPLATES_EXCHANGE_PATH);
    await MigrationService.runMigrations<SurveysTemplateDocument>(
      this.surveyTemplateModel,
      surveysTemplateMigrationsList,
    );
    await this.migrateTemplatesFromFolderToDb(SURVEY_TEMPLATES_EXCHANGE_PATH);
  }

  async updateOrCreateTemplateDocument(surveyTemplate: SurveyTemplateDto): Promise<SurveysTemplateDocument | null> {
    const { template, isActive = true, fileName = `${getCurrentDateTimeString()}_-_${uuidv4()}` } = surveyTemplate;
    try {
      return await this.surveyTemplateModel.findOneAndUpdate(
        { fileName },
        { template, isActive, fileName },
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

  async serveTemplates(ldapGroups: string[], res: Response): Promise<Response> {
    const documents = await this.surveyTemplateModel.find(getIsAdmin(ldapGroups) ? {} : { isActive: true });
    if (!documents || documents.length === 0) {
      throw new CustomHttpException(
        CommonErrorMessages.FILE_NOT_FOUND,
        HttpStatus.NOT_FOUND,
        undefined,
        SurveysTemplateService.name,
      );
    }
    return res.status(HttpStatus.OK).json(documents);
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
        template: content,
      });
      if (newDocument !== null) {
        filesToDelete.push(fileName);
      }
    });
    await Promise.all(creationPromises);

    await FilesystemService.deleteFiles(path, filesToDelete);
  }

  async toggleIsTemplateActive(fileName: string): Promise<SurveysTemplateDocument | null> {
    return this.surveyTemplateModel.findOneAndUpdate(
      { fileName, isActive: true },
      [{ $set: { isActive: { $not: '$isActive' } } }],
      { new: true, upsert: false },
    );
  }

  async deleteTemplate(fileName: string): Promise<void> {
    try {
      await this.surveyTemplateModel.deleteOne({ fileName });
    } catch {
      throw new CustomHttpException(
        CommonErrorMessages.FILE_DELETION_FAILED,
        HttpStatus.NOT_FOUND,
        undefined,
        SurveysTemplateService.name,
      );
    }
  }
}

export default SurveysTemplateService;
