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

import { Response } from 'express';
import { Connection, Model } from 'mongoose';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { HttpStatus, Injectable, OnModuleInit } from '@nestjs/common';
import { SurveyTemplateDto } from '@libs/survey/types/api/surveyTemplate.dto';
import CommonErrorMessages from '@libs/common/constants/common-error-messages';
import getIsAdmin from '@libs/user/utils/getIsAdmin';
import GlobalSettingsService from 'apps/api/src/global-settings/global-settings.service';
import MigrationService from 'apps/api/src/migration/migration.service';
import { SurveysTemplate, SurveysTemplateDocument } from 'apps/api/src/surveys/surveys-template.schema';
import surveyTemplatesMigrationsList from './migrations/surveyTemplatesMigrationsList';
import CustomHttpException from '../common/CustomHttpException';

@Injectable()
class SurveysTemplateService implements OnModuleInit {
  constructor(
    @InjectConnection() private readonly connection: Connection,
    @InjectModel(SurveysTemplate.name) private surveyTemplateModel: Model<SurveysTemplateDocument>,
    private readonly globalSettingsService: GlobalSettingsService,
  ) {}

  async onModuleInit() {
    const collectionsNamedMigration = await this.connection.db?.listCollections({ name: 'surveystemplates' }).toArray();
    if (collectionsNamedMigration?.length === 0) {
      await this.connection.db?.createCollection('surveystemplates');
    }
    await MigrationService.runMigrations<SurveysTemplateDocument>(
      this.surveyTemplateModel,
      surveyTemplatesMigrationsList,
    );
  }

  async updateOrCreateTemplateDocument(surveyTemplate: SurveyTemplateDto): Promise<SurveysTemplateDocument | null> {
    const { template, name, isActive = true } = surveyTemplate;
    try {
      const templateName = name || template.formula.title;
      return await this.surveyTemplateModel.findOneAndUpdate(
        { name: templateName },
        { template, isActive, name: templateName },
        { new: true, upsert: !name },
      );
    } catch (error) {
      throw new CustomHttpException(
        CommonErrorMessages.DB_ACCESS_FAILED,
        HttpStatus.INTERNAL_SERVER_ERROR,
        undefined,
        SurveysTemplateService.name,
      );
    }
  }

  async getTemplates(ldapGroups: string[], res: Response): Promise<Response> {
    const adminGroups = await this.globalSettingsService.getAdminGroupsFromCache();
    const documents = await this.surveyTemplateModel.find(
      getIsAdmin(ldapGroups, adminGroups) ? {} : { isActive: true },
    );
    return res.status(HttpStatus.OK).json(documents);
  }

  async setIsTemplateActive(name: string, isActive: boolean): Promise<SurveysTemplateDocument | null> {
    return this.surveyTemplateModel.findOneAndUpdate(
      { name },
      { isActive },
      {
        new: true,
        upsert: false,
      },
    );
  }

  async deleteTemplate(name: string): Promise<void> {
    try {
      const defaultTemplate = await this.surveyTemplateModel.findOne({ name, isDefaultTemplate: true });
      if (defaultTemplate) {
        await this.surveyTemplateModel.updateOne({ name }, { isActive: false });
      } else {
        await this.surveyTemplateModel.deleteOne({ name });
      }
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
