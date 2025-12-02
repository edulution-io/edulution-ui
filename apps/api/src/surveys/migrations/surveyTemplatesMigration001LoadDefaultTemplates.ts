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
