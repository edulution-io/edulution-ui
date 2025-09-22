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
import APPS from '@libs/appconfig/constants/apps';
import type { Migration } from '../../migration/migration.type';
import type { GlobalSettings, GlobalSettingsDocument } from '../global-settings.schema';

const migration003: Migration<GlobalSettingsDocument> = {
  name: '003-update-default-landing-page',
  version: 3,
  execute: async (model) => {
    const previousSchemaVersion = 4;
    const newSchemaVersion = 5;

    const globalSettings = await model
      .findOne({ schemaVersion: previousSchemaVersion })
      .lean<GlobalSettings & { _id: string }>()
      .exec();

    if (!globalSettings) {
      Logger.debug('No global settings document found with previous schema version, skipping migration.');
      return;
    }
    if (globalSettings.general.defaultLandingPage.isCustomLandingPageEnabled) {
      Logger.debug('Custom landing page already enabled, skipping migration.');
      return;
    }

    Logger.log(`Update global settings document with default landing page settings…`);

    const result = await model.updateOne(
      { _id: globalSettings._id },
      {
        $set: {
          'general.defaultLandingPage': {
            isCustomLandingPageEnabled: true,
            appName: APPS.DASHBOARD,
          },
          schemaVersion: newSchemaVersion,
        },
      },
    );

    Logger.log(`Migration 003 complete: ${result.modifiedCount} document updated.`);
  },
};

export default migration003;
