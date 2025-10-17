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

import { Model } from 'mongoose';
import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { InjectModel } from '@nestjs/mongoose';
import { HttpStatus, Injectable, OnModuleInit } from '@nestjs/common';
import CommonErrorMessages from '@libs/common/constants/common-error-messages';
import getCurrentDateTimeString from '@libs/common/utils/Date/getCurrentDateTimeString';
import SURVEY_TEMPLATES_EXCHANGE_PATH from '@libs/survey/constants/surveyTemplatesExchangePath';
import { SurveyTemplateDto } from '@libs/survey/types/api/surveyTemplate.dto';
import getIsAdmin from '@libs/user/utils/getIsAdmin';
import MigrationService from 'apps/api/src/migration/migration.service';
import surveyTemplatesMigrationsList from 'apps/api/src/surveys/migrations/surveyTemplatesMigrationsList';
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
    await this.fileSystemService.ensureDirectoryExists(SURVEY_TEMPLATES_EXCHANGE_PATH);
    await MigrationService.runMigrations<SurveysTemplateDocument>(
      this.surveyTemplateModel,
      surveyTemplatesMigrationsList,
    );
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
