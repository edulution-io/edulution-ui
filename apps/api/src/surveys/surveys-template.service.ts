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

import { Model } from 'mongoose';
import { Response } from 'express';
import { randomUUID } from 'crypto';
import { InjectModel } from '@nestjs/mongoose';
import { HttpStatus, Injectable, OnModuleInit } from '@nestjs/common';
import { SurveyTemplateDto } from '@libs/survey/types/api/surveyTemplate.dto';
import CommonErrorMessages from '@libs/common/constants/common-error-messages';
import getCurrentDateTimeString from '@libs/common/utils/Date/getCurrentDateTimeString';
import getIsAdmin from '@libs/user/utils/getIsAdmin';
import GlobalSettingsService from 'apps/api/src/global-settings/global-settings.service';
import MigrationService from 'apps/api/src/migration/migration.service';
import surveyTemplatesMigrationsList from 'apps/api/src/surveys/migrations/surveyTemplatesMigrationsList';
import { SurveysTemplate, SurveysTemplateDocument } from 'apps/api/src/surveys/surveys-template.schema';
import CustomHttpException from '../common/CustomHttpException';

@Injectable()
class SurveysTemplateService implements OnModuleInit {
  constructor(
    @InjectModel(SurveysTemplate.name) private surveyTemplateModel: Model<SurveysTemplateDocument>,
    private readonly globalSettingsService: GlobalSettingsService,
  ) {}

  async onModuleInit() {
    await MigrationService.runMigrations<SurveysTemplateDocument>(
      this.surveyTemplateModel,
      surveyTemplatesMigrationsList,
    );
  }

  async updateOrCreateTemplateDocument(surveyTemplate: SurveyTemplateDto): Promise<SurveysTemplateDocument | null> {
    const { template, isActive = true, name = `${getCurrentDateTimeString()}_-_${randomUUID()}` } = surveyTemplate;
    try {
      return await this.surveyTemplateModel.findOneAndUpdate(
        { name },
        { template, isActive, name },
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
    const adminGroups = await this.globalSettingsService.getAdminGroupsFromCache();
    const documents = await this.surveyTemplateModel.find(
      getIsAdmin(ldapGroups, adminGroups) ? {} : { isActive: true },
    );
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

  async toggleIsTemplateActive(name: string): Promise<SurveysTemplateDocument | null> {
    return this.surveyTemplateModel.findOneAndUpdate(
      { name, isActive: true },
      [{ $set: { isActive: { $not: '$isActive' } } }],
      { new: true, upsert: false },
    );
  }

  async deleteTemplate(name: string): Promise<void> {
    try {
      await this.surveyTemplateModel.deleteOne({ name });
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
