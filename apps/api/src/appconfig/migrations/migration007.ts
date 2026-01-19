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
import APPS from '@libs/appconfig/constants/apps';
import { DashboardIcon } from '@libs/assets';
import getImageUrl from '@libs/assets/getImageUrl';
import { Migration } from '../../migration/migration.type';
import { AppConfig } from '../appconfig.schema';

const migration007: Migration<AppConfig> = {
  name: '007-fix-dashboard-icon',
  version: 8,
  execute: async (model) => {
    const previousSchemaVersion = 7;
    const newSchemaVersion = 8;

    const unprocessedDocuments = await model.find({ schemaVersion: previousSchemaVersion }).exec();
    if (unprocessedDocuments.length === 0) {
      return;
    }

    Logger.log(`${unprocessedDocuments.length} documents to update...`);

    const dashboardUpdateResult = await model.updateOne(
      { name: APPS.DASHBOARD },
      { $set: { icon: getImageUrl(DashboardIcon) } },
    );

    if (dashboardUpdateResult.modifiedCount > 0) {
      Logger.log('Dashboard icon updated successfully');
    }

    const schemaUpdateResults = await model.updateMany(
      { schemaVersion: previousSchemaVersion },
      { $set: { schemaVersion: newSchemaVersion } },
    );

    Logger.log(`Migration completed: ${schemaUpdateResults.modifiedCount} documents updated`);
  },
};

export default migration007;
