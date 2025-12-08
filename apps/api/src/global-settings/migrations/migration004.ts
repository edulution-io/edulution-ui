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
