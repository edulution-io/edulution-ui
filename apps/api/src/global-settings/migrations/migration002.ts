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
