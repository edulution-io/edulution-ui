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

const surveysTemplateInitialization000LoadDefaultTemplates: Migration<SurveysTemplateDocument> = {
  name,
  version: 1,
  execute: async (model) => {
    const anyExistingDefaultTemplate = await model.findOne({
      name: { $in: list.map((template) => template.name) },
    });
    if (anyExistingDefaultTemplate) {
      Logger.log(`Migration "${name}": Skipped: default templates already exist`);
      return;
    }

    Logger.log(`Migration "${name}": Found ${list.length} documents to process...`);
    await Promise.all(
      list.map(async (surveyTemplate) => {
        try {
          await model.create(surveyTemplate);
        } catch (error) {
          Logger.error(`Migration "${name}": Failed to migrate document ${surveyTemplate.name}:`, error);
        }
      }),
    );
  },
};
export default surveysTemplateInitialization000LoadDefaultTemplates;
