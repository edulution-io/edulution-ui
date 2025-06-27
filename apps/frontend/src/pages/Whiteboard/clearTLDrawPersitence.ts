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

const clearTLDrawPersistence = async (key: string) => {
  localStorage.removeItem('TLDRAW_USER_DATA_v3');
  localStorage.removeItem('TLDRAW_DB_NAME_INDEX_v2');

  const dbs = await indexedDB.databases();

  dbs
    .filter((db) => db.name?.includes(key))
    .forEach((db) => {
      if (db.name) {
        indexedDB.deleteDatabase(db.name);
      }
    });
};

export default clearTLDrawPersistence;
