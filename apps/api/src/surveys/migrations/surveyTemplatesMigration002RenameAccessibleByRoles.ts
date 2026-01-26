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

import { AnyBulkWriteOperation, Model } from 'mongoose';
import { Logger } from '@nestjs/common';
import MultipleSelectorGroup from '@libs/groups/types/multipleSelectorGroup';
import { SurveysTemplateDocument } from 'apps/api/src/surveys/surveys-template.schema';
import MigrationService from 'apps/api/src/migration/migration.service';
import { Migration } from '../../migration/migration.type';

const name = '002-rename-accessibleByRoles-to-accessGroups';

type DeprecatedSurveysTemplateDocument = SurveysTemplateDocument & {
  accessibleByRoles?: MultipleSelectorGroup[];
};

const surveyTemplatesMigration002RenameAccessibleByRoles: Migration<SurveysTemplateDocument> = {
  name,
  version: 2,
  execute: async (model: Model<SurveysTemplateDocument>) => {
    const previousSchemaVersion = 1;
    const newSchemaVersion = 2;
    const unprocessedDocuments = await model.find({ schemaVersion: previousSchemaVersion }).lean();

    Logger.log(
      `Migration "${name}": Found ${unprocessedDocuments.length} documents to process...`,
      MigrationService.name,
    );

    const bulkOperations: AnyBulkWriteOperation<DeprecatedSurveysTemplateDocument>[] = [];
    unprocessedDocuments.forEach((document: DeprecatedSurveysTemplateDocument) => {
      const previousValue: MultipleSelectorGroup[] = document.accessibleByRoles || [];
      bulkOperations.push({
        updateOne: {
          // eslint-disable-next-line no-underscore-dangle
          filter: { _id: document._id },
          update: {
            $set: { accessGroups: previousValue, schemaVersion: newSchemaVersion },
            $unset: { accessibleByRoles: '' },
          },
          upsert: true,
        },
      });
    });

    const result = await model.bulkWrite(bulkOperations, { strict: false });
    Logger.log(`Migration completed: ${result.modifiedCount} documents updated`);
  },
};
export default surveyTemplatesMigration002RenameAccessibleByRoles;
