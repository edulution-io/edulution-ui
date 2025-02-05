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

interface Action {
  type: 0 | 1 | 2;
  userid: string;
}

interface ChangeHistory {
  changeId: string;
  timestamp: string;
}

interface History {
  changes: ChangeHistory[];
  serverVersion: string;
}

interface OnlyOfficeCallbackData {
  actions?: Action[];
  changeshistory?: ChangeHistory[];
  changesurl?: string;
  filetype?: string;
  forcesavetype?: 0 | 1 | 2 | 3;
  formsdataurl?: string;
  history?: History;
  key: string;
  status: 1 | 2 | 3 | 4 | 6 | 7;
  url: string;
  userdata?: string;
  users?: string[];
}

export default OnlyOfficeCallbackData;
