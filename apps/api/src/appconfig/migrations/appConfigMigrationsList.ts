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

import migration000 from './migration000';
import migration001 from './migration001';
import migration002 from './migration002';
import migration003 from './migration003';
import migration004 from './migration004';

// Add new migrations here
const appConfigMigrationsList = [migration000, migration001, migration002, migration003, migration004];

export default appConfigMigrationsList;
