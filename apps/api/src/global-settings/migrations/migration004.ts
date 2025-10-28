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
import MultipleSelectorGroup from '@libs/groups/types/multipleSelectorGroup';
import type { Migration } from '../../migration/migration.type';
import type { GlobalSettings, GlobalSettingsDocument } from '../global-settings.schema';

const initialAdminGroups = process.env.EDUI_INITIAL_ADMIN_GROUP;

const migration004: Migration<GlobalSettingsDocument> = {
  name: '004-add-adminGroups',
  version: 4,
  execute: async (model) => {
    const previousSchemaVersion = 5;
    const newSchemaVersion = 6;

    const globalSettings = await model
      .findOne({ schemaVersion: previousSchemaVersion })
      .lean<GlobalSettings & { _id: string }>()
      .exec();

    if (!globalSettings) {
      Logger.debug(
        'No global settings document found with previous schema version, skipping migration.',
        migration004.name,
      );
      return;
    }
    if (globalSettings.auth.adminGroups) {
      Logger.debug('adminGroups still defined.', migration004.name);
      return;
    }

    let adminGroups: MultipleSelectorGroup[] = [];
    if (initialAdminGroups) {
      Logger.log(`Update global settings document with initial adminGroups…`);
      const normalizedGroup = initialAdminGroups.replace(/^\/+/, '');
      adminGroups = [
        {
          id: '',
          name: normalizedGroup,
          path: `/${normalizedGroup}`,
          label: normalizedGroup,
          value: '',
        },
      ];
    } else {
      Logger.log(`Update global settings document with empty array…`);
      adminGroups = [];
    }

    const result = await model.updateOne(
      { _id: globalSettings._id },
      {
        $set: {
          'auth.adminGroups': adminGroups,
          schemaVersion: newSchemaVersion,
        },
      },
    );

    Logger.log(`Migration 004 complete: ${result.modifiedCount} document updated.`);
  },
};

export default migration004;
