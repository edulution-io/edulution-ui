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
import type { Migration } from '../../migration/migration.type';
import type { GlobalSettings, GlobalSettingsDocument } from '../global-settings.schema';

const migration006: Migration<GlobalSettingsDocument> = {
  name: '006-rename-brand-colors',
  version: 6,
  execute: async (model) => {
    const previousSchemaVersion = 7;
    const newSchemaVersion = 8;

    const globalSettings = await model
      .findOne({ schemaVersion: previousSchemaVersion })
      .lean<GlobalSettings & { _id: string }>()
      .exec();

    if (!globalSettings) {
      Logger.debug(
        'No global settings document found with previous schema version, skipping migration.',
        migration006.name,
      );
      return;
    }

    Logger.log('Renaming theme color fields from brandGreen/brandBlue to ciLightGreen/ciLightBlue...');

    const result = await model.updateOne(
      { _id: globalSettings._id },
      {
        $rename: {
          'theme.light.brandGreen': 'theme.light.ciLightGreen',
          'theme.light.brandBlue': 'theme.light.ciLightBlue',
          'theme.dark.brandGreen': 'theme.dark.ciLightGreen',
          'theme.dark.brandBlue': 'theme.dark.ciLightBlue',
        },
        $set: {
          schemaVersion: newSchemaVersion,
        },
      },
    );

    Logger.log(`Migration 006 complete: ${result.modifiedCount} document updated.`);
  },
};

export default migration006;
