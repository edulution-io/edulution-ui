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

import { Logger } from '@nestjs/common';
import { ALL_DISPLAY_LOCATIONS } from '@libs/appconfig/constants/appDisplayLocations';
import { Migration } from '../../migration/migration.type';
import { AppConfig } from '../appconfig.schema';

const migration009: Migration<AppConfig> = {
  name: '009-add-display-locations',
  version: 9,
  execute: async (model) => {
    const previousSchemaVersion = 9;
    const newSchemaVersion = 10;

    const unprocessedDocuments = await model.find({ schemaVersion: previousSchemaVersion }).exec();
    if (unprocessedDocuments.length === 0) {
      return;
    }

    Logger.log(`${unprocessedDocuments.length} documents to update...`);

    const updateResults = await model.updateMany(
      { schemaVersion: previousSchemaVersion },
      {
        $set: {
          displayLocations: ALL_DISPLAY_LOCATIONS,
          schemaVersion: newSchemaVersion,
        },
      },
    );

    Logger.log(`Migration completed: ${updateResults.modifiedCount} documents updated`);
  },
};

export default migration009;
