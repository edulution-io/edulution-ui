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

import { StoreSnapshot, TLPageId, TLRecord } from 'tldraw';

const firstPageIdFrom = (snapshot: StoreSnapshot<TLRecord>): TLPageId | null => {
  const pages = Object.values(snapshot.store).filter(
    (record): record is TLRecord & { typeName: 'page' } => record.typeName === 'page',
  );
  return pages[0]?.id ?? null;
};

export default firstPageIdFrom;
