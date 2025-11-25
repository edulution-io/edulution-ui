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
import { join } from 'path';
import { pathExists, readdir, readFile, unlink, remove } from 'fs-extra';
import { Logger } from '@nestjs/common';
import APPS from '@libs/appconfig/constants/apps';
import APPS_FILES_PATH from '@libs/common/constants/appsFilesPath';
import { TEMPLATES } from '@libs/survey/constants/surveys-endpoint';
import { TemplateDto } from '@libs/survey/types/api/surveyTemplate.dto';
import { SurveysTemplateDocument } from 'apps/api/src/surveys/surveys-template.schema';
import MigrationService from 'apps/api/src/migration/migration.service';
import { Migration } from '../../migration/migration.type';

const name = '000-migrate-templates-from-exchange-folder-to-db';

const schemaVersion = 1;

const surveyTemplatesMigration000MigrateTemplateFilesToDB: Migration<SurveysTemplateDocument> = {
  name,
  version: schemaVersion,
  execute: async (model: Model<SurveysTemplateDocument>) => {
    const path = join(APPS_FILES_PATH, APPS.SURVEYS, TEMPLATES);

    const exists = await pathExists(path);
    if (!exists) {
      return;
    }

    const includedFiles = await readdir(path);

    const filesToDelete: string[] = [];

    await Promise.all(
      includedFiles.map(async (fileName) => {
        try {
          const filePath = join(path, fileName);
          const fileContent = await readFile(filePath, 'utf-8');
          if (!fileContent) {
            Logger.error(`Failed to read file content from ${filePath}`, MigrationService.name);
            return;
          }
          const newTemplate = JSON.parse(fileContent) as TemplateDto;
          const newDocument: SurveysTemplateDocument | null = await model.findOneAndUpdate(
            { name: fileName },
            { $set: { template: newTemplate, schemaVersion, isActive: true } },
            { new: true, upsert: true },
          );
          if (newDocument !== null) {
            filesToDelete.push(fileName);
          } else {
            Logger.error(`Failed to create or update mongo document for file ${fileName}`, MigrationService.name);
          }
        } catch (error) {
          Logger.error(
            `Error processing file ${fileName}: ${error instanceof Error ? error.message : 'Unknown error'}`,
            MigrationService.name,
          );
        }
      }),
    );

    await Promise.all(
      filesToDelete.map(async (fileName) => {
        try {
          await unlink(join(path, fileName));
        } catch (error) {
          Logger.error(
            `Error deleting file ${fileName}: ${error instanceof Error ? error.message : 'Unknown error'}`,
            MigrationService.name,
          );
        }
      }),
    );

    Logger.log(
      `Migration ${name} completed: Should have migrated ${includedFiles.length} files, and removed ${filesToDelete.length} files.`,
      MigrationService.name,
    );

    const remainingFiles = await readdir(path);
    if (remainingFiles.length === 0) {
      await remove(path);
      Logger.log(`Removed empty templates directory at ${path}`, MigrationService.name);
    }
  },
};

export default surveyTemplatesMigration000MigrateTemplateFilesToDB;
