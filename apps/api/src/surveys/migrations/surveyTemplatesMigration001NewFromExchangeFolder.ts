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
import { pathExists, readdir, readFile, unlink } from 'fs-extra';
import { Logger } from '@nestjs/common';
import { TemplateDto } from '@libs/survey/types/api/surveyTemplate.dto';
import SURVEY_TEMPLATES_EXCHANGE_PATH from '@libs/survey/constants/surveyTemplatesExchangePath';
import { SurveysTemplateDocument } from 'apps/api/src/surveys/surveys-template.schema';
import MigrationService from 'apps/api/src/migration/migration.service';
import { Migration } from '../../migration/migration.type';

const name = '001-migrate-templates-from-exchange-folder-to-db';
const schemaVersion = 1;

const surveyTemplatesMigration001NewFromExchangeFolder: Migration<SurveysTemplateDocument> = {
  name,
  version: 1,
  execute: async (model) => {
    const path = SURVEY_TEMPLATES_EXCHANGE_PATH;
    const exists = await pathExists(path);
    if (!exists) {
      Logger.log(`Migration "${name}": Skipped: exchange folder does not exist at path ${path}`, MigrationService.name);
      return;
    }
    const includedFiles = await readdir(path);
    Logger.log(`Migration "${name}": Found ${includedFiles.length} files to migrate...`, MigrationService.name);

    let processedCount = 0;
    const filesToDelete: string[] = [];
    await Promise.all(
      includedFiles.map(async (fileName) => {
        try {
          const filePath = join(path, fileName);
          const fileContent = await readFile(filePath, 'utf-8');
          if (!fileContent) {
            throw new Error(`Failed to read file content from ${filePath}`);
          }
          const newTemplate = JSON.parse(fileContent) as TemplateDto;
          const newDocument: SurveysTemplateDocument | null = await model.findOneAndUpdate(
            { fileName },
            { $set: { template: newTemplate, schemaVersion } },
            { new: true, upsert: true },
          );
          if (newDocument !== null) {
            processedCount += 1;
            filesToDelete.push(fileName);
          } else {
            throw new Error(`Failed to create or update mongo document for file ${fileName}`);
          }
        } catch (error) {
          Logger.error(
            `Migration "${name}": Error processing file ${fileName}: ${error instanceof Error ? error.message : 'Unknown error'}`,
            MigrationService.name,
          );
        }
      }),
    );

    let deletedCount = 0;
    await Promise.all(
      filesToDelete.map(async (fileName) => {
        try {
          await unlink(join(path, fileName));
          deletedCount += 1;
        } catch (error) {
          Logger.error(
            `Migration "${name}": Error deleting file ${fileName}: ${error instanceof Error ? error.message : 'Unknown error'}`,
            MigrationService.name,
          );
        }
      }),
    );

    if (processedCount > 0 || deletedCount > 0) {
      Logger.log(
        `Migration "${name}": Completed: ${processedCount} files migrated and removed ${deletedCount} files successfully.`,
        MigrationService.name,
      );
    }
  },
};

export default surveyTemplatesMigration001NewFromExchangeFolder;
