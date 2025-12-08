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
import type { Migration } from '../../migration/migration.type';
import type { GlobalSettingsDocument } from '../global-settings.schema';

const { LDAP_EDULUTION_BINDUSER_DN, LDAP_EDULUTION_BINDUSER_PASSWORD } = process.env as Record<string, string>;

const migration002: Migration<GlobalSettingsDocument> = {
  name: '002-add-ldap-settings',
  version: 2,
  execute: async (model) => {
    const previousSchemaVersion = 3;
    const newSchemaVersion = 4;

    const docs = await model.find({ schemaVersion: previousSchemaVersion });
    if (docs.length === 0) {
      return;
    }

    Logger.log(`${docs.length} document(s) to update with LDAP settings…`);

    // eslint-disable-next-line no-underscore-dangle
    const ids = docs.map((doc) => doc._id);

    const result = await model.updateMany(
      { _id: { $in: ids } },
      {
        $set: {
          'general.ldap.binduser.dn': LDAP_EDULUTION_BINDUSER_DN || '',
          'general.ldap.binduser.password': LDAP_EDULUTION_BINDUSER_PASSWORD || '',
          schemaVersion: newSchemaVersion,
        },
      },
    );

    Logger.log(`Migration 002 complete: ${result.modifiedCount} document(s) updated.`);
  },
};

export default migration002;
