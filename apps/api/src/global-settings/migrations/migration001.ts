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
import getDeploymentTarget from '@libs/common/utils/getDeploymentTarget';
import { Migration } from '../../migration/migration.type';
import { GlobalSettingsDocument } from '../global-settings.schema';

const migration001: Migration<GlobalSettingsDocument> = {
  name: '001-add-deploymentTarget',
  version: 1,
  execute: async (model) => {
    const previousSchemaVersion = 2;
    const newSchemaVersion = 3;

    const unprocessedDocuments = await model.find({ schemaVersion: previousSchemaVersion });
    if (unprocessedDocuments.length === 0) {
      return;
    }
    Logger.log(`${unprocessedDocuments?.length} documents to update...`);

    // eslint-disable-next-line no-underscore-dangle
    const ids = unprocessedDocuments.map((doc) => doc._id);

    const result = await model.updateMany(
      { _id: { $in: ids } },
      {
        $set: {
          'general.deploymentTarget': getDeploymentTarget(),
          schemaVersion: newSchemaVersion,
        },
      },
    );

    Logger.log(`Migration completed: ${result.modifiedCount} documents updated`);
  },
};

export default migration001;
