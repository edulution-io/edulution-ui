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

/* eslint-disable no-underscore-dangle */
import { Logger } from '@nestjs/common';
import DEFAULT_THEME from '@libs/global-settings/constants/defaultTheme';
import type { Migration } from '../../migration/migration.type';
import type { GlobalSettings, GlobalSettingsDocument } from '../global-settings.schema';

const migration005: Migration<GlobalSettingsDocument> = {
  name: '005-populate-theme',
  version: 5,
  execute: async (model) => {
    const previousSchemaVersion = 6;
    const newSchemaVersion = 7;

    const globalSettings = await model
      .findOne({ schemaVersion: previousSchemaVersion })
      .lean<GlobalSettings & { _id: string }>()
      .exec();

    if (!globalSettings) {
      Logger.debug(
        'No global settings document found with previous schema version, skipping migration.',
        migration005.name,
      );
      return;
    }

    if (globalSettings.theme) {
      Logger.debug('Theme already defined, updating schema version only.', migration005.name);
      await model.updateOne(
        { _id: globalSettings._id },
        {
          $set: {
            schemaVersion: newSchemaVersion,
          },
        },
      );
      return;
    }

    Logger.log('Populating theme field with default values...');

    const result = await model.updateOne(
      { _id: globalSettings._id },
      {
        $set: {
          theme: DEFAULT_THEME,
          schemaVersion: newSchemaVersion,
        },
      },
    );

    Logger.log(`Migration 005 complete: ${result.modifiedCount} document updated.`);
  },
};

export default migration005;
