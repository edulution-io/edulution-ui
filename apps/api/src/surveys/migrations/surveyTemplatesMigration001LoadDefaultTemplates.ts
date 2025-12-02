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

import { Logger } from '@nestjs/common';
import {
  Praktikumsplatz,
  ElternAbend,
  Elternbrief,
  TeilnahmeVeranstaltungLimitiert,
  Vortragsthema,
} from '@libs/survey/constants/templates/index';
import { SurveysTemplateDocument } from 'apps/api/src/surveys/surveys-template.schema';
import { Migration } from '../../migration/migration.type';

const list = [Praktikumsplatz, ElternAbend, Elternbrief, TeilnahmeVeranstaltungLimitiert, Vortragsthema];

const name = '001-load-the-default-survey-templates';

const surveyTemplatesMigration001LoadDefaultTemplates: Migration<SurveysTemplateDocument> = {
  name,
  version: 1,
  execute: async (model) => {
    Logger.log(`Migration "${name}": Found ${list.length} documents to process...`);
    await Promise.all(
      list.map(async (surveyTemplate) => {
        const existingTemplate = await model.findOne({ name: surveyTemplate.name, isDefaultTemplate: true });
        if (existingTemplate && existingTemplate.schemaVersion >= surveyTemplate.schemaVersion) {
          Logger.warn(
            `Migration "${name}": Skipped: default template "${surveyTemplate.name}" already exists with same or higher schema version`,
          );
          return;
        }
        await model.updateOne(
          { name: surveyTemplate.name, isDefaultTemplate: true },
          { ...surveyTemplate, isDefaultTemplate: true, isActive: existingTemplate?.isActive ?? true },
          { new: true, upsert: true },
        );
        Logger.log(`Migration "${name}": Created default template "${surveyTemplate.name}"`);
      }),
    );
  },
};
export default surveyTemplatesMigration001LoadDefaultTemplates;
