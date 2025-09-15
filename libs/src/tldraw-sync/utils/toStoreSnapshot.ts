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

import { SerializedSchema, StoreSnapshot, TLRecord } from 'tldraw';
import type { TldrFileV1 } from './isTldrFileV1';

const toStoreSnapshot = (file: TldrFileV1): StoreSnapshot<TLRecord> => {
  const store = file.records.reduce<Record<string, TLRecord>>((acc, record) => {
    acc[record.id] = record;
    return acc;
  }, {});
  const schema: SerializedSchema = { schemaVersion: 2, sequences: file.schema.sequences };
  return { schema, store };
};

export default toStoreSnapshot;
