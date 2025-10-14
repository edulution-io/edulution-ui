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

const name = '000-load-the-default-survey-templates';

const surveysTemplateMigration000DefaultTemplates: Migration<SurveysTemplateDocument> = {
  name,
  version: 1,
  execute: async (model) => {
    const anyExistingDefaultTemplate = await model.findOne({
      fileName: { $in: list.map((template) => template.fileName) },
    });
    if (anyExistingDefaultTemplate) {
      Logger.log(`Migration ${name} skipped: default templates already exist`);
      return;
    }

    Logger.log(`Found ${list.length} documents to process...`);

    let processedCount = 0;
    await Promise.all(
      list.map(async (surveyTemplate) => {
        try {
          await model.create(surveyTemplate);
          processedCount += 1;
        } catch (error) {
          Logger.error(`Failed to migrate document ${surveyTemplate.fileName}:`, error);
        }
      }),
    );

    if (processedCount > 0) {
      Logger.log(`Migration ${name} completed: ${processedCount} documents migrated`);
    }
  },
};

export default surveysTemplateMigration000DefaultTemplates;
