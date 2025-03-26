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

const BULLETIN_BOARD_EDITORIAL_TABLE_COLUMNS = {
  NAME: 'name',
  CATEGORY: 'category',
  IS_ACTIVE: 'isActive',
  IS_VISIBLE_START_DATE: 'isVisibleStartDate',
  IS_VISIBLE_END_DATE: 'isVisibleEndDate',
} as const;

export default BULLETIN_BOARD_EDITORIAL_TABLE_COLUMNS;
